
import { useState } from 'react';

export const useMarketplaceDialogState = () => {
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState<any>(null);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);

  return {
    isIntegrationDialogOpen,
    setIsIntegrationDialogOpen,
    isCredentialsDialogOpen,
    setIsCredentialsDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedMarketplace,
    setSelectedMarketplace,
    editingIntegration,
    setEditingIntegration
  };
};
