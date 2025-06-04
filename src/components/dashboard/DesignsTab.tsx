
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

  // Debug logging
  console.log('🎨 DesignsTab render:', { 
    designsCount: designs.length, 
    loading, 
    searchTerm, 
    selectedCategory, 
    selectedType 
  });

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.ean_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         design.cad_software?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || design.category === selectedCategory;
    const matchesType = selectedType === 'all' || design.design_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  console.log('🔍 Filtered designs:', filteredDesigns.length);

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
    return (
      <div className="flex justify-center items-center p-8 min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Designs werden geladen...</p>
        </div>
      </div>
    );
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

      {designs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Designs vorhanden</h3>
          <p className="text-gray-500 mb-4">Erstellen Sie Ihr erstes Design, um zu beginnen.</p>
          <button
            onClick={() => setShowAddDialog(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Erstes Design erstellen
          </button>
        </div>
      ) : filteredDesigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Designs gefunden</h3>
          <p className="text-gray-500">Versuchen Sie es mit anderen Suchbegriffen oder Filtern.</p>
        </div>
      ) : (
        <DesignsGrid
          filteredDesigns={filteredDesigns}
          isSelectionMode={isSelectionMode}
          selectedDesigns={selectedDesigns}
          onSelectDesign={handleSelectDesign}
          onConfigureDesign={handleConfigureDesign}
          onDownloadDesign={handleDownloadDesign}
        />
      )}

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
