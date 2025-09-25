import React, { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AnalyzePanel() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const parseLines = (s) =>
    s.split(/[\n,;]+/).map(t => t.trim()).filter(Boolean);

  const analyzePasted = async () => {
    const emails = parseLines(text);
    if (!emails.length) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/analyze/list`, { emails });
      console.log("list response", data);
      setRows(Array.isArray(data?.results) ? data.results : []);
    } finally {
      setLoading(false);
    }
  };

  const analyzeUpload = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/analyze/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("upload response", data);
      setRows(Array.isArray(data?.results) ? data.results : []);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    // Use your server export so the file matches LAST_RESULT
    window.location.href = `${API}/analyze/export`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <h2 className="text-xl font-semibold mb-2">Analyze a List</h2>

        <textarea
          className="w-full h-28 rounded-lg border p-3 outline-none focus:ring"
          placeholder="Paste emails (comma or newline separated)…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            onClick={analyzePasted}
            disabled={loading}
            className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Analyzing…" : "Analyze Pasted List"}
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer hover:bg-gray-50">
            Import (CSV/XLSX)
            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              disabled={loading}
              onChange={(e) => analyzeUpload(e.target.files?.[0])}
            />
          </label>

          <button
            onClick={downloadCSV}
            disabled={!rows.length}
            className="ml-auto px-4 py-2 rounded-2xl border hover:bg-gray-50 disabled:opacity-60"
          >
            Download analyzed list
          </button>
        </div>
      </div>

      {/* SINGLE Results box */}
      <div className="rounded-2xl border">
        <div className="p-3 font-semibold border-b">
          Results{rows.length ? ` — ${rows.length} items` : ""}
        </div>

        {rows.length ? (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr><Th>Email</Th><Th>Status</Th><Th>Reason</Th><Th>Suggestion</Th></tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t">
                    <Td>{r.email}</Td>
                    <Td className={statusColor(r.status)}>{r.status}</Td>
                    <Td>{r.reason}</Td>
                    <Td>{r.suggestion}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-sm text-gray-500">
            No results yet — paste or import a list to see them here.
          </div>
        )}
      </div>
    </div>
  );
}

const Th = ({ children }) => (
  <th className="text-left font-medium px-3 py-2 whitespace-nowrap">{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-3 py-2 align-top whitespace-pre-wrap ${className}`}>{children}</td>
);
const statusColor = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("valid")) return "text-green-600 font-medium";
  if (s.includes("risky") || s.includes("unknown")) return "text-amber-600 font-medium";
  if (s.includes("invalid") || s.includes("bounce")) return "text-red-600 font-medium";
  return "";
};
