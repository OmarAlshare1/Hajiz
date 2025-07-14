'use client';

import { useState } from 'react';
import { auth } from '@/lib/api';

export default function DebugPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setResult('Testing backend connection...');
    
    try {
      // Test basic connectivity
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.text();
        setResult(`Backend is reachable. Response: ${data}`);
      } else {
        setResult(`Backend responded with status: ${response.status} - ${response.statusText}`);
      }
    } catch (error: any) {
      setResult(`Error connecting to backend: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const credentials = {
        phone: '1234567890', // Test phone number
        password: 'testpassword' // Test password
      };
      
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Attempting login with:', credentials);
      
      const response = await auth.login(credentials);
      console.log('Login response:', response);
      
      setResult(`Login successful: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        setResult(`Login failed with status ${error.response.status}: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        setResult(`Network error - no response received: ${error.message}`);
      } else {
        setResult(`Error: ${error.message}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Backend Connection
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Test Login
          </button>
        </div>
        
        {loading && <p>Loading...</p>}
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}