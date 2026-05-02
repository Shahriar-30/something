import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Layout } from 'lucide-react';

const ComingSoon = () => {
  const location = useLocation();
  const pageName = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full p-12 flex flex-col items-center justify-center text-center border-dashed">
        <div className="p-4 bg-muted rounded-full mb-6">
          <Layout className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-notion-black">{pageName}</h1>
        <p className="text-muted-foreground mt-2 mb-8">
          This module is currently under development and will be available soon.
        </p>
        <Button onClick={() => window.history.back()}>
          Go Back
        </Button>
      </Card>
    </div>
  );
};

export default ComingSoon;
