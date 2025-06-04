
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDesigns } from '@/hooks/useDesigns';
import { useMachines } from '@/hooks/useMachines';
import DesignsHeader from './designs/DesignsHeader';
import DesignsFilters from './designs/DesignsFilters';
import DesignsGrid from './designs/DesignsGrid';
import WhitelabelPromoCard from './designs/WhitelabelPromoCard';
import DesignEditDialog from './DesignEditDialog';

interface DesignsTabProps {
  onNavigateToWhitelabelCatalog?: () => void;
}

const DesignsTab: React.FC<DesignsTabProps> = ({ onNavigateToWhitelabelCatalog }) => {
  const { designs, loading, deleteDesign } = useDesigns();
  const { machines } = useMachines();
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
    // This will be handled by the DesignCard component
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
      <DesignsHeader
        showAddDialog={showAddDialog}
        setShowAddDialog={setShowAddDialog}
        selectedDesignType={selectedDesignType}
        setSelectedDesignType={setSelectedDesignType}
        isSelectionMode={isSelectionMode}
        selectedDesigns={selectedDesigns}
        handleToggleSelectionMode={handleToggleSelectionMode}
        handleStartSelectionMode={handleStartSelectionMode}
      />

      <DesignsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        categories={categories}
      />

      <DesignsGrid
        filteredDesigns={filteredDesigns}
        isSelectionMode={isSelectionMode}
        selectedDesigns={selectedDesigns}
        onSelectDesign={handleSelectDesign}
        onConfigureDesign={handleConfigureDesign}
        onDownloadDesign={handleDownloadDesign}
      />

      <WhitelabelPromoCard onNavigateToWhitelabelCatalog={onNavigateToWhitelabelCatalog} />

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
