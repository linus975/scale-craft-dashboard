
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link, Loader2 } from 'lucide-react';

interface Marketplace {
  id: string;
  name: string;
  icon: string;
}

interface AddIntegrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMarketplaceSelect: (marketplace: Marketplace) => void;
  loadingMarketplaces?: Record<string, boolean>;
}

const AddIntegrationDialog: React.FC<AddIntegrationDialogProps> = ({
  isOpen,
  onOpenChange,
  onMarketplaceSelect,
  loadingMarketplaces = {}
}) => {
  const availableMarketplaces = [
    { id: 'ebay', name: 'eBay', icon: '🛒' },
    { id: 'amazon', name: 'Amazon', icon: '📦' },
    { id: 'hood', name: 'Hood', icon: '🏪' },
    { id: 'kaufland', name: 'Kaufland', icon: '🏬' },
    { id: 'shopify', name: 'Shopify', icon: '🛍️' },
    { id: 'custom', name: 'Custom API', icon: '🔌' }
  ];

  const getMarketplaceIcon = (marketplace: Marketplace) => {
    if (marketplace.id === 'ebay') {
      return (
        <img 
          src="/lovable-uploads/8c476811-2af8-437a-9f0e-c124bda23526.png" 
          alt="eBay" 
          className="w-6 h-6 object-contain"
        />
      );
    }
    return <span className="text-lg">{marketplace.icon}</span>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Marketplace</DialogTitle>
          <DialogDescription>
            Choose which marketplace or shop system you want to connect
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {availableMarketplaces.map((marketplace) => (
            <Button
              key={marketplace.id}
              variant="outline"
              className="h-16 flex flex-col gap-1 relative"
              onClick={() => onMarketplaceSelect(marketplace)}
              disabled={loadingMarketplaces[marketplace.id]}
            >
              {loadingMarketplaces[marketplace.id] ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="relative">
                    <span className="text-lg opacity-50">{marketplace.icon}</span>
                    <Loader2 className="h-4 w-4 animate-spin absolute inset-0 m-auto" />
                  </div>
                  <span className="text-xs">Connecting...</span>
                </div>
              ) : (
                <>
                  {getMarketplaceIcon(marketplace)}
                  <span className="text-xs">{marketplace.name}</span>
                </>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddIntegrationDialog;
