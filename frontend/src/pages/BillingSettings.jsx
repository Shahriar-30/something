import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

const BillingSettings = () => {
  const { activeBusiness } = useAuthStore();

  return (
    <div className="space-y-4">
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
              Current Plan: {activeBusiness?.plan || "Free"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              You are currently on the free tier. Upgrade to unlock advanced
              features.
            </p>
            <Button className="mt-6">Upgrade Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings;
