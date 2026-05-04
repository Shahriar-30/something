import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLeads } from "../hooks/useLeads";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

const statusColors = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  open: "bg-amber-100 text-amber-700 border-amber-200",
  won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-rose-100 text-rose-700 border-rose-200",
};

export function LeadsTable({ listId, schema = [] }) {
  const { leads, loading, params, updateParams, pagination } = useLeads(listId);

  const totalLeads = leads.length;
  const statusSummary = leads.reduce(
    (acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    },
    { new: 0, open: 0, won: 0, lost: 0 },
  );

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      updateParams({ search: e.target.value, page: 1 });
    }
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-notion-bg/50 p-4">
          <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Total leads
          </div>
          <div className="text-3xl font-bold text-notion-black">
            {totalLeads}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {statusSummary.new} new · {statusSummary.open} open
          </div>
        </Card>
        <Card className="border-border bg-notion-bg/50 p-4">
          <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Won / lost
          </div>
          <div className="text-3xl font-bold text-notion-black">
            {statusSummary.won + statusSummary.lost}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {statusSummary.won} won · {statusSummary.lost} lost
          </div>
        </Card>
        <Card className="border-border bg-notion-bg/50 p-4">
          <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground mb-2">
            Assigned
          </div>
          <div className="text-3xl font-bold text-notion-black">
            {leads.filter((lead) => lead.assigneeId).length}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {leads.length
              ? `${Math.round((leads.filter((lead) => lead.assigneeId).length / leads.length) * 100)}% assigned`
              : "No leads yet"}
          </div>
        </Card>
      </div>

      {/* Table Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            defaultValue={params.search || ""}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Status</TableHead>
              {/* Dynamic Columns from Schema */}
              {schema.slice(0, 4).map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
              <TableHead>Assignee</TableHead>
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={schema.length + 3}
                  className="h-32 text-center text-muted-foreground"
                >
                  No leads found in this list.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead._id} className="cursor-pointer group">
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[lead.status] || ""}
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>

                  {/* Dynamic Values */}
                  {schema.slice(0, 4).map((field) => (
                    <TableCell
                      key={field.key}
                      className="max-w-[200px] truncate"
                    >
                      {lead.values[field.key] || "-"}
                    </TableCell>
                  ))}

                  <TableCell>
                    {lead.assigneeId ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 text-[10px]">
                          {lead.assigneeId.name?.[0]}
                        </Avatar>
                        <span className="text-xs font-medium">
                          {lead.assigneeId.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Unassigned
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <div>
          Showing {leads.length} of {pagination.total} leads
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => updateParams({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateParams({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
