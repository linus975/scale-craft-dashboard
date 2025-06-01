import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Package, FileCode, Calendar, User, Settings, ArrowRight, Star, MoreVertical } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useMachines } from '@/hooks/useMachines';
import { useFileUpload } from '@/hooks/useFileUpload';
import StaticDesignForm from './StaticDesignForm';
import PersonalizedDesignForm from './PersonalizedDesignForm';
import GCodeViewer from './GCodeViewer';
import DesignEditDialog from './DesignEditDialog';

interface DesignsTabProps {
  onNavigateToWhitelabelCatalog?: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToWhitelabelCatalog }) => {
  const { designs, loading, deleteDesign } = useDesigns();
  const { machines } = useMachines();
  const { getFileUrl } = useFileUpload();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [selectedDesignType, setSelectedDesignType] = useState<'static' | 'personalized' | null>(null);
  const [editingDesign, setEditingDesign] = useState<any>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleSelectDesign = (designId: string) => {
    if (selectedDesigns.includes(designId)) {
      setSelectedDesigns(prev => prev.filter(id => id !== designId));
    } else {
      setSelectedDesigns(prev => [...prev, designId]);
    }
  };

  const handleToggleSelectionMode = () => {
    if (isSelectionMode && selectedDesigns.length > 0) {
      setShowDeleteDialog(true);
    } else {
      setIsSelectionMode(!isSelectionMode);
      setSelectedDesigns([]);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      for (const designId of selectedDesigns) {
        await deleteDesign(designId);
      }
      setSelectedDesigns([]);
      setIsSelectionMode(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting designs:', error);
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

  const handleDownloadDesign = (design: any) => {
    if (design.design_type === 'static') {
      if (design.gcode_file_path) {
        // Download G-code file from storage
        const fileUrl = getFileUrl(design.gcode_file_path);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${design.name}.gcode`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (design.gcode) {
        // Download legacy G-code from database
        const blob = new Blob([design.gcode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${design.name}.gcode`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else if (design.design_type === 'personalized') {
      if (design.cad_file_path) {
        // Download CAD file from storage
        const fileUrl = getFileUrl(design.cad_file_path);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${design.name}.f3d`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleStartSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedDesigns([]);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading designs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button and More Actions Menu */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Design Library</h2>
          <p className="text-gray-600">Manage your 3D designs and G-Code files</p>
        </div>
        
        <div className="flex gap-2">
          {isSelectionMode && (
            <Button 
              variant={selectedDesigns.length > 0 ? "destructive" : "outline"}
              onClick={handleToggleSelectionMode}
              className={selectedDesigns.length > 0 ? "bg-red-600 hover:bg-red-700" : ""}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {selectedDesigns.length > 0 ? `Delete ${selectedDesigns.length}` : 'Cancel'}
            </Button>
          )}
          
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
                  <div className="grid grid-cols-1 gap-4">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartSelectionMode}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Designs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Import Designs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          <Card 
            key={design.id} 
            className={`hover:shadow-md transition-all cursor-pointer ${
              isSelectionMode && selectedDesigns.includes(design.id) 
                ? 'border-2 border-red-400 bg-red-50' 
                : 'hover:shadow-md'
            }`}
            onClick={isSelectionMode ? () => handleSelectDesign(design.id) : undefined}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{design.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={design.design_type === 'static' ? 'outline' : 'default'}
                      className={design.design_type === 'static' ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'}
                    >
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownloadDesign(design)}
                  disabled={design.design_type === 'static' ? !design.gcode_file_path && !design.gcode : !design.cad_file_path}
                >
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

      {/* Whitelabel Catalog Promotion Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">Design Library</CardTitle>
                <CardDescription className="text-slate-600">
                  Erweitern Sie Ihr Angebot mit professionellen Whitelabel-Katalogen
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Neu
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-700">
              Mieten Sie komplette Design-Kataloge für nur <span className="font-bold text-blue-600">30€ pro Monat</span> und bieten Sie Ihren Kunden sofort hunderte von professionellen 3D-Designs an.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Über 300 Designs verfügbar</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Settings className="h-4 w-4 text-blue-500" />
                <span>Kommerzielle Nutzungsrechte</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-green-500" />
                <span>Monatlich kündbar</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={onNavigateToWhitelabelCatalog}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Kataloge durchsuchen
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Designs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedDesigns.length} design(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DesignsTab;
