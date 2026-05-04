import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert } from "@/components/ui/Alert";
import { Loader2, Building2, Coins, Globe } from "lucide-react";
import businessService from "@/features/auth/services/businessService";
import useAuthStore from "@/store/useAuthStore";

const CreateBusinessModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    currency: "USD",
    logoUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Business name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessService.createBusiness({
        name: formData.name.trim(),
        currency: formData.currency.toUpperCase(),
        logoUrl: formData.logoUrl.trim() || null,
      });

      // Update store with new token and business context returned from backend
      const { token, activeBusiness, businesses, user } = response.data;
      
      const currentStore = useAuthStore.getState();
      setAuth({
        ...currentStore,
        token,
        activeBusiness,
        businesses,
        user: user || currentStore.user,
        isAuthenticated: true
      });

      onClose();
      // Redirect to the new business dashboard
      navigate(`/${activeBusiness.id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create business. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Business"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={loading} className="gap-2">
            <Building2 className="h-4 w-4" />
            Create Business
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="destructive">{error}</Alert>}
        
        <div className="space-y-2">
          <Label htmlFor="name">Business Name *</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              name="name"
              placeholder="Acme Corporation"
              value={formData.name}
              onChange={handleChange}
              className="pl-10"
              disabled={loading}
              autoFocus
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Base Currency (3 letters)</Label>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="currency"
              name="currency"
              placeholder="USD"
              maxLength={3}
              value={formData.currency}
              onChange={handleChange}
              className="pl-10 uppercase"
              disabled={loading}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            e.g., USD, BDT, EUR
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="logoUrl"
              name="logoUrl"
              placeholder="https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={handleChange}
              className="pl-10"
              disabled={loading}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          * You will automatically become the <strong>Owner</strong> of this business.
        </p>
      </form>
    </Modal>
  );
};

export default CreateBusinessModal;
