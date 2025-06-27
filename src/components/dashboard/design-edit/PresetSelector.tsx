
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash } from 'lucide-react';

interface PresetSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets: string[];
  onAddPreset: () => void;
  onEditPreset: (index: number, currentValue: string) => void;
  onRemovePreset: (index: number) => void;
  showAddDialog: boolean;
  onCloseAddDialog: () => void;
  newPresetValue: string;
  onNewPresetValueChange: (value: string) => void;
  onSaveNewPreset: () => void;
  editingPreset: { index: number; value: string } | null;
  onEditValueChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  placeholder: string;
}

const PresetSelector: React.FC<PresetSelectorProps> = ({
  label,
  value,
  onChange,
  presets,
  onAddPreset,
  onEditPreset,
  onRemovePreset,
  showAddDialog,
  onCloseAddDialog,
  newPresetValue,
  onNewPresetValueChange,
  onSaveNewPreset,
  editingPreset,
  onEditValueChange,
  onSaveEdit,
  onCancelEdit,
  placeholder
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset, index) => (
              <SelectItem key={index} value={preset}>
                <div className="flex items-center justify-between w-full">
                  <span>{preset}</span>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPreset(index, preset);
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
                        onRemovePreset(index);
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={showAddDialog} onOpenChange={onCloseAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={onAddPreset}>
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
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={newPresetValue}
                  onChange={(e) => onNewPresetValueChange(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCloseAddDialog}>
                  Cancel
                </Button>
                <Button onClick={onSaveNewPreset} disabled={!newPresetValue.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingPreset !== null} onOpenChange={(open) => !open && onCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{label} Name</Label>
              <Input
                placeholder={`Enter ${label.toLowerCase()}`}
                value={editingPreset?.value || ''}
                onChange={(e) => onEditValueChange(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancelEdit}>
                Cancel
              </Button>
              <Button onClick={onSaveEdit} disabled={!editingPreset?.value.trim()}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresetSelector;
