"use client";

import { useState, useRef } from 'react';

interface QueryResult {
  answer: string;
  sources: Array<{
    filename: string;
    similarity: number;
    content: string;
  }>;
  cache_hit: boolean;
  query_time?: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: QueryResult['sources'];
  cache_hit?: boolean;
  query_time?: number;
}

const EXAMPLE_QUERIES = [
  {
    icon: '🛡️',
    title: 'Safety Requirements',
    query: 'What are the safety requirements for coal mines?',
    category: 'Safety'
  },
  {
    icon: '📋',
    title: 'Incident Reporting',
    query: 'How should incidents be reported?',
    category: 'Compliance'
  },
  {
    icon: '🌫️',
    title: 'Dust Management',
    query: 'What are dust management procedures?',
    category: 'Operations'
  },
  {
    icon: '👷',
    title: 'Staff Appointment',
    query: 'Explain the appointment process for SSE',
    category: 'HR'
  },
  {
    icon: '⛏️',
    title: 'Mining Operations',
    query: 'What are the operational requirements for underground mining?',
    category: 'Operations'
  },
  {
    icon: '🚨',
    title: 'Emergency Procedures',
    query: 'What emergency procedures must be in place?',
    category: 'Safety'
  },
];

export default function RAGQuery() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuery = async (queryText: string = query) => {
    if (!queryText.trim()) {
      alert('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: queryText,
      timestamp: new Date()
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: queryText,
          use_cache: true,
        }),
      });

      const queryTime = ((Date.now() - startTime) / 1000).toFixed(2);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        
        // Add assistant response to chat
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources,
          cache_hit: data.cache_hit,
          query_time: parseFloat(queryTime)
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        const errorMsg = data.detail || 'Query failed. Please try again.';
        setError(errorMsg);
        
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `❌ ${errorMsg}`,
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection error';
      setError(errorMsg);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ ${errorMsg}. Please check if the API is running.`,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setQuery('');
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setResult(null);
    setError(null);
  };

  const exportChat = () => {
    const chatText = chatHistory.map(msg => 
      `${msg.type === 'user' ? '👤 You' : '🤖 Assistant'} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n`
    ).join('\n---\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = ['All', ...new Set(EXAMPLE_QUERIES.map(q => q.category))];
  const filteredExamples = selectedCategory === 'All' 
    ? EXAMPLE_QUERIES 
    : EXAMPLE_QUERIES.filter(q => q.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">💬 RAG Query Assistant</h2>
          <p className="text-gray-400 text-sm mt-1">Ask questions about your uploaded documents</p>
        </div>
        <div className="flex gap-2">
          {chatHistory.length > 0 && (
            <>
              <button onClick={clearChat} className="btn-secondary text-sm">
                🗑️ Clear Chat
              </button>
              <button onClick={exportChat} className="btn-secondary text-sm">
                📥 Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chat Messages */}
          <div className="card-dark p-0 rounded-xl overflow-hidden">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    Welcome to RAG Query Assistant
                  </h3>
                  <p className="text-gray-400 max-w-md">
                    Ask any question about your uploaded documents and I'll find the relevant information for you.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {EXAMPLE_QUERIES.slice(0, 4).map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuery(example.query)}
                        className="p-3 bg-dark-bg rounded-lg hover:bg-dark-bg/80 transition-colors text-left text-sm"
                      >
                        <span className="text-xl mb-1 block">{example.icon}</span>
                        <span className="text-gray-300">{example.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.type === 'user'
                            ? 'bg-accent-blue text-white'
                            : 'bg-dark-bg border border-gray-700'
                        }`}
                      >
                        {msg.type === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🤖</span>
                            <span className="text-xs text-gray-400">
                              {msg.cache_hit ? '⚡ From cache' : ''}
                              {msg.query_time && `(${msg.query_time}s)`}
                            </span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                        
                        {/* Sources for assistant messages */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-2">📚 Sources:</p>
                            {msg.sources.map((source, idx) => (
                              <div key={idx} className="bg-dark-bg/50 rounded p-2 mb-2 last:mb-0">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-medium text-accent-blue">
                                    📄 {source.filename}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {(source.similarity * 100).toFixed(0)}% match
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2">{source.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-dark-bg border border-gray-700 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-accent-blue rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                          <span className="text-xs text-gray-400">Searching documents...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="card-dark p-4 rounded-xl">
            <div className="flex gap-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your documents..."
                className="flex-1 min-h-[60px] resize-none bg-dark-bg border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                disabled={loading}
                rows={2}
              />
              <button
                onClick={() => handleQuery()}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-accent-blue text-white rounded-xl hover:bg-accent-blue/80 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🔍 Search
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Example Queries */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="card-dark p-4 rounded-xl">
            <h3 className="text-white font-semibold mb-3">📑 Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-accent-blue text-white'
                      : 'bg-dark-bg text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Example Queries */}
          <div className="card-dark p-4 rounded-xl">
            <h3 className="text-white font-semibold mb-3">⚡ Quick Queries</h3>
            <div className="space-y-2">
              {filteredExamples.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(example.query)}
                  disabled={loading}
                  className="w-full p-3 bg-dark-bg rounded-lg hover:bg-dark-bg/80 transition-colors text-left disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{example.icon}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{example.title}</p>
                      <p className="text-gray-400 text-xs mt-1 line-clamp-2">{example.query}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card-dark p-4 rounded-xl">
            <h3 className="text-white font-semibold mb-3">📊 Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Queries</span>
                <span className="text-white font-semibold">{chatHistory.filter(m => m.type === 'user').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Cache Hits</span>
                <span className="text-accent-green font-semibold">
                  {chatHistory.filter(m => m.cache_hit).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Avg Response</span>
                <span className="text-white font-semibold">
                  {chatHistory.filter(m => m.query_time).length > 0
                    ? (chatHistory.filter(m => m.query_time).reduce((acc, m) => acc + (m.query_time || 0), 0) / 
                       chatHistory.filter(m => m.query_time).length).toFixed(2)
                    : '0.00'}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card-dark p-4 border-l-4 border-accent-red bg-accent-red/5 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <p className="text-accent-red font-semibold">Query Error</p>
              <p className="text-gray-400 text-sm mt-1">{error}</p>
              <p className="text-gray-500 text-xs mt-2">
                💡 Make sure the backend API is running at {API_URL}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Latest Result (for backward compatibility) */}
      {result && !showHistory && (
        <div className="card-dark p-6 rounded-xl">
          <h3 className="text-white font-semibold text-lg mb-4">Latest Response</h3>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">{result.answer}</p>
          {result.sources && result.sources.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-3">Sources ({result.sources.length})</h4>
              <div className="space-y-3">
                {result.sources.map((source, idx) => (
                  <div key={idx} className="bg-dark-bg p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-medium">{source.filename}</p>
                      <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded-full">
                        {(source.similarity * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3">{source.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
