
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';

interface PartManagementControlsProps {
  onAddPart: (name: string) => void;
  onEditPart: (partId: string, newName: string) => void;
  onRemovePart: (partId: string) => void;
  currentPart: { id: string; name: string } | null;
  canRemove: boolean;
}

const PartManagementControls: React.FC<PartManagementControlsProps> = ({
  onAddPart,
  onEditPart,
  onRemovePart,
  currentPart,
  canRemove
}) => {
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState('');

  const handleAddPart = () => {
    if (newPartName.trim()) {
      onAddPart(newPartName.trim());
      setNewPartName('');
      setShowAddPartDialog(false);
    }
  };

  const handleEditPart = (partId: string, currentName: string) => {
    setEditingPart(partId);
    setEditPartName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingPart && editPartName.trim()) {
      onEditPart(editingPart, editPartName.trim());
      setEditingPart(null);
      setEditPartName('');
    }
  };

  return (
    <div className="flex gap-1">
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 w-10 p-0">
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
                placeholder="Enter part name"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPart} disabled={!newPartName.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editingPart !== null} onOpenChange={(open) => !open && setEditingPart(null)}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 w-10 p-0"
            onClick={() => currentPart && handleEditPart(currentPart.id, currentPart.name)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Part Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Part Name</Label>
              <Input
                placeholder="Enter part name"
                value={editPartName}
                onChange={(e) => setEditPartName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingPart(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!editPartName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        variant="outline" 
        size="sm" 
        className="h-10 w-10 p-0"
        onClick={() => currentPart && onRemovePart(currentPart.id)}
        disabled={!canRemove}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PartManagementControls;
