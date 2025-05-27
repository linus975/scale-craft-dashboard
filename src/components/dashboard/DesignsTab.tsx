
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Layers, Upload, Download } from 'lucide-react';

const DesignsTab: React.FC = () => {
  const mockDesigns = [
    { id: 1, name: "Parametric Gear", lastModified: "2 hours ago", version: "v1.3" },
    { id: 2, name: "Custom Bracket", lastModified: "1 day ago", version: "v2.1" },
    { id: 3, name: "Housing Template", lastModified: "3 days ago", version: "v1.0" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Design Library</h2>
          <p className="text-slate-600">Manage your CAD files and templates</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Design
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDesigns.map((design) => (
          <Card key={design.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{design.name}</CardTitle>
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <CardDescription>{design.version} • {design.lastModified}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TODO: Implement design file management features */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Design Management Coming Soon</h3>
          <p className="text-slate-600 mb-4">Advanced CAD file personalization and batch processing features will be available here.</p>
          <Badge variant="outline">Under Development</Badge>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignsTab;
