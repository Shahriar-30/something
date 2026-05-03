import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Separator } from "@/components/ui/Separator";
import Select from "@/components/ui/Select";
import { CURRENCIES, COUNTRIES } from "@/lib/constants";
import {
  Building2,
  Save,
  Trash2,
  Globe,
  Phone,
  MapPin,
  Coins,
  Loader2,
  Plus,
  AlertCircle,
} from "lucide-react";
import businessService from "@/features/auth/services/businessService";
import useAuthStore from "@/store/useAuthStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import CreateBusinessModal from "@/features/auth/components/CreateBusinessModal";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";

const BusinessSettings = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { activeBusiness, setAuth } = useAuthStore();
  const { logout } = useAuth();

  const userRole = activeBusiness?.role;
  const canManage = hasPermission(userRole, PERMISSIONS.MANAGE_BUSINESS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    currency: "USD",
    location: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    phoneNumber: "",
    phoneCountry: "",
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const response = await businessService.getBusinessById(businessId);
        const biz = response.data.business;

        const data = {
          name: biz.name || "",
          logoUrl: biz.logoUrl || "",
          currency: biz.currency || "USD",
          location: {
            street: biz.location?.street || "",
            city: biz.location?.city || "",
            state: biz.location?.state || "",
            zip: biz.location?.zip || "",
            country: biz.location?.country || "",
          },
          phoneNumber: biz.phoneNumber || "",
          phoneCountry: biz.phoneCountry || "",
        };

        setFormData(data);
        setInitialData(data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load business details");
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusiness();
    }
  }, [businessId]);

  const hasChanges =
    initialData && JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setError(null);
      setSuccess(null);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Business name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await businessService.updateBusiness(
        businessId,
        formData,
      );
      const updatedBiz = response.data.business;
      const newData = {
        name: updatedBiz.name || "",
        logoUrl: updatedBiz.logoUrl || "",
        currency: updatedBiz.currency || "USD",
        location: {
          street: updatedBiz.location?.street || "",
          city: updatedBiz.location?.city || "",
          state: updatedBiz.location?.state || "",
          zip: updatedBiz.location?.zip || "",
          country: updatedBiz.location?.country || "",
        },
        phoneNumber: updatedBiz.phoneNumber || "",
        phoneCountry: updatedBiz.phoneCountry || "",
      };

      setInitialData(newData);
      setFormData(newData);
      setSuccess("Business settings updated successfully");

      // Update local store if the updated business is the active one
      if (activeBusiness && activeBusiness.id === businessId) {
        const { business } = response.data;
        // The backend returns updated business object, we update the store
        const currentStore = useAuthStore.getState();
        setAuth({
          ...currentStore,
          activeBusiness: {
            ...currentStore.activeBusiness,
            name: business.name,
          },
        });
      }
    } catch (err) {
      const validationErrors = err.meta?.validationErrors;
      if (validationErrors) {
        const errorMsg = validationErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ");
        setError(`Validation failed: ${errorMsg}`);
      } else {
        setError(err.message || "Failed to update business settings");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this business? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await businessService.deleteBusiness(businessId);
      // If it was the active business, we might need to logout or redirect to another business
      // The backend handles the fallback business assignment for the user profile
      alert("Business deleted successfully. You will be redirected.");
      window.location.href = "/"; // Force a full reload to let App.jsx handle the fallback redirection
    } catch (err) {
      setError(err.message || "Failed to delete business");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isOwner = activeBusiness?.role === "owner";
  const canEdit = canManage;

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Create New Business
          </Button>
        </div>
      )}

      {error && <Alert variant="destructive">{error}</Alert>}
      {success && (
        <Alert className="border-primary text-primary">{success}</Alert>
      )}

      {hasChanges && !error && !success && canManage && (
        <Alert className="border-amber-500 bg-amber-50 text-amber-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            You have unsaved changes. Please save or reset your changes.
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* General Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    General Information
                  </CardTitle>
                  <CardDescription>
                    Basic details about your company.
                  </CardDescription>
                </div>
                <Badge
                  variant={isOwner ? "default" : "secondary"}
                  className="h-fit capitalize"
                >
                  {activeBusiness?.role || "Member"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    placeholder="Acme Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <Select
                    id="currency"
                    options={CURRENCIES.map((c) => ({
                      value: c.code,
                      label: `${c.code} (${c.symbol}) - ${c.name}`,
                      symbol: c.symbol,
                    }))}
                    value={formData.currency}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, currency: val }))
                    }
                    disabled={!canEdit || saving}
                    renderOption={(opt) => (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs w-6 text-muted-foreground">
                          {opt.symbol}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    className="pl-10"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Details
              </CardTitle>
              <CardDescription>
                How clients can reach your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneCountry">Country Code</Label>
                  <Select
                    id="phoneCountry"
                    options={COUNTRIES.map((c) => ({
                      value: c.code,
                      label: `${c.flag} ${c.name} (${c.dialCode})`,
                      dialCode: c.dialCode,
                      flag: c.flag,
                    }))}
                    value={formData.phoneCountry}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, phoneCountry: val }))
                    }
                    disabled={!canEdit || saving}
                    renderOption={(opt) => (
                      <div className="flex items-center gap-2">
                        <span>{opt.flag}</span>
                        <span>{opt.label}</span>
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    {formData.phoneCountry && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-muted-foreground border-r pr-2 h-5">
                        <span>
                          {
                            COUNTRIES.find(
                              (c) => c.code === formData.phoneCountry,
                            )?.dialCode
                          }
                        </span>
                      </div>
                    )}
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!canEdit || saving}
                      className={formData.phoneCountry ? "pl-16" : ""}
                      placeholder="000-000-0000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
              <CardDescription>
                The physical address of your business.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location.street">Street Address</Label>
                <Input
                  id="location.street"
                  name="location.street"
                  value={formData.location.street}
                  onChange={handleChange}
                  disabled={!canEdit || saving}
                  placeholder="123 Business Way"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location.city">City</Label>
                  <Input
                    id="location.city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    placeholder="San Francisco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.state">State / Province</Label>
                  <Input
                    id="location.state"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    placeholder="CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.zip">ZIP / Postal Code</Label>
                  <Input
                    id="location.zip"
                    name="location.zip"
                    value={formData.location.zip}
                    onChange={handleChange}
                    disabled={!canEdit || saving}
                    placeholder="94103"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location.country">Country</Label>
                <Input
                  id="location.country"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                  disabled={!canEdit || saving}
                  placeholder="United States"
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {isOwner && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this business.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Deleting this business will remove all associated contacts,
                  leads, and memberships. This action cannot be undone.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-2"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Business
                </Button>
              </CardContent>
            </Card>
          )}

          {canEdit && (
            <div className="flex justify-end gap-4 sticky bottom-0 bg-background/80 backdrop-blur-sm p-4 border-t z-10 -mx-4 md:mx-0 md:rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={saving || !hasChanges}
              >
                Reset Changes
              </Button>
              <Button
                type="submit"
                disabled={saving || !hasChanges}
                className="gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </form>

      <CreateBusinessModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default BusinessSettings;
