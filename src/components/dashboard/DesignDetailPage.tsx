
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Edit, Plus, Printer, Settings, FileText, Calendar, User, Monitor, Crown, Lock, PlayCircle, Clock, Thermometer, Search, Loader2 } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useFileUpload } from '@/hooks/useFileUpload';

interface DesignDetailPageProps {
  designId: string;
  onBack: () => void;
}

const DesignDetailPage: React.FC<DesignDetailPageProps> = ({ designId, onBack }) => {
  const { designs, loading } = useDesigns();
  const { getFileUrl } = useFileUpload();
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [queuePriority, setQueuePriority] = useState<string>('normal');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Library designs with enhanced data
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
      id: "102",
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
      id: "103",
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
      id: "104",
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

  // Find design in database first, then in library
  const dbDesign = designs.find(d => d.id === designId);
  const libraryDesign = libraryDesigns.find(d => d.id === designId);
  const design = dbDesign || libraryDesign;
  const isLibraryDesign = !!libraryDesign;

  const mockMachines = [
    { id: 1, name: "Prusa i3 MK3S+", status: "idle" },
    { id: 2, name: "Bambu Lab X1 Carbon", status: "printing" },
    { id: 3, name: "Ender 3 V2", status: "offline" },
    { id: 4, name: "Ultimaker S3", status: "idle" },
    { id: 5, name: "Creality CR-10", status: "maintenance" }
  ];

  const handleLibraryDesignPrint = (designId: string, target: 'queue' | number) => {
    if (target === 'queue') {
      console.log(`Adding design ${designId} to print queue with priority: ${queuePriority}`);
    } else {
      console.log(`Printing design ${designId} on machine ${target}`);
    }
    setIsPrintSheetOpen(false);
  };

  const handlePrintSelection = () => {
    if (selectedMachine === 'queue') {
      handleLibraryDesignPrint(design!.id, 'queue');
    } else if (selectedMachine) {
      handleLibraryDesignPrint(design!.id, parseInt(selectedMachine));
    }
  };

  // Filter machines based on search term
  const filteredMachines = mockMachines.filter(machine =>
    machine.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
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
            <Loader2 className="h-12 w-12 text-slate-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Design wird geladen...</h3>
            <p className="text-slate-600">Bitte warten Sie einen Moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {isLibraryDesign 
                ? `Bewertung: ⭐ ${(design as any).rating} • ${(design as any).downloads.toLocaleString()} Downloads` 
                : `${(design as any).version || 'v1.0'} • ${new Date((design as any).created_at || Date.now()).toLocaleDateString('de-DE')}`
              }
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
                  src={isLibraryDesign 
                    ? (design as any).imageUrl 
                    : (design as any).preview_image_path 
                      ? getFileUrl((design as any).preview_image_path)
                      : "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop"
                  } 
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
              <Sheet open={isPrintSheetOpen} onOpenChange={setIsPrintSheetOpen}>
                <SheetTrigger asChild>
                  <Button className={`w-full ${isLibraryDesign ? 'bg-purple-600 hover:bg-purple-700' : ''}`}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Print Design: {design.name}</SheetTitle>
                    <SheetDescription>
                      Wählen Sie Ihren Drucker oder fügen Sie zur Queue hinzu.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 py-6">
                    {/* Search Bar */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Drucker suchen</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Drucker-Name eingeben..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Machine Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Drucker/Queue auswählen</label>
                      <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Drucker oder Queue wählen..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          <SelectItem value="queue">📋 Zur Queue hinzufügen</SelectItem>
                          {filteredMachines.map((machine) => (
                            <SelectItem 
                              key={machine.id.toString()} 
                              value={machine.id.toString()}
                              disabled={machine.status === 'offline' || machine.status === 'maintenance'}
                            >
                              🖨️ {machine.name} ({machine.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Queue Priority Selection */}
                    {selectedMachine === 'queue' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Queue-Priorität</label>
                        <Select value={queuePriority} onValueChange={setQueuePriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            <SelectItem value="high">🔴 Vorrangig (High Priority)</SelectItem>
                            <SelectItem value="normal">🟡 Normal</SelectItem>
                            <SelectItem value="low">🟢 Nachrangig (Low Priority)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 space-y-3">
                      <Button 
                        className={`w-full ${isLibraryDesign ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                        onClick={handlePrintSelection}
                        disabled={!selectedMachine}
                      >
                        {selectedMachine === 'queue' ? 'Zur Queue hinzufügen' : 'Drucken starten'}
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => setIsPrintSheetOpen(false)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {!isLibraryDesign && (
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Druckeinstellungen
                </Button>
              )}
              
              {isLibraryDesign && (
                <Button className="w-full" variant="outline" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Download nicht verfügbar
                </Button>
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
                <p className="text-slate-600">{design.description || 'Keine Beschreibung verfügbar'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Kategorie</h4>
                  <Badge variant="outline">{categoryLabel}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Dateigröße</h4>
                  <p className="text-slate-600">{(design as any).fileSize || 'Unbekannt'}</p>
                </div>
              </div>

              {isLibraryDesign && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Schwierigkeit</h4>
                    <Badge variant="secondary">{(design as any).difficulty}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Bewertung</h4>
                    <p className="text-slate-600">⭐ {(design as any).rating}</p>
                  </div>
                </div>
              )}

              {(design as any).tags && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(design as any).tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Details for DB designs */}
          {!isLibraryDesign && (design as any).design_type === 'personalized' && (
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
                    <p className="text-slate-600 capitalize">{(design as any).cad_software || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Slicer</h4>
                    <p className="text-slate-600 capitalize">{(design as any).slicer || 'Nicht angegeben'}</p>
                  </div>
                </div>

                {((design as any).sketch_name || (design as any).replacement_value) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Sketch Name</h4>
                      <p className="text-slate-600">{(design as any).sketch_name || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Parameter</h4>
                      <p className="text-slate-600">{(design as any).replacement_value || 'Nicht angegeben'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Print Parameters */}
          <Card className={`${isLibraryDesign ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200' : 'bg-white/60 backdrop-blur-sm border-0'} shadow-md`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Druckparameter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Show data from database or library design */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Düsendurchmesser</h4>
                  <p className="text-slate-600">{(design as any).nozzle_diameter || (design as any).nozzleSize || 'Nicht angegeben'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Material</h4>
                  <p className="text-slate-600">{(design as any).material || 'Nicht angegeben'}</p>
                </div>
              </div>

              {((design as any).colors || (design as any).ean_number) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">Farben</h4>
                    <p className="text-slate-600">{(design as any).colors || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">EAN</h4>
                    <p className="text-slate-600">{(design as any).ean_number || 'Nicht angegeben'}</p>
                  </div>
                </div>
              )}

              {/* Library design specific parameters */}
              {isLibraryDesign && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Schichthöhe</h4>
                      <p className="text-slate-600">{(design as any).layerHeight}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Infill</h4>
                      <p className="text-slate-600">{(design as any).infill}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">Stützmaterial</h4>
                      <p className="text-slate-600">{(design as any).supportMaterial}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Druckzeit
                      </h4>
                      <p className="text-slate-600">{(design as any).printTime}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                        <Thermometer className="h-4 w-4" />
                        Bett Temperatur
                      </h4>
                      <p className="text-slate-600">{(design as any).bedTemperature}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1 flex items-center gap-1">
                        <Thermometer className="h-4 w-4" />
                        Extruder Temperatur
                      </h4>
                      <p className="text-slate-600">{(design as any).extruderTemperature}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Files section for database designs */}
          {!isLibraryDesign && (design as any).cad_file_path && (
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dateien
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(design as any).cad_file_path && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">CAD-Datei</h4>
                      <p className="text-sm text-slate-600">Original CAD-Design</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
                
                {(design as any).ini_file_path && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">Slicer-Konfiguration</h4>
                      <p className="text-sm text-slate-600">INI-Datei</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}

                {(design as any).gcode && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">G-Code</h4>
                      <p className="text-sm text-slate-600">Druckbereite Datei</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignDetailPage;
