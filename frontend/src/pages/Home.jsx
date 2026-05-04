import { HomeContent } from "../features/home";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Plus, TrendingUp, Users, Target } from "lucide-react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout";

export default function Home() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Welcome back to your CRM overview."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Lead
          </Button>
        }
      />

      <PageContent className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-notion-bg/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Total Revenue
              </CardDescription>
              <CardTitle className="text-2xl">$128,430</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-primary font-bold">
                ↑ 12% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="bg-notion-bg/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                <Users className="h-3 w-3" />
                Active Leads
              </CardDescription>
              <CardTitle className="text-2xl">452</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-primary font-bold">8 new today</div>
            </CardContent>
          </Card>

          <Card className="bg-notion-bg/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                <Target className="h-3 w-3" />
                Conversion Rate
              </CardDescription>
              <CardTitle className="text-2xl">24.8%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-destructive font-bold">
                ↓ 2% from last week
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-border bg-notion-bg/10">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your sales pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <HomeContent />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
