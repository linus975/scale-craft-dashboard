
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink } from 'lucide-react';

interface ActiveJobsCardProps {
  activeJobsCount: number;
  onViewActiveJobs: () => void;
}

export const ActiveJobsCard: React.FC<ActiveJobsCardProps> = ({
  activeJobsCount,
  onViewActiveJobs
}) => {
  return (
    <Card 
      className="bg-green-50/50 border border-green-200 cursor-pointer hover:shadow-md transition-shadow" 
      onClick={onViewActiveJobs}
    >
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Play className="h-5 w-5 text-green-500" />
            <div>
              <CardTitle className="text-lg">Active Jobs</CardTitle>
              <CardDescription className="text-sm">Jobs currently being printed</CardDescription>
            </div>
            <Badge variant="outline" className="bg-white">
              {activeJobsCount}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewActiveJobs();
            }}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Active Jobs
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
