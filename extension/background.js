const timeFormat = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message.type)

    if (message.type == "new_meeting_started") {
        // Saving current tab id, to download transcript when this tab is closed
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const tabId = tabs[0].id
            chrome.storage.local.set({ meetingTabId: tabId }, function () {
                console.log("Meeting tab id saved")
            })
        })
    }

    if (message.type == "meeting_ended") {
        downloadAndPostWebhook().finally(() => {
            // Invalidate tab id since transcript is downloaded, prevents double downloading of transcript from tab closed event listener
            clearTabIdAndApplyUpdate()
        })
    }

    if (message.type == "download_transcript_at_index") {
        // Download the requested item
        downloadTranscript(message.index, false).then(() => {
            sendResponse({ success: true })
        })
    }

    if (message.type == "retry_webhook_at_index") {
        // Handle webhook retry
        postTranscriptToWebhook(message.index)
            .then(() => {
                sendResponse({ success: true })
            })
            .catch(error => {
                console.error("Webhook retry failed:", error)
                sendResponse({ success: false, error: error.message })
            })
    }

    if (message.type == "recover_last_meeting") {
        downloadAndPostWebhook().then(() => {
            sendResponse({ success: true })
        }).catch((error) => {
            // Fails if transcript is empty or webhook request fails
            console.error("Recovery process failed:", error)
            sendResponse({ success: false, error: error.message })
        })
    }
    return true
})

// Download transcript if meeting tab is closed
chrome.tabs.onRemoved.addListener(function (tabid) {
    chrome.storage.local.get(["meetingTabId"], function (data) {
        if (tabid == data.meetingTabId) {
            console.log("Successfully intercepted tab close")

            downloadAndPostWebhook().finally(() => {
                // Clearing meetingTabId to prevent misfires of onRemoved until next meeting actually starts
                clearTabIdAndApplyUpdate()
            })
        }
    })
})

// Listen for extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
    // Check if there is an active meeting
    chrome.storage.local.get(["meetingTabId"], function (result) {
        if (result.meetingTabId) {
            // There is an active meeting, defer the update
            chrome.storage.local.set({ isDeferredUpdatedAvailable: true }, function () {
                console.log("Deferred update flag set")
            })
        } else {
            // No active meeting, apply the update immediately. Meeting tab id is invalidated only post meeting operations are done, so no race conditions.
            console.log("No active meeting, applying update immediately")
            chrome.runtime.reload()
        }
    })
})

// Download transcripts, post webhook if URL is enabled and available
// Fails if transcript is empty or webhook request fails
function downloadAndPostWebhook() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["transcript", "chatMessages"], function (resultLocal) {
            // Check if at least one of transcript or chatMessages exist. To prevent downloading empty transcripts.
            if ((resultLocal.transcript != "") || (resultLocal.chatMessages != "")) {
                processTranscript().then(() => {
                    chrome.storage.local.get(["meetings"], function (resultLocal) {
                        chrome.storage.sync.get(["webhookUrl", "autoPostWebhookAfterMeeting"], function (resultSync) {
                            // Create an array of promises to execute in parallel
                            const promises = []

                            // Promise to download transcript
                            const lastIndex = resultLocal.meetings.length - 1
                            promises.push([
                                downloadTranscript(
                                    lastIndex,
                                    resultSync.webhookUrl && resultSync.autoPostWebhookAfterMeeting ? true : false
                                )
                            ])

                            // Promise to post webhook if enabled
                            if (resultSync.autoPostWebhookAfterMeeting && resultSync.webhookUrl) {
                                promises.push(postTranscriptToWebhook(lastIndex))
                            }

                            // Execute all promises in parallel
                            // First promise will always resolve, second one will fail if webhook request fails
                            Promise.all(promises)
                                .then(() => {
                                    resolve()
                                })
                                .catch(error => {
                                    console.error("Operation failed:", error)
                                    reject(error)
                                })
                        })
                    })
                })
            }
            else {
                reject("Empty transcript and empty chatMessages")
            }
        })
    })
}

