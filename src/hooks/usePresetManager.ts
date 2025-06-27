
import { useState } from 'react';

interface PresetManagerState {
  colors: string[];
  machineTypes: string[];
  filamentTypes: string[];
}

export const usePresetManager = () => {
  const [presets, setPresets] = useState<PresetManagerState>({
    colors: [],
    machineTypes: [],
    filamentTypes: []
  });

  const [editingPreset, setEditingPreset] = useState<{
    type: 'colors' | 'machineTypes' | 'filamentTypes';
    index: number;
    value: string;
  } | null>(null);

  const [showAddDialog, setShowAddDialog] = useState<{
    type: 'colors' | 'machineTypes' | 'filamentTypes';
    isOpen: boolean;
  }>({ type: 'colors', isOpen: false });

  const [newPresetValue, setNewPresetValue] = useState('');

  const addPreset = (type: 'colors' | 'machineTypes' | 'filamentTypes', value: string) => {
    if (value.trim() && !presets[type].includes(value.trim())) {
      setPresets(prev => ({
        ...prev,
        [type]: [...prev[type], value.trim()]
      }));
    }
  };

  const removePreset = (type: 'colors' | 'machineTypes' | 'filamentTypes', index: number) => {
    setPresets(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updatePreset = (type: 'colors' | 'machineTypes' | 'filamentTypes', index: number, newValue: string) => {
    if (newValue.trim() && !presets[type].includes(newValue.trim())) {
      setPresets(prev => ({
        ...prev,
        [type]: prev[type].map((item, i) => i === index ? newValue.trim() : item)
      }));
    }
  };

  const startEditing = (type: 'colors' | 'machineTypes' | 'filamentTypes', index: number, currentValue: string) => {
    setEditingPreset({ type, index, value: currentValue });
  };

  const saveEdit = () => {
    if (editingPreset) {
      updatePreset(editingPreset.type, editingPreset.index, editingPreset.value);
      setEditingPreset(null);
    }
  };

  const cancelEdit = () => {
    setEditingPreset(null);
  };

  const openAddDialog = (type: 'colors' | 'machineTypes' | 'filamentTypes') => {
    setShowAddDialog({ type, isOpen: true });
    setNewPresetValue('');
  };

  const closeAddDialog = () => {
    setShowAddDialog({ type: 'colors', isOpen: false });
    setNewPresetValue('');
  };

  const handleAddPreset = () => {
    if (newPresetValue.trim()) {
      addPreset(showAddDialog.type, newPresetValue);
      closeAddDialog();
    }
  };

  return {
    presets,
    editingPreset,
    showAddDialog,
    newPresetValue,
    setNewPresetValue,
    addPreset,
    removePreset,
    updatePreset,
    startEditing,
    saveEdit,
    cancelEdit,
    openAddDialog,
    closeAddDialog,
    handleAddPreset,
    setEditingPreset
  };
};
