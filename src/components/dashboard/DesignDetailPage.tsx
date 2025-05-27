
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Download, Edit, Plus, Printer, Settings, FileText, Calendar, User, Monitor, Crown, Lock, PlayCircle, Clock, Thermometer } from 'lucide-react';

interface DesignDetailPageProps {
  designId: number;
  onBack: () => void;
}

const DesignDetailPage: React.FC<DesignDetailPageProps> = ({ designId, onBack }) => {
  // Library designs with enhanced data
  const libraryDesigns = [
    {
      id: 101,
      name: "Premium Phone Grip",
      category: "accessories",
      difficulty: "Einfach",
      printTime: "45 min",
      material: "PLA",
      rating: 4.9,
      downloads: 1250,
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
      isLibrary: true,
      nozzleSize: "0.4mm",
      layerHeight: "0.2mm",
      infill: "20%",
      supportMaterial: "No",
      printSpeed: "50mm/s",
      bedTemperature: "60°C",
      extruderTemperature: "210°C",
      fileSize: "3.2 MB",
      description: "Ein ergonomischer Handygriff aus hochwertigem PLA-Kunststoff für bessere Handhabung. Optimiert für alle gängigen Smartphone-Größen und bietet sicheren Halt bei der einhändigen Bedienung.",
      tags: ["phone", "grip", "ergonomic", "accessories"]
    },
    {
      id: 102,
      name: "Modular Desktop Organizer",
      category: "office",
      difficulty: "Mittel",
      printTime: "2h 30min",
      material: "PETG",
      rating: 4.8,
      downloads: 890,
      imageUrl: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=800&h=600&fit=crop",
      isLibrary: true,
      nozzleSize: "0.4mm",
      layerHeight: "0.25mm",
      infill: "25%",
      supportMaterial: "Yes",
      printSpeed: "40mm/s",
      bedTemperature: "70°C",
      extruderTemperature: "230°C",
      fileSize: "5.1 MB",
      description: "Ein modulares Organizer-System für den Schreibtisch mit verschiedenen Fächern und Stifthaltern. Kann individuell angepasst und erweitert werden.",
      tags: ["office", "organizer", "modular", "desk"]
    },
    {
      id: 103,
      name: "Cable Management System",
      category: "office",
      difficulty: "Einfach",
      printTime: "1h 15min",
      material: "PLA",
      rating: 4.7,
      downloads: 2100,
      imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop",
      isLibrary: true,
      nozzleSize: "0.4mm",
      layerHeight: "0.2mm",
      infill: "15%",
      supportMaterial: "No",
      printSpeed: "60mm/s",
      bedTemperature: "60°C",
      extruderTemperature: "200°C",
      fileSize: "2.8 MB",
      description: "Ein elegantes Kabelmanagement-System zur Organisation von Kabeln auf dem Schreibtisch. Verhindert Kabelsalat und sorgt für einen aufgeräumten Arbeitsplatz.",
      tags: ["cable", "management", "office", "organization"]
    },
    {
      id: 104,
      name: "Ergonomic Laptop Stand",
      category: "accessories",
      difficulty: "Schwer",
      printTime: "4h 20min",
      material: "ABS",
      rating: 4.9,
      downloads: 750,
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
      isLibrary: true,
      nozzleSize: "0.6mm",
      layerHeight: "0.3mm",
      infill: "30%",
      supportMaterial: "Yes",
      printSpeed: "30mm/s",
      bedTemperature: "90°C",
      extruderTemperature: "250°C",
      fileSize: "8.7 MB",
      description: "Ein ergonomischer Laptop-Ständer für bessere Körperhaltung und Arbeitskomfort. Verstellbare Winkel und stabile Konstruktion für alle Laptop-Größen.",
      tags: ["laptop", "stand", "ergonomic", "workspace"]
    }
  ];

  // Mock design data - in real app this would come from API/database
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
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
      description: "Ein parametrisches Zahnrad mit anpassbarer Zähnezahl. Perfekt für mechanische Projekte und Prototyping.",
      tags: ["gear", "mechanical", "parametric"],
      fileSize: "2.4 MB",
      printTime: "45 min",
      material: "PLA",
      infill: "20%",
      layerHeight: "0.2mm"
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
      imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop",
      description: "Eine maßgeschneiderte Halterung für verschiedene Anwendungen.",
      tags: ["bracket", "support", "mechanical"],
      fileSize: "1.8 MB",
      printTime: "30 min",
      material: "PETG",
      infill: "25%",
      layerHeight: "0.15mm"
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
      imageUrl: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=800&h=600&fit=crop",
      description: "Eine Gehäusevorlage mit anpassbarer Breite für elektronische Projekte.",
      tags: ["housing", "electronics", "parametric"],
      fileSize: "3.1 MB",
      printTime: "1h 15min",
      material: "ABS",
      infill: "30%",
      layerHeight: "0.25mm"
    },
  ];

  // Find design in library first, then in regular designs
  let design = libraryDesigns.find(d => d.id === designId);
  const isLibraryDesign = !!design;
  
  if (!design) {
    design = mockDesigns.find(d => d.id === designId);
  }

  const mockMachines = [
    { id: 1, name: "Prusa i3 MK3S+", status: "idle" },
    { id: 2, name: "Bambu Lab X1 Carbon", status: "printing" },
    { id: 3, name: "Ender 3 V2", status: "offline" }
  ];

  const handleLibraryDesignPrint = (designId: number, target: 'queue' | number) => {
    if (target === 'queue') {
      console.log(`Adding library design ${designId} to print queue`);
    } else {
      console.log(`Printing library design ${designId} on machine ${target}`);
    }
  };

  if (!design) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Design nicht gefunden</h3>
            <p className="text-slate-600">Das angeforderte Design konnte nicht gefunden werden.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [
    { value: 'mechanical', label: 'Mechanische Teile' },
    { value: 'household', label: 'Haushalt' },
    { value: 'toys', label: 'Spielzeug' },
    { value: 'tools', label: 'Werkzeuge' },
    { value: 'decorative', label: 'Dekoration' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'accessories', label: 'Zubehör' },
    { value: 'office', label: 'Büro' },
  ];

  const categoryLabel = categories.find(cat => cat.value === design.category)?.label || design.category;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{design.name}</h1>
              {isLibraryDesign && (
                <Badge className="bg-purple-600 text-white">
                  <Crown className="h-4 w-4 mr-1" />
                  Library
                </Badge>
              )}
            </div>
            <p className="text-slate-600">
              {isLibraryDesign ? `Bewertung: ⭐ ${design.rating} • ${design.downloads.toLocaleString()} Downloads` : `${design.version} • ${design.lastModified}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isLibraryDesign ? (
            <>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Edit className="h-4 w-4 mr-2" />
                Bearbeiten
              </Button>
            </>
          ) : (
            <Button variant="outline" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Geschützt
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image and Actions */}
        <div className="space-y-4">
          <Card className={`${isLibraryDesign ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200' : 'bg-white/60 backdrop-blur-sm border-0'} shadow-md`}>
            <CardContent className="p-0">
              <div className="relative h-96 overflow-hidden rounded-lg">
                <img 
                  src={design.imageUrl} 
                  alt={design.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          <Card className={`${isLibraryDesign ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200' : 'bg-white/60 backdrop-blur-sm border-0'} shadow-md`}>
            <CardHeader>
              <CardTitle className="text-lg">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isLibraryDesign ? (
                <>
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Zur Warteschlange hinzufügen
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Direkt drucken
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Druckeinstellungen
                  </Button>
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Design
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => handleLibraryDesignPrint(design.id, 'queue')}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Add to Queue
                      </DropdownMenuItem>
                      {mockMachines.map((machine) => (
                        <DropdownMenuItem 
                          key={machine.id}
                          onClick={() => handleLibraryDesignPrint(design.id, machine.id)}
                          disabled={machine.status === 'offline'}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          {machine.name} ({machine.status})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button className="w-full" variant="outline" disabled>
                    <Lock className="h-4 w-4 mr-2" />
                    Download nicht verfügbar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Basic Info */}
          <Card className={`${isLibraryDesign ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200' : 'bg-white/60 backdrop-blur-sm border-0'} shadow-md`}>
            <CardHeader>
              <CardTitle className="text-lg">Design-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Beschreibung</h4>
                <p className="text-slate-600">{design.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Kategorie</h4>
                  <Badge variant="outline">{categoryLabel}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Dateigröße</h4>
                  <p className="text-slate-600">{design.fileSize}</p>
                </div>
              </div>

              {isLibraryDesign && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Schwierigkeit</h4>
                    <Badge variant="secondary">{design.difficulty}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Bewertung</h4>
                    <p className="text-slate-600">⭐ {design.rating}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {design.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          {!isLibraryDesign ? (
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Technische Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">CAD Software</h4>
                    <p className="text-slate-600 capitalize">{design.cadSoftware}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Slicer</h4>
                    <p className="text-slate-600 capitalize">{design.slicer}</p>
                  </div>
                </div>

                {design.sketchName && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Sketch Name</h4>
                      <p className="text-slate-600">{design.sketchName}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Parameter</h4>
                      <p className="text-slate-600">{design.replacementValue}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Druckparameter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                      <Monitor className="h-4 w-4" />
                      Düsengröße
                    </h4>
                    <p className="text-slate-600">{design.nozzleSize}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Schichthöhe</h4>
                    <p className="text-slate-600">{design.layerHeight}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Infill</h4>
                    <p className="text-slate-600">{design.infill}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Stützmaterial</h4>
                    <p className="text-slate-600">{design.supportMaterial}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Druckgeschwindigkeit</h4>
                    <p className="text-slate-600">{design.printSpeed}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Druckzeit
                    </h4>
                    <p className="text-slate-600">{design.printTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      Bett Temperatur
                    </h4>
                    <p className="text-slate-600">{design.bedTemperature}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      Extruder Temperatur
                    </h4>
                    <p className="text-slate-600">{design.extruderTemperature}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Print Settings for regular designs */}
          {!isLibraryDesign && (
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Druckeinstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Druckzeit</h4>
                    <p className="text-slate-600">{design.printTime}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Material</h4>
                    <p className="text-slate-600">{design.material}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Infill</h4>
                    <p className="text-slate-600">{design.infill}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Schichthöhe</h4>
                    <p className="text-slate-600">{design.layerHeight}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignDetailPage;
