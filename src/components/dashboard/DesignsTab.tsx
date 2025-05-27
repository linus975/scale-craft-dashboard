import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { FileText, Layers, Plus, Download, User, Search, Grid2X2, LayoutList, Image, Package, Check } from 'lucide-react';
import StaticDesignForm from './StaticDesignForm';
import PersonalizedDesignForm from './PersonalizedDesignForm';
import DesignEditDialog from './DesignEditDialog';

interface DesignsTabProps {
  onNavigateToDesignDetail?: (designId: number) => void;
  onNavigateToWhitelabelCatalog?: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToDesignDetail, onNavigateToWhitelabelCatalog }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDesignType, setSelectedDesignType] = useState<'static' | 'personalized' | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showImages, setShowImages] = useState(false);
  
  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'mechanical', label: 'Mechanische Teile' },
    { value: 'household', label: 'Haushalt' },
    { value: 'toys', label: 'Spielzeug' },
    { value: 'tools', label: 'Werkzeuge' },
    { value: 'decorative', label: 'Dekoration' },
    { value: 'automotive', label: 'Automotive' },
  ];

  const mockDesigns = [
    { 
      id: 1, 
      name: "Parametric Gear", 
      lastModified: "2 hours ago", 
      version: "v1.3",
      cadSoftware: "fusion360",
      slicer: "prusaslicer",
      sketchName: "gear_teeth",
      replacementValue: "teeth_count",
      category: "mechanical",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop"
    },
    { 
      id: 2, 
      name: "Custom Bracket", 
      lastModified: "1 day ago", 
      version: "v2.1",
      cadSoftware: "solidworks",
      slicer: "cura",
      sketchName: "",
      replacementValue: "",
      category: "mechanical",
      imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300&h=200&fit=crop"
    },
    { 
      id: 3, 
      name: "Housing Template", 
      lastModified: "3 days ago", 
      version: "v1.0",
      cadSoftware: "blender",
      slicer: "orcaslicer",
      sketchName: "housing_width",
      replacementValue: "width_param",
      category: "household",
      imageUrl: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=300&h=200&fit=crop"
    },
  ];

  const mockMachines = [
    { id: 1, name: "Prusa i3 MK3S+", status: "idle" },
    { id: 2, name: "Bambu Lab X1 Carbon", status: "printing" },
    { id: 3, name: "Ender 3 V2", status: "offline" }
  ];

  const filteredDesigns = mockDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleDesignSave = (designData: any) => {
    console.log('Saving design changes:', designData);
    // TODO: Implement save logic
    setSelectedDesign(null);
  };

  const handleAddToQueue = (designId: number) => {
    console.log(`Adding design ${designId} to queue`);
    // TODO: Implement queue logic
  };

  const handlePrintOnMachine = (designId: number, machineId: number) => {
    console.log(`Printing design ${designId} on machine ${machineId}`);
    // TODO: Implement print logic
  };

  const handleCancel = () => {
    setSelectedDesignType(null);
    setIsDialogOpen(false);
  };

  const handleDesignClick = (designId: number) => {
    console.log(`Navigating to design detail for design ${designId}`);
    if (onNavigateToDesignDetail) {
      onNavigateToDesignDetail(designId);
    }
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

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredDesigns.map((design) => (
        <Card 
          key={design.id} 
          className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleDesignClick(design.id)}
        >
          {showImages && (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={design.imageUrl} 
                alt={design.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{design.name}</CardTitle>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <CardDescription>
              {design.version} • {design.lastModified}
              <Badge variant="outline" className="ml-2 text-xs">
                {categories.find(cat => cat.value === design.category)?.label}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDesign(design);
                }}
              >
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredDesigns.map((design) => (
        <Card 
          key={design.id} 
          className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleDesignClick(design.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {showImages && (
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img 
                    src={design.imageUrl} 
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold truncate">{design.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {categories.find(cat => cat.value === design.category)?.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{design.version} • {design.lastModified}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDesign(design);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Design Library</h2>
          <p className="text-slate-600">Verwalten Sie Ihre CAD-Dateien und Vorlagen</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Design hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className={selectedDesignType ? "max-w-4xl max-h-[90vh]" : "sm:max-w-md"}>
            {renderDialogContent()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Designs durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Kategorie wählen" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
            showImages ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
          }`}>
            <Image className="h-4 w-4" />
            <Switch
              checked={showImages}
              onCheckedChange={setShowImages}
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600">
        {filteredDesigns.length} Design{filteredDesigns.length !== 1 ? 's' : ''} gefunden
      </div>

      {/* Design Display */}
      {filteredDesigns.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Keine Designs gefunden</h3>
            <p className="text-slate-600">Versuchen Sie andere Suchbegriffe oder Kategorien.</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Erweiterte Design-Verwaltung</h3>
          <p className="text-slate-600 mb-4">Erweiterte CAD-Dateipersonalisierung und Batch-Verarbeitungsfunktionen werden hier verfügbar sein.</p>
          <Badge variant="outline">In Entwicklung</Badge>
        </CardContent>
      </Card>

      {/* Design Library Section */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigateToWhitelabelCatalog()}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Package className="h-6 w-6 text-purple-600" />
                  Design Library
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Erweitern Sie Ihr Angebot mit professionellen Whitelabel-Katalogen
                </CardDescription>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Neu
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-600">
                Mieten Sie komplette Design-Kataloge für nur 30€ pro Monat und bieten Sie Ihren Kunden sofort hunderte von professionellen 3D-Designs an.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Über 300 Designs verfügbar</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Kommerzielle Nutzungsrechte</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Monatlich kündbar</span>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Package className="h-4 w-4 mr-2" />
                Kataloge durchsuchen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Design Edit Dialog */}
      {selectedDesign && (
        <DesignEditDialog
          design={selectedDesign}
          isOpen={!!selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onSave={handleDesignSave}
          onAddToQueue={handleAddToQueue}
          onPrintOnMachine={handlePrintOnMachine}
          machines={mockMachines}
        />
      )}
    </div>
  );
};

export default DesignsTab;
