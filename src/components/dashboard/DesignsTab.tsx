
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
import { useMachines } from '@/hooks/useMachines';
import StaticDesignForm from './StaticDesignForm';
import PersonalizedDesignForm from './PersonalizedDesignForm';
import GCodeViewer from './GCodeViewer';
import DesignEditDialog from './DesignEditDialog';

interface DesignsTabProps {
  onNavigateToWhitelabelCatalog?: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToWhitelabelCatalog }) => {
  const { designs, loading } = useDesigns();
  const { machines } = useMachines();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [selectedDesignType, setSelectedDesignType] = useState<'static' | 'personalized' | null>(null);
  const [editingDesign, setEditingDesign] = useState<any>(null);

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.ean_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.cad_software?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleDesignTypeSelection = (type: 'static' | 'personalized') => {
    setSelectedDesignType(type);
  };

  const handleBackToSelection = () => {
    setSelectedDesignType(null);
  };

  const handleFormComplete = () => {
    setShowAddDialog(false);
    setSelectedDesignType(null);
  };

  const handleConfigureDesign = (design: any) => {
    setEditingDesign(design);
  };

  const handleSaveDesign = (designData: any) => {
    console.log('Saving design:', designData);
    // Here you would typically call an update function
  };

  const handleAddToQueue = (designId: number) => {
    console.log('Adding design to queue:', designId);
  };

  const handlePrintOnMachine = (designId: number, machineId: number) => {
    console.log('Printing design', designId, 'on machine', machineId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading designs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Design Library</h2>
          <p className="text-gray-600">Manage your 3D designs and G-Code files</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Design
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {!selectedDesignType ? 'Select Design Type' : 
                 selectedDesignType === 'static' ? 'Add Static Design (G-Code)' : 'Add Personalized Design'}
              </DialogTitle>
              <DialogDescription>
                {!selectedDesignType ? 'Choose the type of design you want to add' :
                 selectedDesignType === 'static' ? 'Upload a ready-to-print G-Code file' : 'Create a design with customizable parameters'}
              </DialogDescription>
            </DialogHeader>
            
            {!selectedDesignType ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className="cursor-pointer hover:bg-gray-50 transition-colors border-2"
                    onClick={() => handleDesignTypeSelection('static')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileCode className="h-5 w-5 mr-2" />
                        Static Design (G-Code)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload a ready-to-print G-Code file for direct printing
                      </p>
                      <Button className="w-full" onClick={() => handleDesignTypeSelection('static')}>
                        Select Static Design
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:bg-gray-50 transition-colors border-2"
                    onClick={() => handleDesignTypeSelection('personalized')}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        Personalized Design
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Create a design with customizable parameters
                      </p>
                      <Button className="w-full" onClick={() => handleDesignTypeSelection('personalized')}>
                        Select Personalized Design
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="outline" onClick={handleBackToSelection} className="mb-4">
                  ← Back to Selection
                </Button>
                
                {selectedDesignType === 'static' ? (
                  <StaticDesignForm
                    onCancel={handleFormComplete}
                    onSave={handleFormComplete}
                  />
                ) : (
                  <PersonalizedDesignForm
                    onCancel={handleFormComplete}
                    onSave={handleFormComplete}
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search designs by name, EAN, SKU, or CAD software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="personalized">Personalized</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedDesigns.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
          <span className="text-sm font-medium">
            {selectedDesigns.length} Design(s) selected
          </span>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
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
                        {design.design_type === 'static' ? 'Static' : 'Personalized'}
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
                  <span>G-Code available ({design.gcode.split('\n').length} lines)</span>
                </div>
              )}

              {/* CAD Software for Personalized Designs */}
              {design.design_type === 'personalized' && design.cad_software && (
                <div className="text-sm">
                  <span className="font-medium">CAD Software:</span>
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
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleConfigureDesign(design)}
                >
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
          Import Designs
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
        <Checkbox
          checked={selectedDesigns.length === filteredDesigns.length && filteredDesigns.length > 0}
          onCheckedChange={handleSelectAll}
          className="ml-4"
        />
        <span className="text-sm text-gray-600">Select All</span>
      </div>

      {/* Design Edit Dialog */}
      {editingDesign && (
        <DesignEditDialog
          design={editingDesign}
          isOpen={!!editingDesign}
          onClose={() => setEditingDesign(null)}
          onSave={handleSaveDesign}
          onAddToQueue={handleAddToQueue}
          onPrintOnMachine={handlePrintOnMachine}
          machines={machines}
        />
      )}
    </div>
  );
};

export default DesignsTab;
