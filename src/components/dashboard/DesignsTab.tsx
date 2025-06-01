
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Package, FileCode, Calendar, User, Settings } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import StaticDesignForm from './StaticDesignForm';
import PersonalizedDesignForm from './PersonalizedDesignForm';
import GCodeViewer from './GCodeViewer';

interface DesignsTabProps {
  onNavigateToWhitelabelCatalog?: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToWhitelabelCatalog }) => {
  const { designs, loading } = useDesigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.ean_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory;
    const matchesType = selectedType === 'all' || design.design_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(designs.map(design => design.category))];

  const handleSelectDesign = (designId: string, checked: boolean) => {
    if (checked) {
      setSelectedDesigns(prev => [...prev, designId]);
    } else {
      setSelectedDesigns(prev => prev.filter(id => id !== designId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDesigns(filteredDesigns.map(design => design.id));
    } else {
      setSelectedDesigns([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Designs werden geladen...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Design-Bibliothek</h2>
          <p className="text-gray-600">Verwalten Sie Ihre 3D-Designs und G-Code Dateien</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Design hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Design-Typ auswählen</DialogTitle>
              <DialogDescription>
                Welchen Typ von Design möchten Sie hinzufügen?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <FileCode className="h-4 w-4 mr-2" />
                    Statisches Design (G-Code)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Laden Sie eine fertige G-Code Datei hoch für direktes Drucken
                  </p>
                  <StaticDesignForm
                    onCancel={() => setShowAddDialog(false)}
                    onSave={() => setShowAddDialog(false)}
                  />
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Personalisierbares Design
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Erstellen Sie ein Design mit anpassbaren Parametern
                  </p>
                  <PersonalizedDesignForm
                    onCancel={() => setShowAddDialog(false)}
                    onSave={() => setShowAddDialog(false)}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Nach Designs suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="static">Statisch</SelectItem>
            <SelectItem value="personalized">Personalisierbar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedDesigns.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedDesigns.length} Design(s) ausgewählt
          </span>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportieren
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
          </Button>
        </div>
      )}

      {/* Design Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesigns.map((design) => (
          <Card key={design.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedDesigns.includes(design.id)}
                    onCheckedChange={(checked) => handleSelectDesign(design.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{design.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={design.design_type === 'static' ? 'default' : 'secondary'}>
                        {design.design_type === 'static' ? 'Statisch' : 'Personalisierbar'}
                      </Badge>
                      <Badge variant="outline">{design.category}</Badge>
                      {design.tracking_type && (
                        <Badge variant="outline" className="text-xs">
                          {design.tracking_type.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {design.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{design.description}</p>
              )}
              
              {design.ean_number && (
                <div className="text-sm">
                  <span className="font-medium">
                    {design.tracking_type === 'ean' ? 'EAN:' : 'SKU:'}
                  </span>
                  <span className="ml-1">{design.ean_number}</span>
                </div>
              )}

              {/* G-Code File Display for Static Designs */}
              {design.design_type === 'static' && design.gcode_file_path && (
                <GCodeViewer 
                  gcodeFilePath={design.gcode_file_path} 
                  designName={design.name}
                />
              )}

              {/* Legacy G-Code Display */}
              {design.design_type === 'static' && design.gcode && !design.gcode_file_path && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileCode className="h-4 w-4" />
                  <span>G-Code verfügbar ({design.gcode.split('\n').length} Zeilen)</span>
                </div>
              )}

              {/* CAD Software for Personalized Designs */}
              {design.design_type === 'personalized' && design.cad_software && (
                <div className="text-sm">
                  <span className="font-medium">CAD-Software:</span>
                  <span className="ml-1">{design.cad_software}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(design.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Version {design.version || 'v1.0'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Import/Export Actions */}
      <div className="flex justify-center gap-3 pt-6 border-t">
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Designs importieren
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Alle exportieren
        </Button>
        <Checkbox
          checked={selectedDesigns.length === filteredDesigns.length && filteredDesigns.length > 0}
          onCheckedChange={handleSelectAll}
          className="ml-4"
        />
        <span className="text-sm text-gray-600">Alle auswählen</span>
      </div>
    </div>
  );
};

export default DesignsTab;
