"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadedDocument {
  filename: string;
  size_bytes: number;
  uploaded_at: string;
  type: string;
}

export default function DocumentUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      
      // Add all files
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      
      // Add category if provided
      if (category) {
        formData.append('category', category);
      }

      const endpoint = selectedFiles.length === 1 
        ? `${API_URL}/rag/upload`
        : `${API_URL}/rag/upload-multiple`;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadResult({
          success: true,
          message: data.message || 'Upload successful',
          data: data
        });
        
        // Clear form
        setSelectedFiles(null);
        setCategory('');
        
        // Refresh document list
        fetchDocuments();
      } else {
        setUploadResult({
          success: false,
          message: data.detail || 'Upload failed'
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: `Error: ${error}`
      });
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rag/documents`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      const response = await fetch(`${API_URL}/rag/documents/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload PDF or DOCX files. They will be automatically processed and indexed for RAG queries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Files (PDF or DOCX)</label>
            <Input
              type="file"
              accept=".pdf,.docx"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFiles && (
              <p className="text-sm text-gray-600">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category (Optional)</label>
            <Input
              placeholder="e.g., Safety Procedures, Regulations, etc."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || !selectedFiles}
            className="w-full"
          >
            {uploading ? 'Uploading & Processing...' : 'Upload & Index Documents'}
          </Button>

          {uploadResult && (
            <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
              <AlertDescription>
                {uploadResult.message}
                {uploadResult.success && uploadResult.data && (
                  <div className="mt-2 text-sm">
                    {uploadResult.data.document && (
                      <div>
                        <strong>{uploadResult.data.document.filename}</strong>
                        <br />
                        Size: {formatBytes(uploadResult.data.document.size_bytes)}
                        <br />
                        Chunks created: ~{uploadResult.data.document.chunks_created}
                      </div>
                    )}
                    {uploadResult.data.results && (
                      <div>
                        <strong>Results:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {uploadResult.data.results.map((r: any, i: number) => (
                            <li key={i} className={r.success ? 'text-green-600' : 'text-red-600'}>
                              {r.filename}: {r.success ? '✓ Success' : `✗ ${r.error}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>
                Documents that have been indexed and are available for querying
              </CardDescription>
            </div>
            <Button onClick={fetchDocuments} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : documents.length === 0 ? (
            <p className="text-gray-600">No documents uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc, i) => (
                <div 
                  key={i} 
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-sm text-gray-600">
                      {doc.type} • {formatBytes(doc.size_bytes)} • 
                      {new Date(doc.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(doc.filename)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. <strong>Upload</strong>: Select PDF or DOCX files and click upload</p>
          <p>2. <strong>Processing</strong>: Documents are automatically extracted and split into chunks</p>
          <p>3. <strong>Indexing</strong>: Chunks are embedded and stored in vector database</p>
          <p>4. <strong>Query</strong>: Use the RAG Query tab to ask questions about your documents</p>
          <p className="mt-4 p-3 bg-blue-50 rounded">
            💡 <strong>Tip:</strong> Upload safety procedures, regulations, incident reports, or any mining-related documents. 
            The system will understand and answer questions about them using AI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
