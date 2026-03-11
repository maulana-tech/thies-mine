"use client";

import { useState } from 'react';

interface UploadedDocument {
  filename: string;
  size_bytes: number;
  uploaded_at: string;
  type: string;
}

interface DocumentCategory {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'under-review';
  required: boolean;
}

export default function DocumentUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('safety-procedures');
  const [dragActive, setDragActive] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const documentCategories: DocumentCategory[] = [
    {
      id: 'safety-procedures',
      title: 'Safety Procedures',
      description: 'Upload safety protocols, emergency procedures, and safety guidelines.',
      status: 'completed',
      required: true
    },
    {
      id: 'regulations',
      title: 'Regulations & Compliance',
      description: 'Government regulations, compliance documents, and legal requirements.',
      status: 'under-review',
      required: true
    },
    {
      id: 'incident-reports',
      title: 'Incident Reports',
      description: 'Accident reports, near-miss documentation, and investigation records.',
      status: 'pending',
      required: true
    },
    {
      id: 'training-materials',
      title: 'Training Materials',
      description: 'Training manuals, certification documents, and educational resources.',
      status: 'pending',
      required: false
    },
    {
      id: 'operational-docs',
      title: 'Operational Documents',
      description: 'Standard operating procedures, work instructions, and process documents.',
      status: 'pending',
      required: false
    }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
    setUploadResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(e.dataTransfer.files);
      setUploadResult(null);
    }
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
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      
      if (activeCategory) {
        formData.append('category', activeCategory);
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
        
        setSelectedFiles(null);
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

  const getStatusBadge = (status: string) => {
    const badges = {
      'completed': 'bg-accent-green/20 text-accent-green border-accent-green/30',
      'under-review': 'bg-accent-orange/20 text-accent-orange border-accent-orange/30',
      'pending': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-white">Upload Your Documents</h2>
            <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue text-xs font-medium rounded-full border border-accent-blue/30">
              10-15mins
            </span>
          </div>
          <p className="text-gray-400 text-sm max-w-4xl">
            Please upload the following documents for mining operations. Our AI system will process and index your documents 
            to enable intelligent search and analysis before operational deployment.
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="card-dark p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-white font-medium">
              {documents.length} of {documentCategories.filter(c => c.required).length} required documents uploaded
            </span>
          </div>
          <span className="text-gray-400 text-sm">Your upload progress will be saved.</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(documents.length / documentCategories.filter(c => c.required).length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Document Categories */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Document Categories</h3>
          
          {documentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                activeCategory === cat.id
                  ? 'bg-accent-blue/10 border-accent-blue'
                  : 'bg-dark-card border-dark-border hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {cat.status === 'completed' && (
                    <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <h4 className="text-white font-medium text-sm">{cat.title}</h4>
                </div>
                {cat.required && (
                  <span className="px-2 py-0.5 bg-accent-red/20 text-accent-red text-xs rounded border border-accent-red/30">
                    Required
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{cat.description}</p>
              <div className="mt-3">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded border ${getStatusBadge(cat.status)}`}>
                  {cat.status === 'completed' && '✓ '}
                  {cat.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Right Content - Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Category Info */}
          <div className="card-dark p-6">
            <h3 className="text-white font-semibold text-lg mb-4">
              {documentCategories.find(c => c.id === activeCategory)?.title}
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              To continue, please upload all relevant documents for this category. This helps confirm your operational readiness.
            </p>

            {/* Requirements List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-white font-medium text-sm">📋 Document Requirements:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-0.5">•</span>
                  <span>PDF or DOCX format (up to 10MB per file)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-0.5">•</span>
                  <span>High-resolution scans, not blurry or cropped</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-0.5">•</span>
                  <span>All pages must be clearly visible and readable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-blue mt-0.5">•</span>
                  <span>Documents should be current and up-to-date</span>
                </li>
              </ul>
            </div>

            {/* Important Notes */}
            <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-orange mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h5 className="text-accent-orange font-semibold text-sm mb-2">Important Notes</h5>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• We can only process documents once they are uploaded and verified</li>
                    <li>• If documents are damaged or unclear, we recommend re-scanning them first</li>
                    <li>• If you're unsure, upload all relevant pages and we'll review them for you</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? 'border-accent-blue bg-accent-blue/5'
                  : 'border-dark-border hover:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-2">Click to select files or drag files here</p>
                <p className="text-gray-400 text-sm mb-4">JPG, PNG, PDF up to 10MB</p>
                
                <input
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-primary cursor-pointer"
                >
                  Browse Files
                </label>

                {selectedFiles && (
                  <div className="mt-4 text-sm text-gray-300">
                    <p className="font-medium">✓ {selectedFiles.length} file(s) selected</p>
                    <div className="mt-2 space-y-1">
                      {Array.from(selectedFiles).map((file, i) => (
                        <p key={i} className="text-xs text-gray-400">
                          {file.name} ({formatBytes(file.size)})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button */}
            {selectedFiles && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary w-full mt-4"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading & Processing...
                  </span>
                ) : (
                  'Upload & Index Documents'
                )}
              </button>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-4 p-4 rounded-lg border ${
                uploadResult.success
                  ? 'bg-accent-green/10 border-accent-green text-accent-green'
                  : 'bg-accent-red/10 border-accent-red text-accent-red'
              }`}>
                <p className="text-sm font-medium">{uploadResult.message}</p>
                {uploadResult.success && uploadResult.data && (
                  <div className="mt-2 text-sm text-gray-300">
                    {uploadResult.data.document && (
                      <div>
                        <strong>{uploadResult.data.document.filename}</strong>
                        <br />
                        Size: {formatBytes(uploadResult.data.document.size_bytes)}
                        <br />
                        Chunks created: ~{uploadResult.data.document.chunks_created}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="card-dark p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg">Uploaded Documents</h3>
              <button onClick={fetchDocuments} className="btn-secondary text-sm">
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading...</p>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 bg-dark-bg border border-dark-border rounded-lg hover:bg-dark-hover transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{doc.filename}</p>
                        <p className="text-sm text-gray-400">
                          {doc.type.toUpperCase()} • {formatBytes(doc.size_bytes)} • 
                          {new Date(doc.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 bg-accent-red/20 hover:bg-accent-red/30 text-accent-red rounded-lg text-sm transition-colors border border-accent-red/30"
                      onClick={() => handleDelete(doc.filename)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="card-dark p-4 border-l-4 border-accent-blue">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-accent-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Your documents are encrypted and secured.</p>
            <p className="text-gray-400 text-xs">Processed only by AI system for indexing and analysis.</p>
          </div>
          <button className="text-accent-blue text-sm hover:underline">Learn more</button>
        </div>
      </div>
    </div>
  );
}
