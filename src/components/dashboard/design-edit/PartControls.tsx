
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Plus, Trash2, Check } from 'lucide-react';

interface PartControlsProps {
  designParts: any[];
  activePart: string;
  currentPartName: string;
  isEditing: boolean;
  onStartEditing: () => void;
  onSavePartName: () => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
}

const PartControls: React.FC<PartControlsProps> = ({
  designParts,
  activePart,
  currentPartName,
  isEditing,
  onStartEditing,
  onSavePartName,
  onAddPart,
  onRemovePart
}) => {
  const [newPartName, setNewPartName] = useState('');
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

  const addNewPart = () => {
    if (newPartName.trim()) {
      onAddPart(newPartName.trim());
      setNewPartName('');
      setShowAddPartDialog(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addNewPart();
    }
  };

  return (
    <div className="col-span-3 flex gap-1 justify-end">
      {/* Edit Part Name */}
      {isEditing ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSavePartName}
          className="h-10 w-10 p-0"
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onStartEditing}
          className="h-10 w-10 p-0"
          title="Edit part"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      
      {/* Add Part */}
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`h-10 w-10 p-0 ${isEditing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
            title="Add new part"
            disabled={isEditing}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Part Name</Label>
              <Input
                placeholder="Name of the new part..."
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addNewPart} disabled={!newPartName.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Part */}
      <Button
        type="button"
        variant={designParts.length <= 1 || isEditing ? "outline" : "destructive"}
        size="sm"
        onClick={() => designParts.length > 1 && !isEditing && onRemovePart(activePart)}
        disabled={designParts.length <= 1 || isEditing}
        className={`h-10 w-10 p-0 ${(designParts.length <= 1 || isEditing) ? 'bg-gray-100 text-gray-400' : 'text-white'}`}
        title={designParts.length <= 1 ? "First part cannot be deleted" : isEditing ? "Not available during editing" : "Delete part"}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PartControls;
