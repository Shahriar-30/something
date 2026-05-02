import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LifeBuoy, Mail } from "lucide-react";

const SupportSettings = () => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default SupportSettings;
