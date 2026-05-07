import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import useAuthStore from "@/store/useAuthStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLeads } from "../hooks/useLeads";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Loader2, Search, Filter, Plus } from "lucide-react";
import { Input }from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import leadService from "../services/leadService";

const statusColors = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  open: "bg-amber-100 text-amber-700 border-amber-200",
  won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-rose-100 text-rose-700 border-rose-200",
};

export function LeadsTable({ listId, schema = [], showActions = false }) {
  const { leads, loading, params, updateParams, pagination, refresh } =
    useLeads(listId);
  const { activeBusiness } = useAuthStore();
  const showCreatedBy = ["owner", "admin"].includes(activeBusiness?.role);

  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadValues, setLeadValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const initialValues = schema.reduce((values, field) => {
      values[field.key] = "";
      return values;
    }, {});
    setLeadValues(initialValues);
  }, [schema]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      updateParams({ search: e.target.value, page: 1 });
    }
  };

  const updateLeadValue = (key, value) => {
    setLeadValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateLead = async () => {
    setIsSubmitting(true);
    setCreateError("");
    try {
      await leadService.createLead(listId, {
        values: leadValues,
      });
      await refresh();
      setIsAddLeadOpen(false);
      setLeadValues(
        schema.reduce((values, field) => {
          values[field.key] = "";
          return values;
        }, {}),
      );
    } catch (err) {
      setCreateError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create lead.",
      );
    } finally {
      setIsSubmitting(false);
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
      {/* Table Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-9"
            defaultValue={params.search || ""}
            onKeyDown={handleSearch}
          />
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" onClick={() => setIsAddLeadOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        title="Add Lead"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddLeadOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateLead} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Lead"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {createError}
            </div>
          )}
          {schema.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No field schema available for this contact list.
            </div>
          ) : (
            schema.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="block text-sm font-medium text-muted-foreground">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <Select
                    options={field.options.map((option) => ({
                      value: option,
                      label: option,
                    }))}
                    value={leadValues[field.key] || ""}
                    onChange={(value) => updateLeadValue(field.key, value)}
                    placeholder={`Select ${field.label}`}
                  />
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : field.type}
                    value={leadValues[field.key] || ""}
                    onChange={(e) => updateLeadValue(field.key, e.target.value)}
                    placeholder={`Enter ${field.label}`}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Status</TableHead>
              {/* Dynamic Columns from Schema */}
              {schema.map((field) => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
              <TableHead>Assignee</TableHead>
              {showCreatedBy && <TableHead>Created by</TableHead>}
              <TableHead className="text-right">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={schema.length + 3 + (showCreatedBy ? 1 : 0)}
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
                  {schema.map((field) => (
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
                  {showCreatedBy && (
                    <TableCell className="text-xs text-muted-foreground">
                      {lead.createdBy?.name || lead.createdBy?.email || "Unknown"}
                    </TableCell>
                  )}

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
