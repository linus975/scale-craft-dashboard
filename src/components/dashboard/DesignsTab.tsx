
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Layers, Plus, Download, User } from 'lucide-react';
import StaticDesignForm from './StaticDesignForm';
import PersonalizedDesignForm from './PersonalizedDesignForm';

const DesignsTab: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDesignType, setSelectedDesignType] = useState<'static' | 'personalized' | null>(null);
  
  const mockDesigns = [
    { id: 1, name: "Parametric Gear", lastModified: "2 hours ago", version: "v1.3" },
    { id: 2, name: "Custom Bracket", lastModified: "1 day ago", version: "v2.1" },
    { id: 3, name: "Housing Template", lastModified: "3 days ago", version: "v1.0" },
  ];

  const handleDesignTypeSelection = (type: 'static' | 'personalized') => {
    console.log(`Selected design type: ${type}`);
    setSelectedDesignType(type);
  };

  const handleStaticDesignSave = (designData: any) => {
    console.log('Saving static design:', designData);
    // TODO: Implement Firebase save logic
    setIsDialogOpen(false);
    setSelectedDesignType(null);
  };

  const handlePersonalizedDesignSave = (designData: any) => {
    console.log('Saving personalized design:', designData);
    // TODO: Implement Firebase save logic
    setIsDialogOpen(false);
    setSelectedDesignType(null);
  };

  const handleCancel = () => {
    setSelectedDesignType(null);
    setIsDialogOpen(false);
  };

  const renderDialogContent = () => {
    if (selectedDesignType === 'static') {
      return (
        <ScrollArea className="max-h-[80vh]">
          <StaticDesignForm 
            onCancel={handleCancel}
            onSave={handleStaticDesignSave}
          />
        </ScrollArea>
      );
    }

    if (selectedDesignType === 'personalized') {
      return (
        <ScrollArea className="max-h-[80vh]">
          <PersonalizedDesignForm 
            onCancel={handleCancel}
            onSave={handlePersonalizedDesignSave}
          />
        </ScrollArea>
      );
    }

    // Default design type selection
    return (
      <>
        <DialogHeader>
          <DialogTitle>Choose Design Type</DialogTitle>
          <DialogDescription>
            Select whether you want to create a static design or a personalized design with customizable parameters.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col gap-3"
            onClick={() => handleDesignTypeSelection('static')}
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold">Static Design</div>
              <div className="text-sm text-slate-500">Fixed design file without customization options</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col gap-3"
            onClick={() => handleDesignTypeSelection('personalized')}
          >
            <User className="h-8 w-8 text-indigo-600" />
            <div className="text-center">
              <div className="font-semibold">Personalized Design</div>
              <div className="text-sm text-slate-500">Design with customizable parameters for personalization</div>
            </div>
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Design Library</h2>
          <p className="text-slate-600">Manage your CAD files and templates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Design
            </Button>
          </DialogTrigger>
          <DialogContent className={selectedDesignType ? "max-w-4xl max-h-[90vh]" : "sm:max-w-md"}>
            {renderDialogContent()}
          </DialogContent>
        </Dialog>
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
