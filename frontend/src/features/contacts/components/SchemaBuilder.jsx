import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Plus, Trash2 } from "lucide-react";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
];

export default function SchemaBuilder({ schema = [], onChange }) {
  const [newField, setNewField] = useState({
    key: "",
    label: "",
    type: "text",
    options: [],
  });
  const [newOption, setNewOption] = useState("");

  const generateKey = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const addField = () => {
    if (!newField.label.trim()) return;

    const fieldKey = newField.key || generateKey(newField.label);

    // Check for duplicate keys
    if (schema.some((field) => field.key === fieldKey)) {
      return;
    }

    // For select fields, require at least one option
    if (newField.type === "select" && newField.options.length === 0) {
      return;
    }

    const field = {
      key: fieldKey,
      label: newField.label.trim(),
      type: newField.type,
      options: newField.type === "select" ? newField.options : [],
    };

    onChange([...schema, field]);
    setNewField({
      key: "",
      label: "",
      type: "text",
      options: [],
    });
  };

  const removeField = (index) => {
    const newSchema = schema.filter((_, i) => i !== index);
    onChange(newSchema);
  };

  const addOption = () => {
    if (!newOption.trim()) return;

    const updatedOptions = [...newField.options, newOption.trim()];
    setNewField({ ...newField, options: updatedOptions });
    setNewOption("");
  };

  const removeOption = (optionIndex) => {
    const updatedOptions = newField.options.filter((_, i) => i !== optionIndex);
    setNewField({ ...newField, options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-notion-black">
          Lead Fields <span className="text-destructive">*</span>
        </h4>
        <span className="text-xs text-muted-foreground">
          {schema.length} field{schema.length !== 1 ? "s" : ""}{" "}
          {schema.length === 0 && (
            <span className="text-destructive">(at least 1 required)</span>
          )}
        </span>
      </div>

      {/* Existing Fields */}
      <div className="space-y-3">
        {schema.map((field, index) => (
          <div
            key={index}
            className="border border-border rounded-md p-4 bg-muted/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{field.label}</div>
                <div className="text-xs text-muted-foreground">
                  Type: {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                  {field.type === "select" && field.options && (
                    <span> • {field.options.length} options</span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeField(index)}
                className="text-destructive hover:text-destructive/80 ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Field */}
      <div className="border-2 border-dashed border-border rounded-md p-4">
        <h5 className="text-sm font-medium text-foreground mb-3">
          Add New Field
        </h5>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Field Name *
            </label>
            <Input
              value={newField.label}
              onChange={(e) =>
                setNewField({
                  ...newField,
                  label: e.target.value,
                  key: generateKey(e.target.value),
                })
              }
              placeholder="e.g. Full Name, Email, Phone"
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Field Type *
            </label>
            <Select
              options={FIELD_TYPES}
              value={newField.type}
              onChange={(value) =>
                setNewField({
                  ...newField,
                  type: value,
                  options: value === "select" ? newField.options : [],
                })
              }
              placeholder="Select type"
            />
          </div>

          {newField.type === "select" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Options * (required for dropdown)
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add option"
                  className="text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={addOption}
                  disabled={!newOption.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newField.options.map((option, optionIndex) => (
                  <span
                    key={optionIndex}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="text-primary hover:text-primary/80 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {newField.options.length === 0 && (
                <div className="text-xs text-destructive mt-1">
                  Please add at least one option for dropdown fields
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={addField}
              disabled={
                !newField.label.trim() ||
                (newField.type === "select" && newField.options.length === 0)
              }
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
