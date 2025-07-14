'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginDebugPage() {
  const [phone, setPhone] = useState('0987654321');
  const [password, setPassword] = useState('password123');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  const testFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addLog('=== FORM SUBMIT TRIGGERED ===');
    addLog(`Phone: ${phone}, Password: ${password}`);
    
    if (!phone || !password) {
      addLog('ERROR: Missing phone or password');
      return;
    }
    
    setIsLoading(true);
    addLog('Setting loading state to true');
    
    try {
      addLog('Calling login function...');
      await login({ phone, password });
      addLog('Login function completed successfully');
    } catch (error: any) {
      addLog(`ERROR in login: ${error.message || error}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setIsLoading(false);
      addLog('Setting loading state to false');
    }
  };
  
  const testDirectLogin = async () => {
    addLog('=== DIRECT LOGIN TEST ===');
    addLog('Testing login function directly (bypassing form)');
    
    setIsLoading(true);
    
    try {
      addLog('Calling login function directly...');
      await login({ phone, password });
      addLog('Direct login completed successfully');
    } catch (error: any) {
      addLog(`ERROR in direct login: ${error.message || error}`);
      if (error.response) {
        addLog(`Response status: ${error.response.status}`);
        addLog(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const testAPIConnection = async () => {
    addLog('=== API CONNECTION TEST ===');
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      addLog(`API Health Check - Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.text();
        addLog(`API Response: ${data}`);
      } else {
        addLog(`API Error: ${response.statusText}`);
      }
    } catch (error: any) {
      addLog(`API Connection Error: ${error.message}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login Debug Page</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form and Controls */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Form</h2>
                
                <form onSubmit={testFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Testing...' : 'Test Form Submit'}
                  </button>
                </form>
              </div>
              
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Direct Tests</h2>
                
                <button
                  onClick={testDirectLogin}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  Test Direct Login
                </button>
                
                <button
                  onClick={testAPIConnection}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Test API Connection
                </button>
                
                <button
                  onClick={clearLogs}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Logs
                </button>
              </div>
            </div>
            
            {/* Right Column - Logs */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Debug Logs</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet. Click a test button to start debugging.</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Environment Info</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>API URL: {process.env.NEXT_PUBLIC_API_URL}</div>
              <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</div>
              <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}