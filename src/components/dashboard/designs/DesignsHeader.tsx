
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import AddDesignForm from '../AddDesignForm';

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
              <DialogTitle>Design hinzufügen</DialogTitle>
              <DialogDescription>
                Erstellen Sie ein neues Design mit allen erforderlichen Informationen und Dateien.
              </DialogDescription>
            </DialogHeader>
            
            <AddDesignForm
              onCancel={handleFormComplete}
              onSave={handleFormComplete}
            />
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
