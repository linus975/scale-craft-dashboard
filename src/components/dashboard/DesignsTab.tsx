import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Layers,
  FileText,
  Settings,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DesignsTabProps {
  onNavigateToDesignDetail: (designId: number) => void;
  onNavigateToWhitelabelCatalog: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToDesignDetail, onNavigateToWhitelabelCatalog }) => {
  const [currentView, setCurrentView] = useState<'main' | 'detail' | 'staticForm' | 'personalizedForm'>('main');
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [isStaticFormOpen, setIsStaticFormOpen] = useState(false);
  const [isPersonalizedFormOpen, setIsPersonalizedFormOpen] = useState(false);
  const [designs, setDesigns] = useState([
    { id: 1, name: "Custom Phone Case", type: "personalized", material: "PLA", createdAt: "2024-01-10", lastModified: "2024-01-15", downloads: 45 },
    { id: 2, name: "Gear Set v2", type: "static", material: "PETG", createdAt: "2024-01-05", lastModified: "2024-01-12", downloads: 23 },
    { id: 3, name: "Prototype Housing", type: "personalized", material: "ABS", createdAt: "2023-12-28", lastModified: "2024-01-08", downloads: 12 },
    { id: 4, name: "Mounting Bracket", type: "static", material: "PLA", createdAt: "2023-12-20", lastModified: "2024-01-02", downloads: 68 },
  ]);

  const [newStaticDesign, setNewStaticDesign] = useState({
    name: '',
    material: '',
    description: '',
    file: null
  });

  const [newPersonalizedDesign, setNewPersonalizedDesign] = useState({
    name: '',
    material: '',
    description: '',
    parameters: '',
    templateFile: null
  });

  const handleDesignClick = (design: any) => {
    setSelectedDesign(design);
    setCurrentView('detail');
  };

  const handleStaticFormSubmit = () => {
    const newDesign = {
      id: Date.now(),
      name: newStaticDesign.name,
      type: 'static',
      material: newStaticDesign.material,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      downloads: 0
    };
    setDesigns(prev => [...prev, newDesign]);
    setIsStaticFormOpen(false);
    setNewStaticDesign({ name: '', material: '', description: '', file: null });
  };

  const handlePersonalizedFormSubmit = () => {
    const newDesign = {
      id: Date.now(),
      name: newPersonalizedDesign.name,
      type: 'personalized',
      material: newPersonalizedDesign.material,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      downloads: 0
    };
    setDesigns(prev => [...prev, newDesign]);
    setIsPersonalizedFormOpen(false);
    setNewPersonalizedDesign({ name: '', material: '', description: '', parameters: '', templateFile: null });
  };

  const handleDeleteDesign = (designId: number) => {
    setDesigns(prev => prev.filter(design => design.id !== designId));
  };

  if (currentView === 'detail') {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setCurrentView('main')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Designs
        </Button>
        {selectedDesign && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{selectedDesign.name}</CardTitle>
              <CardDescription>
                {selectedDesign.type} design • Material: {selectedDesign.material}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Created At</Label>
                  <p>{new Date(selectedDesign.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Last Modified</Label>
                  <p>{new Date(selectedDesign.lastModified).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Downloads</Label>
                  <p>{selectedDesign.downloads}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="secondary" onClick={() => onNavigateToDesignDetail(selectedDesign.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentView === 'main' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Design Management</h2>
              <p className="text-slate-600">Create and manage your 3D print designs</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Design
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-md">
                <DropdownMenuItem onClick={() => setIsStaticFormOpen(true)} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Static Design
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPersonalizedFormOpen(true)} className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Personalised Design
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Your Designs
              </CardTitle>
              <CardDescription>Manage existing designs and create new ones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designs.map((design) => (
                  <div key={design.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-slate-900">{design.name}</h4>
                          <p className="text-sm text-slate-500">{design.type} design</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-slate-200 shadow-md">
                          <DropdownMenuItem onClick={() => handleDesignClick(design)} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onNavigateToDesignDetail(design.id)} className="flex items-center gap-2 cursor-pointer">
                            <ExternalLink className="h-4 w-4" />
                            View Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteDesign(design.id)} className="flex items-center gap-2 cursor-pointer text-red-600">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>Downloads: {design.downloads}</span>
                      <span>Last Modified: {new Date(design.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={isStaticFormOpen} onOpenChange={setIsStaticFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Static Design</DialogTitle>
            <DialogDescription>
              Create a new static design for 3D printing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staticName">Design Name</Label>
              <Input
                id="staticName"
                value={newStaticDesign.name}
                onChange={(e) => setNewStaticDesign(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Gear Set v3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staticMaterial">Material</Label>
              <Input
                id="staticMaterial"
                value={newStaticDesign.material}
                onChange={(e) => setNewStaticDesign(prev => ({ ...prev, material: e.target.value }))}
                placeholder="e.g., PETG"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staticDescription">Description</Label>
              <Textarea
                id="staticDescription"
                placeholder="Brief description of the design"
                value={newStaticDesign.description}
                onChange={(e) => setNewStaticDesign(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staticFile">Upload File</Label>
              <Input
                type="file"
                id="staticFile"
                onChange={(e) => setNewStaticDesign(prev => ({ ...prev, file: e.target.files ? e.target.files[0] : null }))}
              />
            </div>
            <Button onClick={handleStaticFormSubmit} className="w-full">
              Create Design
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPersonalizedFormOpen} onOpenChange={setIsPersonalizedFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Personalised Design</DialogTitle>
            <DialogDescription>
              Create a new personalised design with custom parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="personalizedName">Design Name</Label>
              <Input
                id="personalizedName"
                value={newPersonalizedDesign.name}
                onChange={(e) => setNewPersonalizedDesign(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Custom Phone Case"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalizedMaterial">Material</Label>
              <Input
                id="personalizedMaterial"
                value={newPersonalizedDesign.material}
                onChange={(e) => setNewPersonalizedDesign(prev => ({ ...prev, material: e.target.value }))}
                placeholder="e.g., TPU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalizedDescription">Description</Label>
              <Textarea
                id="personalizedDescription"
                placeholder="Brief description of the design"
                value={newPersonalizedDesign.description}
                onChange={(e) => setNewPersonalizedDesign(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personalizedParameters">Parameters</Label>
              <Textarea
                id="personalizedParameters"
                placeholder="e.g., Text, Color, Size"
                value={newPersonalizedDesign.parameters}
                onChange={(e) => setNewPersonalizedDesign(prev => ({ ...prev, parameters: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateFile">Upload Template File</Label>
              <Input
                type="file"
                id="templateFile"
                onChange={(e) => setNewPersonalizedDesign(prev => ({ ...prev, templateFile: e.target.files ? e.target.files[0] : null }))}
              />
            </div>
            <Button onClick={handlePersonalizedFormSubmit} className="w-full">
              Create Design
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignsTab;
