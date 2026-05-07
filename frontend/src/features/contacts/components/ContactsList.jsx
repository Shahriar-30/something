import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  ArrowLeft,
  MoreVertical,
  Filter,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";
import useAuthStore from "@/store/useAuthStore";
import { useContactLists, useContactList } from "../hooks/useContacts";
import contactService from "../services/contactService";
import { LeadsTable } from "./LeadsTable";
import SchemaBuilder from "./SchemaBuilder";

export default function ContactsList() {
  const { businessId, listId } = useParams();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const {
    lists,
    loading: loadingLists,
    error: listsError,
    refresh: refreshLists,
  } = useContactLists();
  const { list: activeList, loading: loadingActiveList } =
    useContactList(listId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newContactData, setNewContactData] = useState({
    title: "",
    description: "",
    fieldSchema: [],
  });
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const descriptionLimit = 200;
  const isDescriptionTooLong =
    newContactData.description?.length > descriptionLimit;

  // Menu and action states
  const [menuOpen, setMenuOpen] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const canCreateContacts = ["owner", "admin", "staff"].includes(
    activeBusiness?.role,
  );

  const canManageContacts = ["owner", "admin"].includes(activeBusiness?.role);
  const showContactMeta = canManageContacts;

  const getLeadCount = (listId) => {
    // TODO: Implement lead count fetching from API
    return 0;
  };

  const handleCreateContact = async () => {
    if (!newContactData.title.trim()) {
      setCreateError("Title is required");
      return;
    }

    if (isDescriptionTooLong) {
      setCreateError(
        `Description must be ${descriptionLimit} characters or fewer`,
      );
      return;
    }

    if (newContactData.fieldSchema.length === 0) {
      setCreateError("Please add at least one lead field");
      return;
    }

    setCreateError("");
    setIsCreating(true);

    try {
      const response = await contactService.createContactList({
        title: newContactData.title.trim(),
        description: newContactData.description.trim() || null,
        fieldSchema: newContactData.fieldSchema,
      });

      const created = response.data?.contact;
      if (created?._id) {
        await refreshLists();
        setIsCreateModalOpen(false);
        setNewContactData({ title: "", description: "", fieldSchema: [] });
        navigate(`/${businessId}/contacts/${created._id}`);
      }
    } catch (err) {
      setCreateError(err?.message || "Unable to create contact list.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Password is required");
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      await contactService.deleteContactList(listToDelete, deletePassword);
      setIsDeleteModalOpen(false);
      setDeletePassword("");
      setMenuOpen(null);
      setListToDelete(null);
    } catch (err) {
      setDeleteError(err?.message || "Unable to delete contact list.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditContact = (list) => {
    setEditingList(list);
    setNewContactData({
      title: list.title,
      description: list.description || "",
    });
    setIsCreateModalOpen(true);
    setMenuOpen(null);
  };

  const handleUpdateContact = async () => {
    if (!newContactData.title.trim()) {
      setCreateError("Title is required");
      return;
    }

    setCreateError("");
    if (isDescriptionTooLong) {
      setCreateError(
        `Description must be ${descriptionLimit} characters or fewer`,
      );
      return;
    }
    setIsUpdating(true);

    try {
      await contactService.updateContactList(editingList._id, {
        title: newContactData.title.trim(),
        description: newContactData.description.trim() || null,
      });

      setIsCreateModalOpen(false);
      setNewContactData({ title: "", description: "" });
      setEditingList(null);
      refreshLists();
    } catch (err) {
      setCreateError(err?.message || "Unable to update contact list.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMenuToggle = (listId) => {
    setMenuOpen(menuOpen === listId ? null : listId);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setNewContactData({ title: "", description: "", fieldSchema: [] });
    setCreateError("");
    setEditingList(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletePassword("");
    setDeleteError("");
    setListToDelete(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest(".menu-container")) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // If we are looking at a specific list
  if (listId) {
    return (
      <PageContainer>
        <PageHeader
          title={loadingActiveList ? "Loading..." : activeList?.title}
          description={
            activeList?.description || "Manage your leads and contacts"
          }
        >
          <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:absolute sm:-left-12 sm:top-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${businessId}/contacts`)}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </PageHeader>

        <PageContent>
          <LeadsTable
            listId={listId}
            schema={activeList?.fieldSchema || []}
            showActions={true}
          />
        </PageContent>
      </PageContainer>
    );
  }

  // Otherwise show the dashboard with all lists
  return (
    <PageContainer>
      <PageHeader
        title="Contacts"
        description="Manage your campaigns and contact lists"
        actions={
          canCreateContacts ? (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Contacts
            </Button>
          ) : null
        }
      />

      <PageContent>
        {listsError ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-destructive/50 bg-destructive/5">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">
              Failed to load contact lists
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              {listsError}
            </p>
            <Button variant="outline" onClick={refreshLists}>
              Try Again
            </Button>
          </Card>
        ) : loadingLists ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-40 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No contact lists yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Create your first contact list to start collecting and managing
              leads.
            </p>
            {canCreateContacts ? (
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Contacts
              </Button>
            ) : (
              <div className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                Viewers can view contact lists here, but cannot create or edit
                them.
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <Card
                key={list._id}
                className="group hover:border-primary transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/${businessId}/contacts/${list._id}`)}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-notion-black group-hover:text-primary transition-colors">
                      {list.title}
                    </h3>
                    {canManageContacts && (
                      <div className="relative menu-container">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuToggle(list._id);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {menuOpen === list._id && (
                          <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-border rounded-md shadow-lg">
                            <div className="py-1">
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditContact(list);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </button>
                              <button
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setListToDelete(list._id);
                                  setMenuOpen(null);
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4">
                    {list.description || "No description provided."}
                  </p>
                  <div className="space-y-3 pt-4 border-t border-border mt-auto">
                    <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                      <span>{getLeadCount(list._id)} leads</span>
                      {showContactMeta && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-bold tracking-wider"
                        >
                          {list.assignmentConfig?.mode || "queue"}
                        </Badge>
                      )}
                    </div>
                    {showContactMeta ? (
                      <div className="text-[11px] text-muted-foreground">
                        Created by {list.createdBy?.name || "Unknown"} •{" "}
                        {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        title={editingList ? "Rename Contact List" : "Create Contact List"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleModalClose}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={editingList ? handleUpdateContact : handleCreateContact}
              disabled={
                isCreating ||
                isUpdating ||
                !newContactData.title.trim() ||
                isDescriptionTooLong ||
                (!editingList && newContactData.fieldSchema.length === 0) ||
                (editingList &&
                  newContactData.title.trim() === editingList.title &&
                  newContactData.description === editingList.description)
              }
            >
              {isCreating
                ? "Creating..."
                : isUpdating
                  ? "Saving..."
                  : editingList
                    ? "Save Changes"
                    : "Create Contacts"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-notion-black">
              Title
            </label>
            <input
              type="text"
              value={newContactData.title}
              onChange={(e) =>
                setNewContactData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="E.g. Real Estate Inbound"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-notion-black">
              Description
            </label>
            <textarea
              value={newContactData.description}
              maxLength={descriptionLimit}
              onChange={(e) =>
                setNewContactData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-30 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Optional description for this contact list"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Optional, up to {descriptionLimit} characters.</span>
              <span
                className={
                  isDescriptionTooLong
                    ? "text-rose-600"
                    : "text-muted-foreground"
                }
              >
                {newContactData.description.length}/{descriptionLimit}
              </span>
            </div>
          </div>

          <div>
            <SchemaBuilder
              schema={newContactData.fieldSchema}
              onChange={(fieldSchema) =>
                setNewContactData((prev) => ({
                  ...prev,
                  fieldSchema,
                }))
              }
            />
          </div>

          {createError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {createError}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        title="Delete Contact List"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContact}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete the
            contact list and all associated data.
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-notion-black">
              Confirm your password
            </label>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full"
            />
          </div>
          {deleteError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {deleteError}
            </div>
          ) : null}
        </div>
      </Modal>
    </PageContainer>
  );
}
