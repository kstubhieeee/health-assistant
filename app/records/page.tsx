"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ClipboardCheck, 
  AlertTriangle, 
  FileText, 
  FilePlus2, 
  Upload, 
  File, 
  X, 
  Download,
  FileIcon,
  Trash2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PatientLayout from "@/components/patient-layout";

// Define interface for file record
interface FileRecord {
  id: string;
  name: string;
  displayName: string;
  url: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  category?: string;
}

export default function MedicalRecordsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
        } else {
          // Redirect to login if not authenticated
          router.push("/auth/signin");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/auth/signin");
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Fetch the user's files
  useEffect(() => {
    const fetchFiles = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await fetch("/api/records/list");
        
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        
        const data = await response.json();
        setFiles(data.files || []);
      } catch (error: any) {
        console.error("Error fetching files:", error);
        setError(error.message || "Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    if (!authChecking && isAuthenticated) {
      fetchFiles();
    }
  }, [isAuthenticated, authChecking]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Simulate progress (in a real app, we'd use actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 100);
      
      // Upload the file
      const response = await fetch("/api/records/upload", {
        method: "POST",
        body: formData
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }
      
      setUploadProgress(100);
      
      // Refresh the file list
      const listResponse = await fetch("/api/records/list");
      const data = await listResponse.json();
      setFiles(data.files || []);
      
      // Close dialog and reset state
      setTimeout(() => {
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 1000); // Keep dialog open briefly to show 100% progress
      
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setError(error.message || "Failed to upload file");
      setUploading(false);
    }
  };

  // Handle file deletion
  const deleteFile = async (fileId: string) => {
    try {
      setDeleting(fileId);
      
      const response = await fetch(`/api/records/delete?fileId=${fileId}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }
      
      // Remove file from state
      setFiles(files.filter(file => file.id !== fileId));
      
    } catch (error: any) {
      console.error("Error deleting file:", error);
      setError(error.message || "Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Show icon based on file type
  const getFileIcon = (file: FileRecord) => {
    // Use category first if available
    if (file.category) {
      switch (file.category.toLowerCase()) {
        case 'image':
          return <FileIcon className="w-6 h-6 text-blue-500" />;
        case 'document':
          return <FileText className="w-6 h-6 text-red-500" />;
        case 'spreadsheet':
          return <FileText className="w-6 h-6 text-green-600" />;
        case 'presentation':
          return <FileText className="w-6 h-6 text-amber-500" />;
      }
    }
    
    // Fallback to extension-based detection
    switch (file.type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileIcon className="w-6 h-6 text-blue-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-6 h-6 text-blue-700" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  // Show loading state while checking authentication
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <PatientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Medical Records</h1>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FilePlus2 className="h-4 w-4 mr-2" />
                  Upload New Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Medical Record</DialogTitle>
                  <DialogDescription>
                    Upload your medical documents, reports, or any health-related files.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  {!selectedFile ? (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, JPG, PNG, DOC
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <File className="h-5 w-5 text-primary" />
                          <span className="font-medium text-sm">{selectedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </div>
                      
                      {uploading && (
                        <div className="mt-2">
                          <Progress value={uploadProgress} className="h-2 mt-1" />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">Uploading...</span>
                            <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={uploadFile}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <CardTitle>Your Medical Records</CardTitle>
                </div>
              </div>
              <CardDescription>
                Access and manage your medical reports and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center p-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your records...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-500 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>You don't have any medical records yet.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    Upload Records
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg border">
                      <div className="flex-shrink-0">
                        {getFileIcon(file)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.displayName}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteFile(file.id)}
                          disabled={deleting === file.id}
                        >
                          {deleting === file.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
              <CardDescription>
                An overview of your health conditions and medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <p>No health summary available. Complete your health assessment to view your summary.</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/check')}>
                  Start Health Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
}
