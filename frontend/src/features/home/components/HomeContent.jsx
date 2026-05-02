import { useHome } from "../hooks/useHome";

export default function HomeContent() {
  const { hello, err, isLoading } = useHome();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Home</h1>
      <p className="text-slate-600">
        React, Tailwind CSS v4, and React Router are configured. API calls use
        the Vite dev proxy: <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">/api</code>{" "}
        → <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">http://localhost:8080</code>.
      </p>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-700">GET /api/v1/hello</p>
        {isLoading && <p className="mt-2 text-sm text-slate-500 italic">Loading...</p>}
        {err && <p className="mt-2 text-sm text-amber-700">{err}</p>}
        {!err && hello && (
          <p className="mt-2 text-sm text-slate-600">
            Response message: <span className="font-mono text-slate-800">{hello}</span>
          </p>
        )}
      </div>
    </div>
  );
}
