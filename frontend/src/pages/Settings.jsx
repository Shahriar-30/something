import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { User, Building2, Users, CreditCard, LifeBuoy } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";
import { hasPermission, PERMISSIONS } from "@/lib/rbac";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

const Settings = () => {
  const { businessId } = useParams();
  const { activeBusiness } = useAuthStore();
  const userRole = activeBusiness?.role;

  const getTabClass = (isActive) =>
    cn(
      "data-[state=active]:bg-notion-light-gray data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 py-2 text-sm font-medium transition-all gap-2 flex items-center whitespace-nowrap",
      isActive && "border-primary text-primary bg-notion-light-gray",
    );

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account and business preferences."
      />

      <PageContent className="space-y-6">
        <div className="border-b border-border overflow-x-auto scrollbar-hide">
          <nav className="flex justify-start gap-1">
            <NavLink
              to={`/${businessId}/settings/account`}
              className={({ isActive }) => getTabClass(isActive)}
            >
              <User className="h-4 w-4" />
              Account
            </NavLink>
            <NavLink
              to={`/${businessId}/settings/business`}
              className={({ isActive }) => getTabClass(isActive)}
            >
              <Building2 className="h-4 w-4" />
              Business
            </NavLink>
            {hasPermission(userRole, PERMISSIONS.MANAGE_MEMBERS) && (
              <NavLink
                to={`/${businessId}/settings/members`}
                className={({ isActive }) => getTabClass(isActive)}
              >
                <Users className="h-4 w-4" />
                Members
              </NavLink>
            )}
            {hasPermission(userRole, PERMISSIONS.MANAGE_BILLING) && (
              <NavLink
                to={`/${businessId}/settings/billing`}
                className={({ isActive }) => getTabClass(isActive)}
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </NavLink>
            )}
            <NavLink
              to={`/${businessId}/settings/support`}
              className={({ isActive }) => getTabClass(isActive)}
            >
              <LifeBuoy className="h-4 w-4" />
              Support
            </NavLink>
          </nav>
        </div>

        <div className="pt-2">
          <Outlet />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default Settings;
