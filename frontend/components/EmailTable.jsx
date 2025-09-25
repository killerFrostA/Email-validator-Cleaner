export default function EmailTable({ rows = [] }) {
  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-[#154D71]">Results</h3>
      </div>

      <div className="p-2 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Reason</th>
              <th className="text-left px-4 py-3">Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${r.status === "Valid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">{r.reason || "-"}</td>
                <td className="px-4 py-3 text-[#1C6EA4]">{r.suggestion || "-"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  No results yet — paste a list or upload a CSV to analyze.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
