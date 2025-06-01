
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import StaticDesignForm from '../StaticDesignForm';
import PersonalizedDesignForm from '../PersonalizedDesignForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode, Package } from 'lucide-react';

interface DesignsHeaderProps {
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  selectedDesignType: 'static' | 'personalized' | null;
  setSelectedDesignType: (type: 'static' | 'personalized' | null) => void;
  isSelectionMode: boolean;
  selectedDesigns: string[];
  handleToggleSelectionMode: () => void;
  handleStartSelectionMode: () => void;
}

const DesignsHeader: React.FC<DesignsHeaderProps> = ({
  showAddDialog,
  setShowAddDialog,
  selectedDesignType,
  setSelectedDesignType,
  isSelectionMode,
  selectedDesigns,
  handleToggleSelectionMode,
  handleStartSelectionMode
}) => {
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

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Design Library</h2>
        <p className="text-gray-600">Manage your 3D designs and G-Code files</p>
      </div>
      
      <div className="flex gap-2 relative">
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

        {isSelectionMode ? (
          <Button 
            variant={selectedDesigns.length > 0 ? "destructive" : "outline"}
            onClick={handleToggleSelectionMode}
            className={selectedDesigns.length > 0 ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {selectedDesigns.length > 0 ? `Delete ${selectedDesigns.length}` : 'Cancel'}
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default DesignsHeader;
