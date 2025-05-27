
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Edit, Plus, Printer, Settings, FileText, Calendar, User, Monitor } from 'lucide-react';

interface DesignDetailPageProps {
  designId: number;
  onBack: () => void;
}

const DesignDetailPage: React.FC<DesignDetailPageProps> = ({ designId, onBack }) => {
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

  const design = mockDesigns.find(d => d.id === designId);

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
            <h1 className="text-2xl font-bold text-slate-900">{design.name}</h1>
            <p className="text-slate-600">{design.version} • {design.lastModified}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image and Actions */}
        <div className="space-y-4">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
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

          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {/* Basic Info */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
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

          {/* Print Settings */}
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
        </div>
      </div>
    </div>
  );
};

export default DesignDetailPage;
