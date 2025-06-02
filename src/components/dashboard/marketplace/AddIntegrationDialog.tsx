
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'lucide-react';

interface Marketplace {
  id: string;
  name: string;
  icon: string;
}

interface AddIntegrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onMarketplaceSelect: (marketplace: Marketplace) => void;
}

const AddIntegrationDialog: React.FC<AddIntegrationDialogProps> = ({
  isOpen,
  onOpenChange,
  onMarketplaceSelect
}) => {
  const availableMarketplaces = [
    { id: 'ebay', name: 'eBay', icon: '🛒' },
    { id: 'amazon', name: 'Amazon', icon: '📦' },
    { id: 'hood', name: 'Hood', icon: '🏪' },
    { id: 'kaufland', name: 'Kaufland', icon: '🏬' },
    { id: 'shopify', name: 'Shopify', icon: '🛍️' },
    { id: 'custom', name: 'Custom API', icon: '🔌' }
  ];

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
              className="h-16 flex flex-col gap-1"
              onClick={() => onMarketplaceSelect(marketplace)}
            >
              <span className="text-lg">{marketplace.icon}</span>
              <span className="text-xs">{marketplace.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddIntegrationDialog;
