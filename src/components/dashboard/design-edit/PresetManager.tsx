
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash } from 'lucide-react';

interface PresetManagerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  presets: string[];
  onAddPreset: (preset: string) => void;
  onEditPreset: (oldPreset: string, newPreset: string) => void;
  onDeletePreset: (preset: string) => void;
  placeholder?: string;
}

const PresetManager: React.FC<PresetManagerProps> = ({
  label,
  value,
  onValueChange,
  presets,
  onAddPreset,
  onEditPreset,
  onDeletePreset,
  placeholder
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState('');
  const [editPresetName, setEditPresetName] = useState('');

  const handleAddPreset = () => {
    if (newPresetName.trim()) {
      onAddPreset(newPresetName.trim());
      setNewPresetName('');
      setShowAddDialog(false);
    }
  };

  const handleEditPreset = (preset: string) => {
    setEditingPreset(preset);
    setEditPresetName(preset);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingPreset && editPresetName.trim()) {
      onEditPreset(editingPreset, editPresetName.trim());
      setEditingPreset('');
      setEditPresetName('');
      setShowEditDialog(false);
    }
  };

  const handleDeletePreset = (preset: string) => {
    onDeletePreset(preset);
    if (value === preset) {
      onValueChange('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {presets.map((preset) => (
              <SelectItem key={preset} value={preset}>
                <div className="flex items-center justify-between w-full">
                  <span>{preset}</span>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPreset(preset);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
            ))}
            {presets.length === 0 && (
              <SelectItem value="" disabled>
                No presets available
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Add Preset Button */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New {label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{label} Name</Label>
                <Input
                  placeholder={`Enter ${label.toLowerCase()} name`}
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPreset} disabled={!newPresetName.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Preset Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{label} Name</Label>
              <Input
                placeholder={`Enter ${label.toLowerCase()} name`}
                value={editPresetName}
                onChange={(e) => setEditPresetName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!editPresetName.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresetManager;
