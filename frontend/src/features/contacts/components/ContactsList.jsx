export default function ContactsList() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
      <p className="text-slate-600">
        Placeholder route for the CRM contacts tab. Wire this page to{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-sm">
          /api/v1/contacts
        </code>{" "}
        using your auth token.
      </p>
    </div>
  );
}
