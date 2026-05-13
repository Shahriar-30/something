import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Plus, Edit, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
];

function SortableItem({ field, index, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key || `field-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-border rounded-md p-4 bg-muted/50 ${
        isDragging ? "shadow-lg opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-6 h-6 mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Field content */}
        <div className="flex-1">
          <div className="font-medium text-sm">{field.label}</div>
          <div className="text-xs text-muted-foreground">
            Type: {FIELD_TYPES.find((t) => t.value === field.type)?.label}
            {field.type === "select" && field.options && (
              <span> • {field.options.length} options</span>
            )}
          </div>
          {field.type === "select" && field.options?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {field.options.map((option, optionIndex) => (
                <span
                  key={optionIndex}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                >
                  {option}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(index)}
            className="text-muted-foreground"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SchemaBuilder({ schema = [], onChange, onEditField }) {
  const [newField, setNewField] = useState({
    key: "",
    label: "",
    type: "text",
    options: [],
  });
  const [newOption, setNewOption] = useState("");
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const formRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const generateKey = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleEdit = (index) => {
    const field = schema[index];
    setEditingFieldIndex(index);
    setNewField({
      key: field.key,
      label: field.label,
      type: field.type,
      options: field.options || [],
    });
    if (onEditField) {
      onEditField(true);
    }
    setTimeout(scrollToForm, 100);
  };

  const addField = () => {
    if (!newField.label.trim()) return;

    const fieldKey = newField.key || generateKey(newField.label);

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

    if (editingFieldIndex !== null) {
      const updatedSchema = [...schema];
      updatedSchema[editingFieldIndex] = field;
      onChange(updatedSchema);
      setEditingFieldIndex(null);
      if (onEditField) {
        onEditField(false);
      }
    } else {
      if (schema.some((item) => item.key === fieldKey)) {
        return;
      }
      onChange([...schema, field]);
    }

    setNewField({
      key: "",
      label: "",
      type: "text",
      options: [],
    });
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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = schema.findIndex(
        (item) => (item.key || `field-${schema.indexOf(item)}`) === active.id,
      );
      const newIndex = schema.findIndex(
        (item) => (item.key || `field-${schema.indexOf(item)}`) === over.id,
      );

      onChange(arrayMove(schema, oldIndex, newIndex));
    }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={schema.map((field, index) => field.key || `field-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {schema.map((field, index) => (
              <SortableItem
                key={field.key || `field-${index}`}
                field={field}
                index={index}
                onEdit={handleEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add New Field */}
      <div
        ref={formRef}
        className="border-2 border-dashed border-border rounded-md p-4"
      >
        <h5 className="text-sm font-medium text-foreground mb-3">
          {editingFieldIndex !== null ? "Edit Field" : "Add New Field"}
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

          <div className="flex items-center justify-end gap-2 pt-2">
            {editingFieldIndex !== null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingFieldIndex(null);
                  setNewField({
                    key: "",
                    label: "",
                    type: "text",
                    options: [],
                  });
                  if (onEditField) {
                    onEditField(false);
                  }
                }}
              >
                Cancel
              </Button>
            )}
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
              {editingFieldIndex !== null ? "Save Changes" : "Add Field"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
