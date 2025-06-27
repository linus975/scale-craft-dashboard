
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';

interface PresetManagementControlsProps {
  presetType: 'color' | 'machine' | 'filament';
  presets: string[];
  currentValue: string;
  onAddPreset: (value: string) => void;
  onEditPreset: (index: number, value: string) => void;
  onDeletePreset: (index: number) => void;
  onValueChange: (value: string) => void;
}

const PresetManagementControls: React.FC<PresetManagementControlsProps> = ({
  presetType,
  presets,
  currentValue,
  onAddPreset,
  onEditPreset,
  onDeletePreset,
  onValueChange
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (newValue.trim()) {
      onAddPreset(newValue.trim());
      onValueChange(newValue.trim());
      setNewValue('');
      setShowAddDialog(false);
    }
  };

  const handleEdit = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditValue(currentValue);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const oldValue = presets[editingIndex];
      onEditPreset(editingIndex, editValue.trim());
      if (currentValue === oldValue) {
        onValueChange(editValue.trim());
      }
      setEditingIndex(null);
      setEditValue('');
      setShowEditDialog(false);
    }
  };

  const handleDelete = (index: number) => {
    const deletedValue = presets[index];
    onDeletePreset(index);
    if (currentValue === deletedValue) {
      onValueChange('');
    }
  };

  const getTitle = () => {
    switch (presetType) {
      case 'color': return 'Color';
      case 'machine': return 'Machine';
      case 'filament': return 'Filament';
    }
  };

  return (
    <div className="flex gap-1">
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 w-10 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {getTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{getTitle()} Name</Label>
              <Input
                placeholder={`Enter ${presetType} name`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!newValue.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 w-10 p-0"
            onClick={() => {
              const selectedIndex = presets.findIndex(preset => preset === currentValue);
              if (selectedIndex !== -1) {
                handleEdit(selectedIndex, currentValue);
              }
            }}
            disabled={!currentValue}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {getTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{getTitle()} Name</Label>
              <Input
                placeholder={`Enter ${presetType} name`}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!editValue.trim()}>
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
        onClick={() => {
          const selectedIndex = presets.findIndex(preset => preset === currentValue);
          if (selectedIndex !== -1) {
            handleDelete(selectedIndex);
          }
        }}
        disabled={!currentValue || presets.length <= 1}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PresetManagementControls;
