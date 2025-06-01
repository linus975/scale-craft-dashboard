
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Plus, Trash2, AlertTriangle } from 'lucide-react';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
}

interface PartSelectorProps {
  designParts: DesignPart[];
  activePart: string;
  onPartChange: (partId: string) => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
  onRenamePart: (partId: string, newName: string) => void;
  validatePartFiles: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
}

const PartSelector: React.FC<PartSelectorProps> = ({
  designParts,
  activePart,
  onPartChange,
  onAddPart,
  onRemovePart,
  onRenamePart,
  validatePartFiles
}) => {
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const [editPartName, setEditPartName] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);

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

  const cancelEditingPart = () => {
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

  const currentPart = designParts.find(part => part.id === activePart) || designParts[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label>Teil auswählen</Label>
          <Select value={activePart} onValueChange={onPartChange}>
            <SelectTrigger>
              <SelectValue placeholder="Teil auswählen" />
            </SelectTrigger>
            <SelectContent>
              {designParts.map((part) => {
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
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-end gap-1">
          {/* Edit Part Name */}
          {editingPartId === activePart ? (
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={savePartName}
                className="h-10"
              >
                ✓
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEditingPart}
                className="h-10"
              >
                ✗
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startEditingPart(activePart, currentPart?.name || '')}
              className="h-10 w-10 p-0"
              title="Teil bearbeiten"
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
                className="h-10 w-10 p-0"
                title="Neues Teil hinzufügen"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Teil hinzufügen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Teilname</Label>
                  <Input
                    placeholder="Name des neuen Teils..."
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addNewPart();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={addNewPart} disabled={!newPartName.trim()}>
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Delete Part */}
          <Button
            type="button"
            variant={designParts.length <= 1 ? "outline" : "destructive"}
            size="sm"
            onClick={() => designParts.length > 1 && onRemovePart(activePart)}
            disabled={designParts.length <= 1}
            className={`h-10 w-10 p-0 ${designParts.length <= 1 ? 'bg-gray-100 text-gray-400' : 'text-white'}`}
            title={designParts.length <= 1 ? "Erstes Teil kann nicht gelöscht werden" : "Teil löschen"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Part Name Editing Field */}
      {editingPartId === activePart && (
        <div>
          <Label>Teilname bearbeiten</Label>
          <Input
            value={editPartName}
            onChange={(e) => setEditPartName(e.target.value)}
            placeholder="Teilname eingeben"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                savePartName();
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PartSelector;
