import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EmailDashboard() {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/inbox-emails')
      .then(res => setEmails(res.data.results))
      .catch(err => console.error("Failed to fetch emails:", err));
  }, []);

  return (
<div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header Bar */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Inbox Email Filter</h1>
          <span className="text-sm text-gray-500">Built with FastAPI + React</span>
        </div>
      </header>

      {/* Table Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-700">
              <tr>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b text-center">Status</th>
                <th className="p-3 border-b">Reason</th>
                <th className="p-3 border-b">Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((e, idx) => (
                <tr key={idx} className="hover:bg-white border-t">
                  <td className="p-3">{e.email}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      e.valid
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {e.valid ? "Valid" : "Invalid"}
                    </span>
                  </td>
                  <td className="p-3">{e.reason}</td>
                  <td className="p-3 text-blue-600">{e.suggestion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default EmailDashboard;
