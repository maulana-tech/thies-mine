"use client";

import { useState } from 'react';

interface ReportResult {
  success: boolean;
  message: string;
  email_id?: string;
  draft_id?: string;
  report_content?: string;
  results?: any;
}

export default function ReportingDashboard() {
  const [email, setEmail] = useState('developerlana0@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleSendReport = async () => {
    if (!email || !email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveAction('send');

    try {
      const response = await fetch(`${API_URL}/reporting/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: `✅ Report sent successfully to ${email}!\n\n${data.results?.message || data.message || ''}`,
          email_id: data.results?.email_id || data.email_id,
        });
      } else {
        throw new Error(data.detail || data.message || 'Failed to send report');
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: `❌ Failed to send report: ${err.message || err.toString()}\n\n💡 Make sure the API is running and email service is configured.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!email || !email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);
    setActiveAction('draft');

    try {
      const response = await fetch(`${API_URL}/reporting/create-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: `✅ Draft created successfully!\n\n${data.results?.message || data.message || ''}`,
          draft_id: data.results?.draft_id || data.draft_id,
        });
      } else {
        throw new Error(data.detail || data.message || 'Failed to create draft');
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: `❌ Failed to create draft: ${err.message || err.toString()}\n\n💡 Make sure the API is running and Gmail integration is configured.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setResult(null);
    setActiveAction('generate');

    try {
      const response = await fetch(`${API_URL}/reporting/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_email: email,
          send_email: false,
          create_draft: false,
          include_weather: true,
          include_rag_stats: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: `✅ Report generated successfully!\n\n${data.results?.message || data.message || ''}`,
          report_content: data.results?.report_content || data.report_content,
        });
      } else {
        throw new Error(data.detail || data.message || 'Failed to generate report');
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: `❌ Failed to generate report: ${err.message || err.toString()}\n\n💡 This feature requires Composio/Gmail integration to be configured.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">📧 Reporting Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">Automated report generation and distribution</p>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="card-dark p-6 rounded-xl">
        <h3 className="text-white font-semibold text-lg mb-4">📧 Email Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Recipient Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="input-dark"
              placeholder="Enter email address"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Reports will be sent to this email address
            </p>
          </div>
        </div>
      </div>

      {/* Report Actions */}
      <div className="card-dark p-6 rounded-xl">
        <h3 className="text-white font-semibold text-lg mb-4">📋 Report Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleSendReport}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading && activeAction === 'send' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                📤 Send Report
              </>
            )}
          </button>
          <button
            onClick={handleCreateDraft}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading && activeAction === 'draft' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                📝 Create Draft
              </>
            )}
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading && activeAction === 'generate' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                📊 Generate Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className={`card-dark p-6 rounded-xl border-l-4 ${
          result.success
            ? 'bg-green-900/20 border-green-500'
            : 'bg-red-900/20 border-red-500'
        }`}>
          <div className="flex items-start gap-4">
            <span className="text-3xl">
              {result.success ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              <h4 className={`text-lg font-semibold mb-2 ${
                result.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.success ? 'Success' : 'Error'}
              </h4>
              <p className="text-gray-300 whitespace-pre-wrap">{result.message}</p>

              {result.email_id && (
                <div className="mt-4 p-4 bg-dark-bg rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">📧 Email ID:</p>
                  <p className="text-white font-mono text-sm">{result.email_id}</p>
                </div>
              )}

              {result.draft_id && (
                <div className="mt-4 p-4 bg-dark-bg rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">📝 Draft ID:</p>
                  <p className="text-white font-mono text-sm">{result.draft_id}</p>
                </div>
              )}

              {result.report_content && (
                <div className="mt-4 p-4 bg-dark-bg rounded-lg max-h-96 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-2">📄 Report Preview:</p>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {result.report_content}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-dark p-5 rounded-xl border border-blue-700/30 bg-blue-900/10">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">📤</span> Send Report
          </h4>
          <p className="text-sm text-gray-300">
            Sends a complete operational report directly to the specified email address. Includes weather analysis and RAG statistics.
          </p>
        </div>

        <div className="card-dark p-5 rounded-xl border border-purple-700/30 bg-purple-900/10">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">📝</span> Create Draft
          </h4>
          <p className="text-sm text-gray-300">
            Creates an email draft in Gmail that you can review and edit before sending. Perfect for customization.
          </p>
        </div>

        <div className="card-dark p-5 rounded-xl border border-green-700/30 bg-green-900/10">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <span className="text-xl">📊</span> Generate Report
          </h4>
          <p className="text-sm text-gray-300">
            Generates a new report based on current data and weather analysis. Preview the content before sending.
          </p>
        </div>
      </div>

      {/* Requirements Notice */}
      <div className="card-dark p-5 rounded-xl border border-amber-700/30 bg-amber-900/10">
        <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
          <span className="text-xl">⚠️</span> Requirements
        </h4>
        <div className="text-sm text-gray-300 space-y-2">
          <p>
            <strong className="text-white">Email Service:</strong> Requires Composio Gmail integration or SMTP configuration.
          </p>
          <p>
            <strong className="text-white">Google Services:</strong> Google Docs/Sheets integration optional for saving reports.
          </p>
          <p>
            <strong className="text-white">API Status:</strong> Backend API must be running at {API_URL}
          </p>
          <div className="mt-3 p-3 bg-dark-bg rounded">
            <p className="text-xs text-gray-400">
              💡 <strong>Tip:</strong> Check the API documentation at <code className="text-accent-blue">{API_URL}/docs</code> for more details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
