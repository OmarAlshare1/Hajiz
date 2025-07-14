'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/api';

export default function BackendTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    addLog('Starting backend connectivity test...');

    try {
      // Test 1: Check if backend URL is configured
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      addLog(`Backend URL: ${backendUrl}`);

      // Test 2: Try to make a simple request to check if backend is reachable
      addLog('Testing backend reachability...');
      
      try {
        const response = await fetch(backendUrl.replace('/api', '/health') || backendUrl + '/health');
        addLog(`Health check response status: ${response.status}`);
      } catch (healthError) {
        addLog(`Health check failed: ${healthError}`);
      }

      // Test 3: Test login endpoint with dummy credentials
      addLog('Testing login endpoint...');
      try {
        const loginResponse = await auth.login({ phone: 'test', password: 'test' });
        addLog(`Login test response: ${JSON.stringify(loginResponse.data)}`);
      } catch (loginError: any) {
        addLog(`Login test error: ${loginError.response?.status} - ${loginError.response?.data?.message || loginError.message}`);
        if (loginError.response?.status === 400 || loginError.response?.status === 401) {
          addLog('✅ Login endpoint is reachable (returned expected error for invalid credentials)');
        } else {
          addLog('❌ Login endpoint may not be working properly');
        }
      }

      // Test 4: Check network connectivity
      addLog('Testing general network connectivity...');
      try {
        const networkTest = await fetch('https://httpbin.org/get');
        addLog(`Network test status: ${networkTest.status}`);
      } catch (networkError) {
        addLog(`Network test failed: ${networkError}`);
      }

    } catch (error) {
      addLog(`General error: ${error}`);
    } finally {
      setIsLoading(false);
      addLog('Backend connectivity test completed.');
    }
  };

  const testLoginWithRealCredentials = async () => {
    const phone = (document.getElementById('testPhone') as HTMLInputElement)?.value;
    const password = (document.getElementById('testPassword') as HTMLInputElement)?.value;
    
    if (!phone || !password) {
      addLog('Please enter phone and password for testing');
      return;
    }

    setIsLoading(true);
    addLog(`Testing login with credentials: ${phone}`);

    try {
      const response = await auth.login({ phone, password });
      addLog(`✅ Login successful! Response: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      addLog(`❌ Login failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Backend Connectivity Test</h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={testBackendConnection}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Backend Connection'}
            </button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Test Login with Real Credentials</h2>
            <div className="space-y-4">
              <input
                id="testPhone"
                type="tel"
                placeholder="Phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                id="testPassword"
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={testLoginWithRealCredentials}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test Login
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet. Click the test button above.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}