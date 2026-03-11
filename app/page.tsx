"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentUpload from './components/DocumentUpload';
import WeatherDashboard from './components/WeatherDashboard';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleSQLQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/sql/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  const handleRAGQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: String(error) });
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Thies Mining AI Platform</h1>
        <p className="text-gray-600 mb-8">AI-powered mining operations analysis and automation</p>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload">📤 Upload Docs</TabsTrigger>
            <TabsTrigger value="rag">🔍 RAG Query</TabsTrigger>
            <TabsTrigger value="weather">🌤️ Weather</TabsTrigger>
            <TabsTrigger value="sql">💾 SQL Agent</TabsTrigger>
            <TabsTrigger value="risk">⚠️ Risk Analysis</TabsTrigger>
            <TabsTrigger value="briefing">📋 Briefing</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="rag" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RAG Query - Ask Questions About Your Documents</CardTitle>
                <CardDescription>
                  Query uploaded documents using natural language. The AI will search and provide answers with sources.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about procedures, regulations, or safety requirements..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRAGQuery()}
                  />
                  <Button onClick={handleRAGQuery} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {result && (
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    {result.error ? (
                      <div className="text-red-600">
                        <h3 className="font-semibold mb-2">Error:</h3>
                        <p>{result.error}</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">Answer:</h3>
                          <p className="whitespace-pre-wrap">{result.answer}</p>
                        </div>
                        
                        {result.sources && result.sources.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">Sources:</h3>
                            <div className="space-y-2">
                              {result.sources.map((source: string, i: number) => (
                                <div key={i} className="text-sm border-l-2 pl-3 py-1 bg-gray-50">
                                  📄 {source}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.cache_hit && (
                          <p className="text-xs text-gray-500 mt-2">⚡ Cached result</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Example Questions:</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "What are the safety requirements for coal mines?",
                      "What is the procedure for incident reporting?",
                      "What are dust management requirements?",
                      "Explain contractor management requirements",
                      "What are the quarterly reporting requirements?"
                    ].map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            <WeatherDashboard />
          </TabsContent>

          <TabsContent value="sql" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SQL Agent - Natural Language Database Queries</CardTitle>
                <CardDescription>
                  Query your mining database using natural language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question about your data..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSQLQuery()}
                  />
                  <Button onClick={handleSQLQuery} disabled={loading}>
                    {loading ? 'Processing...' : 'Query'}
                  </Button>
                </div>

                {result && (
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h3 className="font-semibold mb-2">Result:</h3>
                    <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Example Queries:</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "How many inspections were completed last week?",
                      "What are the most common incident types?",
                      "Show weather conditions for the last 7 days",
                      "Which locations have the highest incident rates?"
                    ].map((example, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuery(example)}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk">
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>
                  ML-powered risk prediction and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Risk analysis dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="briefing">
            <Card>
              <CardHeader>
                <CardTitle>Shift Briefing Automator</CardTitle>
                <CardDescription>
                  Automated shift briefing generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Shift briefing generator coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">23</p>
              <p className="text-sm text-gray-600">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">Low</p>
              <p className="text-sm text-gray-600">Current status</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
