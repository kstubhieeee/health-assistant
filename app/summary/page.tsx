"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileSearch, 
  RefreshCcw, 
  Download, 
  Sparkles,
  Bot
} from "lucide-react";
import PatientLayout from "@/components/patient-layout";
import ReactMarkdown from "react-markdown";

interface TranscriptFile {
  name: string;
  path: string;
  createdAt: Date;
  size: number;
}

interface TranscriptContent {
  content: string;
  summary: string;
}

export default function SummaryPage() {
  const [transcripts, setTranscripts] = useState<TranscriptFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptFile | null>(null);
  const [transcriptContent, setTranscriptContent] = useState<TranscriptContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [generateSummary, setGenerateSummary] = useState(false);

  // Fetch transcripts from the specified folder
  useEffect(() => {
    async function fetchTranscripts() {
      try {
        const response = await fetch('/api/transcripts/list');
        if (!response.ok) throw new Error('Failed to fetch transcripts');
        const data = await response.json();
        setTranscripts(data.files);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTranscripts();
  }, []);

  // Load transcript content when selected
  useEffect(() => {
    if (!selectedTranscript) return;

    async function loadTranscriptContent() {
      setLoadingContent(true);
      try {
        const response = await fetch(`/api/transcripts/content?fileName=${encodeURIComponent(selectedTranscript!.name)}`);
        if (!response.ok) throw new Error('Failed to load transcript content');
        const data = await response.json();
        setTranscriptContent(data);
      } catch (error) {
        console.error('Error loading transcript content:', error);
        setTranscriptContent(null);
      } finally {
        setLoadingContent(false);
      }
    }

    loadTranscriptContent();
  }, [selectedTranscript]);

  // Generate AI summary
  const handleGenerateSummary = async () => {
    if (!selectedTranscript || !transcriptContent) return;
    
    setGenerateSummary(true);
    try {
      const response = await fetch('/api/transcripts/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: transcriptContent.content 
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      setTranscriptContent(prev => ({
        ...prev!,
        summary: data.summary
      }));
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setGenerateSummary(false);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <PatientLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Consultation Transcripts</h2>
          <Button onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Transcript list sidebar */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Your Transcripts</CardTitle>
              <CardDescription>Conversations with your doctor</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : transcripts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No transcripts found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {transcripts.map((transcript) => (
                    <div 
                      key={transcript.name}
                      className={`p-3 rounded-md cursor-pointer hover:bg-secondary transition-colors ${
                        selectedTranscript?.name === transcript.name ? 'bg-secondary' : ''
                      }`}
                      onClick={() => setSelectedTranscript(transcript)}
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="truncate flex-1 min-w-0 text-sm font-medium">
                          {transcript.name}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(transcript.createdAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(transcript.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Transcript viewer */}
          <div className="md:col-span-9">
            {!selectedTranscript ? (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <FileSearch className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No Transcript Selected</h3>
                  <p className="text-muted-foreground">
                    Select a transcript from the list to view its contents
                  </p>
                </div>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedTranscript.name}</CardTitle>
                      <CardDescription>
                        {formatDate(selectedTranscript.createdAt)}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingContent ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <Tabs defaultValue="transcript">
                      <TabsList>
                        <TabsTrigger value="transcript">
                          <FileText className="h-4 w-4 mr-2" />
                          Transcript
                        </TabsTrigger>
                        <TabsTrigger value="summary">
                          <Bot className="h-4 w-4 mr-2" />
                          AI Summary
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="transcript" className="pt-4">
                        <div className="border rounded-md p-4 bg-card">
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {transcriptContent?.content || "No content available"}
                          </pre>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="summary" className="pt-4">
                        <div className="border rounded-md p-4 mb-4 bg-card/50">
                          {transcriptContent?.summary ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown>
                                {transcriptContent.summary}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                              <h3 className="text-lg font-medium mb-2">No Summary Available</h3>
                              <p className="text-muted-foreground mb-4">
                                Generate an AI summary of this consultation transcript
                              </p>
                              <Button onClick={handleGenerateSummary} disabled={generateSummary}>
                                {generateSummary ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Summary
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