// Process transcript and chat messages of the meeting that just ended from storage, format them into strings, and save as a new entry in meetings (keeping last 10)
function processTranscript() {
    return new Promise((resolve) => {
        chrome.storage.local.get([
            "transcript",
            "chatMessages",
            "meetingTitle",
            "meetingStartTimestamp",
            // Old name of meetingStartTimestamp
            "meetingStartTimeStamp"
        ], function (result) {

            // Create new transcript entry
            const newMeetingEntry = {
                title: result.meetingTitle || "Google Meet call",
                // Backward compatible chrome storage variable. Old name "meetingStartTimeStamp". 
                meetingStartTimestamp: result.meetingStartTimestamp || result.meetingStartTimeStamp,
                meetingEndTimestamp: Date.now(),
                // Backward compatible chrome storage variable transcript. One of the keys is changed from "personTranscript" to "transcriptText"
                transcript: result.transcript,
                chatMessages: result.chatMessages,
                webhookPostStatus: "new"
            }

            // Get existing recent transcripts and update
            chrome.storage.local.get(["meetings"], function (storageData) {
                let meetings = storageData.meetings || []
                meetings.push(newMeetingEntry)

                // Keep only last 10 transcripts
                if (meetings.length > 10) {
                    meetings = meetings.slice(-10)
                }

                // Save updated recent transcripts
                chrome.storage.local.set({ meetings: meetings }, function () {
                    console.log("Meeting data updated")
                    resolve()
                })
            })
        })
    })
}



function downloadTranscript(index, webhookEnabled) {
    return new Promise((resolve) => {
        chrome.storage.local.get(["meetings"], function (result) {
            if (result.meetings && result.meetings[index]) {
                const meeting = result.meetings[index]

                // Sanitize meeting title for file name to avoid invalid character errors
                const sanitisedMeetingTitle = meeting.title.replace(/[\\/:*?"<>|]/g, "_")
                
                // Format timestamp for file name
                const formattedTimestamp = new Date(meeting.meetingStartTimestamp).toLocaleString("default", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }).replace(/[/:]/g, "-").replace(",", "")

                const fileName = `ARISE/Transcript-${sanitisedMeetingTitle} at ${formattedTimestamp}.txt`


                // Format transcript and chatMessages content
                let content = getTranscriptString(meeting.transcript)
                
                // Add chat messages without separator
                if (meeting.chatMessages && meeting.chatMessages.length > 0) {
                    content += "\n\n"
                    content += getChatMessagesString(meeting.chatMessages)
                }

                const blob = new Blob([content], { type: "text/plain" })

                // Read the blob as a data URL
                const reader = new FileReader()

                // Read the blob and download as text file
                reader.readAsDataURL(blob)

                // Download once blob is read
                reader.onload = function (event) {
                    const dataUrl = event.target.result

                    // Create a download with Chrome Download API
                    chrome.downloads.download({
                        url: dataUrl,
                        filename: fileName,
                        conflictAction: "uniquify"
                    }).then(() => {
                        console.log("Transcript downloaded")
                        // Increment anonymous transcript generated count to a Google sheet
                        fetch(`https://script.google.com/macros/s/AKfycbzUk-q3N8_BWjwE90g9HXs5im1pYFriydKi1m9FoxEmMrWhK8afrHSmYnwYcw6AkH14eg/exec?version=${chrome.runtime.getManifest().version}&webhookEnabled=${webhookEnabled}`, {
                            mode: "no-cors"
                        })
                        resolve()
                    }).catch((err) => {
                        console.error(err)
                        chrome.downloads.download({
                            url: dataUrl,
                            filename: "ARISE/Transcript.txt",
                            conflictAction: "uniquify"
                        })
                        console.log("Invalid file name. Transcript downloaded to ARISE directory with simple file name.")
                        // Logs anonymous errors to a Google sheet for swift debugging   
                        fetch(`https://script.google.com/macros/s/AKfycbxiyQSDmJuC2onXL7pKjXgELK1vA3aLGZL5_BLjzCp7fMoQ8opTzJBNfEHQX_QIzZ-j4Q/exec?version=${chrome.runtime.getManifest().version}&code=009&error=${encodeURIComponent(err)}`, { mode: "no-cors" })
                        // Increment anonymous transcript generated count to a Google sheet
                        fetch(`https://script.google.com/macros/s/AKfycbzUk-q3N8_BWjwE90g9HXs5im1pYFriydKi1m9FoxEmMrWhK8afrHSmYnwYcw6AkH14eg/exec?version=${chrome.runtime.getManifest().version}&webhookEnabled=${webhookEnabled}`, {
                            mode: "no-cors"
                        })
                        resolve()
                    })
                }
            }
        })
    })
}

// Post transcript to webhook
function postTranscriptToWebhook(index) {
    return new Promise((resolve, reject) => {
        // Get webhook URL and meetings
        chrome.storage.local.get(["meetings"], function (resultLocal) {
            chrome.storage.sync.get(["webhookUrl", "webhookBodyType"], function (resultSync) {
                if (!resultSync.webhookUrl) {
                    reject(new Error("No webhook URL configured"))
                    return
                }

                if (!resultLocal.meetings || !resultLocal.meetings[index]) {
                    reject(new Error("Transcript not found"))
                    return
                }

                const meeting = resultLocal.meetings[index]

                let webhookData
                if (resultSync.webhookBodyType === "advanced") {
                    webhookData = {
                        meetingTitle: meeting.title,
                        meetingStartTimestamp: new Date(meeting.meetingStartTimestamp).toISOString(),
                        meetingEndTimestamp: new Date(meeting.meetingEndTimestamp).toISOString(),
                        transcript: meeting.transcript,
                        chatMessages: meeting.chatMessages
                    }
                }
                else {
                    webhookData = {
                        meetingTitle: meeting.title,
                        meetingStartTimestamp: new Date(meeting.meetingStartTimestamp).toLocaleString("default", timeFormat).toUpperCase(),
                        meetingEndTimestamp: new Date(meeting.meetingEndTimestamp).toLocaleString("default", timeFormat).toUpperCase(),
                        transcript: getTranscriptString(meeting.transcript),
                        chatMessages: getChatMessagesString(meeting.chatMessages)
                    }
                }

                // Post to webhook
                fetch(resultSync.webhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(webhookData)
                }).then(response => {
                    if (!response.ok) {
                        throw new Error("Webhook request failed")
                    }
                }).then(() => {
                    // Update success status
                    resultLocal.meetings[index].webhookPostStatus = "successful"
                    chrome.storage.local.set({ meetings: resultLocal.meetings }, function () {
                        resolve()
                    })
                }).catch(error => {
                    console.error(error)
                    // Update failure status
                    resultLocal.meetings[index].webhookPostStatus = "failed"
                    chrome.storage.local.set({ meetings: resultLocal.meetings }, function () {
                        // Create notification and open webhooks page
                        chrome.notifications.create({
                            type: "basic",
                            iconUrl: "icon.png",
                            title: "Could not post webhook!",
                            message: "Click to view status and retry or check URL"
                        }, function (notificationId) {
                            // Handle notification click
                            chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
                                if (clickedNotificationId === notificationId) {
                                    chrome.tabs.create({ url: "webhooks.html" })
                                }
                            })
                        })

                        reject(error)
                    })
                })
            })
        })
    })
}

