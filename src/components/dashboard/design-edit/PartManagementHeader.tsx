
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import PartTypeSelector from './PartTypeSelector';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'customisable';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
  cadSoftware?: string;
  slicer?: string;
}

interface PartManagementHeaderProps {
  designParts: DesignPart[];
  activePart: string;
  onPartChange: (partId: string) => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
  onRenamePart: (partId: string, newName: string) => void;
  onPartTypeChange: (partId: string, partType: 'static' | 'customisable') => void;
  validatePartFiles: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
}

const PartManagementHeader: React.FC<PartManagementHeaderProps> = ({
  designParts,
  activePart,
  onPartChange,
  onAddPart,
  onRemovePart,
  onRenamePart,
  onPartTypeChange,
  validatePartFiles
}) => {
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

  const currentPart = designParts.find(part => part.id === activePart) || designParts[0];
  const isEditing = editingPartId === activePart;

  const startEditingPart = (partId: string, currentName: string) => {
    setEditingPartId(partId);
    setEditPartName(currentName);
  };

  const savePartName = () => {
    if (editingPartId && editPartName.trim()) {
      onRenamePart(editingPartId, editPartName.trim());
    }
    setEditingPartId(null);
    setEditPartName('');
  };

  const addNewPart = () => {
    if (newPartName.trim()) {
      onAddPart(newPartName.trim());
      setNewPartName('');
      setShowAddPartDialog(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isEditing) {
        savePartName();
      } else {
        addNewPart();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 items-end">
        {/* Select Part and Controls grouped together */}
        <div className="col-span-6">
          <Label>Select Part</Label>
          {isEditing ? (
            <Input
              value={editPartName}
              onChange={(e) => setEditPartName(e.target.value)}
              placeholder="Enter part name"
              className="h-10"
              onKeyPress={handleKeyPress}
            />
          ) : (
            <Select value={activePart} onValueChange={onPartChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select part" />
              </SelectTrigger>
              <SelectContent>
                {designParts.map((part) => {
                  if (!part.id || part.id.trim() === '') {
                    return null;
                  }
                  
                  const partValidation = validatePartFiles(part);
                  const needsValidation = partValidation.hasPersonalizedFiles && (!partValidation.hasF3D || !partValidation.hasINI);
                  
                  return (
                    <SelectItem key={part.id} value={part.id}>
                      <div className="flex items-center gap-2">
                        {part.name}
                        {needsValidation && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Part Controls */}
        <div className="col-span-3 flex gap-1 justify-start">
          {/* Edit Part Name */}
          {isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={savePartName}
              className="h-10 w-10 p-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startEditingPart(activePart, currentPart?.name || '')}
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

        {/* Part Type */}
        <div className="col-span-3">
          <PartTypeSelector
            partType={currentPart?.partType || 'static'}
            onPartTypeChange={(partType) => onPartTypeChange(activePart, partType)}
            disabled={isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default PartManagementHeader;
