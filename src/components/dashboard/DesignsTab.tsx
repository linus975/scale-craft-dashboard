import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { FileText, Layers, Plus, Download, User, Search, Grid2X2, LayoutList, Image, Package, Check, Crown, Lock, Printer, ChevronRight, PlayCircle, Clock, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import StaticDesignForm from './StaticDesignForm';
import PersonalizedDesignForm from './PersonalizedDesignForm';
import DesignEditDialog from './DesignEditDialog';
import { useDesigns } from '@/hooks/useDesigns';
import { useFileUpload } from '@/hooks/useFileUpload';

interface DesignsTabProps {
  onNavigateToDesignDetail?: (designId: string) => void;
  onNavigateToWhitelabelCatalog?: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToDesignDetail, onNavigateToWhitelabelCatalog }) => {
  const { designs, loading } = useDesigns();
  const { getFileUrl } = useFileUpload();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDesignType, setSelectedDesignType] = useState<'static' | 'personalized' | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showImages, setShowImages] = useState(false);
  const [showAllLibraryDesigns, setShowAllLibraryDesigns] = useState(false);
  
  const libraryDesigns = [
    {
      id: "101",
      name: "Premium Phone Grip",
      category: "accessories",
      difficulty: "Einfach",
      printTime: "45 min",
      material: "PLA",
      rating: 4.9,
      downloads: 1250,
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
      isLibrary: true,
      nozzleSize: "0.4mm",
      layerHeight: "0.2mm",
      infill: "20%",
      supportMaterial: "No",
      description: "Ein ergonomischer Handygriff aus hochwertigem PLA-Kunststoff für bessere Handhabung.",
      tags: ["phone", "grip", "ergonomic", "accessories"]
    },
    {
      id: "102",
      name: "Modular Desktop Organizer",
      category: "office",
      difficulty: "Mittel",
      printTime: "2h 30min",
      material: "PETG",
      rating: 4.8,
      downloads: 890,
      imageUrl: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=300&h=200&fit=crop",
      isLibrary: true,
      nozzleSize: "0.4mm",
      layerHeight: "0.25mm",
      infill: "25%",
      supportMaterial: "Yes",
      description: "Ein modulares Organizer-System für den Schreibtisch mit verschiedenen Fächern und Stifthaltern.",
      tags: ["office", "organizer", "modular", "desk"]
    },
    {
      id: "103",
      name: "Cable Management System",
      category: "office",
      difficulty: "Einfach",
      printTime: "1h 15min",
      material: "PLA",
      rating: 4.7,
      downloads: 2100,
      imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300&h=200&fit=crop",
      isLibrary: true,
      nozzleSize: "0.4mm",
      layerHeight: "0.2mm",
      infill: "15%",
      supportMaterial: "No",
      description: "Ein elegantes Kabelmanagement-System zur Organisation von Kabeln auf dem Schreibtisch.",
      tags: ["cable", "management", "office", "organization"]
    },
    {
      id: "104",
      name: "Ergonomic Laptop Stand",
      category: "accessories",
      difficulty: "Schwer",
      printTime: "4h 20min",
      material: "ABS",
      rating: 4.9,
      downloads: 750,
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop",
      isLibrary: true,
      nozzleSize: "0.6mm",
      layerHeight: "0.3mm",
      infill: "30%",
      supportMaterial: "Yes",
      description: "Ein ergonomischer Laptop-Ständer für bessere Körperhaltung und Arbeitskomfort.",
      tags: ["laptop", "stand", "ergonomic", "workspace"]
    }
  ];

  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'mechanical', label: 'Mechanische Teile' },
    { value: 'household', label: 'Haushalt' },
    { value: 'toys', label: 'Spielzeug' },
    { value: 'tools', label: 'Werkzeuge' },
    { value: 'decorative', label: 'Dekoration' },
    { value: 'automotive', label: 'Automotive' },
  ];

  const filteredOwnDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredLibraryDesigns = libraryDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDesignTypeSelection = (type: 'static' | 'personalized') => {
    console.log(`Selected design type: ${type}`);
    setSelectedDesignType(type);
  };

  const handleDesignSave = (designData: any) => {
    console.log('Design saved:', designData);
    setIsDialogOpen(false);
    setSelectedDesignType(null);
  };

  const handleCancel = () => {
    setSelectedDesignType(null);
    setIsDialogOpen(false);
  };

  const handleDesignClick = (designId: string) => {
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
            onSave={handleDesignSave}
          />
        </ScrollArea>
      );
    }

    if (selectedDesignType === 'personalized') {
      return (
        <ScrollArea className="max-h-[80vh]">
          <PersonalizedDesignForm 
            onCancel={handleCancel}
            onSave={handleDesignSave}
          />
        </ScrollArea>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Design-Typ auswählen</DialogTitle>
          <DialogDescription>
            Wählen Sie, ob Sie ein statisches Design oder ein personalisierbares Design mit anpassbaren Parametern erstellen möchten.
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
              <div className="font-semibold">Statisches Design</div>
              <div className="text-sm text-slate-500">Feste Design-Datei ohne Anpassungsoptionen</div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto p-6 flex flex-col gap-3"
            onClick={() => handleDesignTypeSelection('personalized')}
          >
            <User className="h-8 w-8 text-indigo-600" />
            <div className="text-center">
              <div className="font-semibold">Personalisierbares Design</div>
              <div className="text-sm text-slate-500">Design mit anpassbaren Parametern für Personalisierung</div>
            </div>
          </Button>
        </div>
      </>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredOwnDesigns.map((design) => (
        <Card 
          key={design.id} 
          className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleDesignClick(design.id)}
        >
          {showImages && design.preview_image_path && (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img 
                src={getFileUrl(design.preview_image_path)} 
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
              {design.version} • {new Date(design.created_at).toLocaleDateString('de-DE')}
              <Badge variant="outline" className="ml-2 text-xs">
                {categories.find(cat => cat.value === design.category)?.label}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {design.description && (
                <p className="text-sm text-slate-600 line-clamp-2">{design.description}</p>
              )}
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
                  Bearbeiten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredOwnDesigns.map((design) => (
        <Card 
          key={design.id} 
          className="bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => handleDesignClick(design.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {showImages && design.preview_image_path && (
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                  <img 
                    src={getFileUrl(design.preview_image_path)} 
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
                <p className="text-sm text-slate-600">{design.version} • {new Date(design.created_at).toLocaleDateString('de-DE')}</p>
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
                  Bearbeiten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderLibraryGridView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(showAllLibraryDesigns ? filteredLibraryDesigns : filteredLibraryDesigns.slice(0, 8)).map((design) => (
          <Card 
            key={design.id} 
            className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
            onClick={() => handleDesignClick(design.id)}
          >
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-purple-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Library
              </Badge>
            </div>
            
            {showImages && (
              <div className="relative h-36 overflow-hidden">
                <img 
                  src={design.imageUrl} 
                  alt={design.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-purple-900">{design.name}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <Badge variant="outline" className="text-xs border-purple-300">
                  {design.difficulty}
                </Badge>
                <span>⭐ {design.rating}</span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              <div className="text-xs text-purple-600 space-y-1">
                <div className="flex justify-between">
                  <span>Druckzeit:</span>
                  <span className="font-medium">{design.printTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material:</span>
                  <span className="font-medium">{design.material}</span>
                </div>
                <div className="flex justify-between">
                  <span>Downloads:</span>
                  <span className="font-medium">{design.downloads.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Geschützt
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDesignClick(design.id);
                  }}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {!showAllLibraryDesigns && filteredLibraryDesigns.length > 8 && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowAllLibraryDesigns(true)}
          >
            Show All ({filteredLibraryDesigns.length} Designs)
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      {showAllLibraryDesigns && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowAllLibraryDesigns(false)}
          >
            Show Less
          </Button>
        </div>
      )}
    </div>
  );

  const renderLibraryListView = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        {(showAllLibraryDesigns ? filteredLibraryDesigns : filteredLibraryDesigns.slice(0, 8)).map((design) => (
          <Card 
            key={design.id} 
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            onClick={() => handleDesignClick(design.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {showImages && (
                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
                    <img 
                      src={design.imageUrl} 
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-purple-900 truncate">{design.name}</h3>
                    <Badge className="bg-purple-600 text-white text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Library
                    </Badge>
                    <Badge variant="outline" className="text-xs border-purple-300">
                      {design.difficulty}
                    </Badge>
                  </div>
                  <div className="text-xs text-purple-600">
                    {design.printTime} • {design.material} • ⭐ {design.rating} • {design.downloads.toLocaleString()} Downloads
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    disabled
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Geschützt
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDesignClick(design.id);
                    }}
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {!showAllLibraryDesigns && filteredLibraryDesigns.length > 8 && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowAllLibraryDesigns(true)}
          >
            Show All ({filteredLibraryDesigns.length} Designs)
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      {showAllLibraryDesigns && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            onClick={() => setShowAllLibraryDesigns(false)}
          >
            Show Less
          </Button>
        </div>
      )}
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

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="In eigenen und Library Designs suchen..."
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

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-600 rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Meine Designs</h3>
            <p className="text-sm text-slate-600">Eigene CAD-Dateien und benutzerdefinierte Vorlagen</p>
          </div>
        </div>

        {loading ? (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Designs werden geladen...</h3>
              <p className="text-slate-600">Bitte warten Sie einen Moment.</p>
            </CardContent>
          </Card>
        ) : filteredOwnDesigns.length > 0 ? (
          <>
            <div className="text-sm text-slate-600 mb-4">
              {filteredOwnDesigns.length} Design{filteredOwnDesigns.length !== 1 ? 's' : ''} gefunden
            </div>
            {viewMode === 'grid' ? renderGridView() : renderListView()}
          </>
        ) : (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm ? 'Keine passenden Designs gefunden' : 'Noch keine Designs vorhanden'}
              </h3>
              <p className="text-slate-600">
                {searchTerm ? 'Versuchen Sie andere Suchbegriffe.' : 'Erstellen Sie Ihr erstes Design mit dem Button oben.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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
          onAddToQueue={() => {}}
          onPrintOnMachine={() => {}}
          machines={[]}
        />
      )}
    </div>
  );
};

export default DesignsTab;
