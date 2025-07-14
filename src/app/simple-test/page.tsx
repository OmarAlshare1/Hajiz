'use client';

import React, { useState } from 'react';

export default function SimpleTestPage() {
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(`Form submitted! Phone: ${phone}, Password: ${password}`);
    console.log('Form submitted successfully');
  };

  const handleButtonClick = () => {
    setMessage('Button clicked directly!');
    console.log('Button clicked directly');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Simple Form Test</h1>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e7f5e7', 
          border: '1px solid #4caf50', 
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Phone:</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Submit Form
        </button>
      </form>
      
      <button 
        type="button"
        onClick={handleButtonClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Button Click
      </button>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Instructions:</p>
        <ul>
          <li>Fill in the form fields</li>
          <li>Click "Submit Form" to test form submission</li>
          <li>Click "Test Button Click" to test button click</li>
          <li>Check browser console for logs</li>
        </ul>
      </div>
    </div>
  );
}