export default function HomeContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Home</h1>
      <p className="text-slate-600">
        React, Tailwind CSS v4, and React Router are configured. API calls use
        the Vite dev proxy: <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">/api</code>{" "}
        → <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">http://localhost:8080</code>.
      </p>
    </div>
  );
}
