import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Building2,
  CreditCard,
  LifeBuoy,
  Mail,
  ShieldCheck,
  MapPin,
  Phone,
  Globe,
  LogOut,
} from "lucide-react";
import useAppStore from "@/store/useAppStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

const Settings = () => {
  const { user } = useAppStore();
  const { logout } = useAuth();
  const activeBusiness = user?.activeBusiness || {};

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-notion-black">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and business preferences.
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <div className="border-b border-border pb-1">
          <TabsList className="bg-transparent h-auto p-0 flex-wrap justify-start gap-2 border-none">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-notion-light-gray data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2 text-sm font-medium transition-all gap-2"
            >
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className="data-[state=active]:bg-notion-light-gray data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2 text-sm font-medium transition-all gap-2"
            >
              <Building2 className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-notion-light-gray data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2 text-sm font-medium transition-all gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="data-[state=active]:bg-notion-light-gray data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2 text-sm font-medium transition-all gap-2"
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="account" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and how others see you.
                  </CardDescription>
                </div>
                {user?.emailVerified ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 px-2 py-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1 px-2 py-0.5">
                    Unverified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      defaultValue={user?.name}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue={user?.email}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>
                Manage your password and session.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="outline">Change Password</Button>
              <Button variant="destructive" onClick={logout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>
                    Manage your business identity and contact details.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="capitalize px-2 py-0.5">
                  {activeBusiness.plan || "Free"} Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      defaultValue={activeBusiness.name}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currency"
                      defaultValue={activeBusiness.currency || "BDT"}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      defaultValue={activeBusiness.phoneNumber}
                      className="pl-10"
                      placeholder="+880 1234 567890"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      defaultValue={activeBusiness.location?.street}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        defaultValue={activeBusiness.location?.city}
                        placeholder="Dhaka"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        defaultValue={activeBusiness.location?.state}
                        placeholder="Dhaka"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input
                        id="zip"
                        defaultValue={activeBusiness.location?.zip}
                        placeholder="1000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        defaultValue={activeBusiness.location?.country}
                        placeholder="Bangladesh"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button>Update Business</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your plan, invoices, and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">
                  Current Plan: {activeBusiness.plan || "Free"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  You are currently on the free tier. Upgrade to unlock advanced
                  features.
                </p>
                <Button className="mt-6">Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="mt-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Get help with your account or contact our support team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 items-start text-left"
                >
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <LifeBuoy className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Documentation</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Browse our extensive guides
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 items-start text-left"
                >
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold">Contact Support</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Get in touch with our team
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
