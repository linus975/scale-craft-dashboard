
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Plus, Trash2, AlertTriangle, Check } from 'lucide-react';

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
  };
  cadSoftware?: string;
  slicer?: string;
}

interface PartSelectorProps {
  designParts: DesignPart[];
  activePart: string;
  onPartChange: (partId: string) => void;
  onAddPart: (name: string) => void;
  onRemovePart: (partId: string) => void;
  onRenamePart: (partId: string, newName: string) => void;
  onPartTypeChange: (partId: string, partType: 'static' | 'personalized') => void;
  onPartSoftwareChange: (partId: string, field: 'cadSoftware' | 'slicer', value: string) => void;
  validatePartFiles: (part: DesignPart) => { hasF3D: boolean; hasINI: boolean; hasPersonalizedFiles: boolean };
}

const PartSelector: React.FC<PartSelectorProps> = ({
  designParts,
  activePart,
  onPartChange,
  onAddPart,
  onRemovePart,
  onRenamePart,
  onPartTypeChange,
  onPartSoftwareChange,
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

  const addNewPart = () => {
    if (newPartName.trim()) {
      onAddPart(newPartName.trim());
      setNewPartName('');
      setShowAddPartDialog(false);
    }
  };

  const currentPart = designParts.find(part => part.id === activePart) || designParts[0];
  const isEditing = editingPartId === activePart;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        {/* Part Type Selection */}
        <div className="flex-1">
          <Label>Teilart</Label>
          <Select 
            value={currentPart?.partType || 'static'} 
            onValueChange={(value) => onPartTypeChange(activePart, value as 'static' | 'personalized')}
            disabled={isEditing}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Teilart auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="static">Statisch</SelectItem>
              <SelectItem value="personalized">Personalisierbar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Part Selection */}
        <div className="flex-1">
          <Label>Teil auswählen</Label>
          {isEditing ? (
            <Input
              value={editPartName}
              onChange={(e) => setEditPartName(e.target.value)}
              placeholder="Teilname eingeben"
              className="h-10"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  savePartName();
                }
              }}
            />
          ) : (
            <Select value={activePart} onValueChange={onPartChange}>
              <SelectTrigger className="h-10">
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
          )}
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-end gap-1">
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
                className={`h-10 w-10 p-0 ${isEditing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                title="Neues Teil hinzufügen"
                disabled={isEditing}
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
            variant={designParts.length <= 1 || isEditing ? "outline" : "destructive"}
            size="sm"
            onClick={() => designParts.length > 1 && !isEditing && onRemovePart(activePart)}
            disabled={designParts.length <= 1 || isEditing}
            className={`h-10 w-10 p-0 ${(designParts.length <= 1 || isEditing) ? 'bg-gray-100 text-gray-400' : 'text-white'}`}
            title={designParts.length <= 1 ? "Erstes Teil kann nicht gelöscht werden" : isEditing ? "Während Bearbeitung nicht verfügbar" : "Teil löschen"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CAD Software and Slicer for Personalized Parts */}
      {currentPart?.partType === 'personalized' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>CAD-Software</Label>
            <Select
              value={currentPart?.cadSoftware}
              onValueChange={(value) => onPartSoftwareChange(activePart, 'cadSoftware', value)}
              disabled={isEditing}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="CAD-Software auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fusion360">Fusion 360</SelectItem>
                <SelectItem value="solidworks">SolidWorks</SelectItem>
                <SelectItem value="blender">Blender</SelectItem>
                <SelectItem value="freecad">FreeCAD</SelectItem>
                <SelectItem value="onshape">Onshape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Slicer-Software</Label>
            <Select
              value={currentPart?.slicer}
              onValueChange={(value) => onPartSoftwareChange(activePart, 'slicer', value)}
              disabled={isEditing}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Slicer-Software auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cura">Ultimaker Cura</SelectItem>
                <SelectItem value="prusaslicer">PrusaSlicer</SelectItem>
                <SelectItem value="superslicer">SuperSlicer</SelectItem>
                <SelectItem value="bambu">Bambu Studio</SelectItem>
                <SelectItem value="simplify3d">Simplify3D</SelectItem>
                <SelectItem value="ideamaker">IdeaMaker</SelectItem>
                <SelectItem value="slic3r">Slic3r</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartSelector;