function getTranscriptString(transcript) {
    // Format transcript entries into string
    let transcriptString = ""
    if (transcript.length > 0) {
        transcript.forEach(transcriptBlock => {
            transcriptString += `${transcriptBlock.personName} (${new Date(transcriptBlock.timestamp).toLocaleString("default", timeFormat).toUpperCase()})\n`
            // Backward compatible key.  Old name "personTranscript".
            transcriptString += transcriptBlock.transcriptText || transcriptBlock.personTranscript
            transcriptString += "\n\n"
        })
        return transcriptString
    }
    return transcriptString
}

function getChatMessagesString(chatMessages) {
    // Format chat messages into string
    let chatMessagesString = ""
    if (chatMessages.length > 0) {
        chatMessages.forEach(chatBlock => {
            chatMessagesString += `${chatBlock.personName} (${new Date(chatBlock.timestamp).toLocaleString("default", timeFormat).toUpperCase()})\n`
            chatMessagesString += chatBlock.chatMessageText
            chatMessagesString += "\n\n"
        })
    }
    return chatMessagesString
}

function clearTabIdAndApplyUpdate() {
    chrome.storage.local.set({ meetingTabId: null }, function () {
        console.log("Meeting tab id cleared for next meeting")

        // Check if there's a deferred update
        chrome.storage.local.get(["isDeferredUpdatedAvailable"], function (result) {
            if (result.isDeferredUpdatedAvailable) {
                console.log("Applying deferred update")
                chrome.storage.local.set({ isDeferredUpdatedAvailable: false }, function () {
                    chrome.runtime.reload()
                })
            }
        })
    })
}