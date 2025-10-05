'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [result, setResult] = useState('');

  const testRegister = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: `test${Date.now()}@test.com`,
          password: 'senha12345'
        })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <button onClick={testRegister} className="bg-blue-500 text-white px-4 py-2 rounded">
        Test Register
      </button>
      <pre className="mt-4 bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  );
}