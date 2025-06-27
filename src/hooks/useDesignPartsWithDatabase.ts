import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DesignPart } from '@/types/designPart';

export const useDesignPartsWithDatabase = (productId?: string) => {
  const [designParts, setDesignParts] = useState<DesignPart[]>([]);
  const [activePart, setActivePart] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load parts from database
  useEffect(() => {
    if (productId) {
      loadPartsFromDatabase(productId);
    } else {
      // Create default part if no product ID
      const defaultPart: DesignPart = {
        id: 'temp-main',
        name: 'Main Part',
        files: [],
        partType: 'static',
        parameters: {
          sketchName: '',
          replacementValue: '',
          replacementType: 'text'
        },
        cadSoftware: '',
        slicer: '',
        nozzleDiameter: '',
        filamentType: '',
        color: '',
        machine: ''
      };
      setDesignParts([defaultPart]);
      setActivePart(defaultPart.id);
      setLoading(false);
    }
  }, [productId]);

  const loadPartsFromDatabase = async (productId: string) => {
    try {
      setLoading(true);
      console.log(`🔄 Loading parts for product: ${productId}`);
      
      const { data: parts, error } = await supabase
        .from('parts')
        .select('*')
        .eq('product_id', productId);

      if (error) {
        console.error('❌ Error loading parts:', error);
        toast({
          title: "Fehler beim Laden der Parts",
          description: "Parts konnten nicht geladen werden.",
          variant: "destructive",
        });
        return;
      }

      if (!parts || parts.length === 0) {
        console.log('📝 No parts found, creating default part');
        await createDefaultPart(productId);
        return;
      }

      // Convert database parts to DesignPart format
      const convertedParts: DesignPart[] = parts.map(part => ({
        id: part.part_id, // Use the new part_id UUID
        name: part.part_name,
        files: [],
        partType: part.is_customizable ? 'personalizable' : 'static',
        parameters: {
          sketchName: part.sketch_name || '',
          replacementValue: '',
          replacementType: (part.replacement_type as 'text' | 'dimension') || 'text'
        },
        cadSoftware: part.cad_software || '',
        slicer: part.slicer_software || '',
        nozzleDiameter: part.nozzle_diameter?.toString() || '',
        filamentType: part.filament_type || '',
        color: part.color || '',
        machine: part.printer_model || ''
      }));

      console.log(`✅ Loaded ${convertedParts.length} parts from database`);
      setDesignParts(convertedParts);
      setActivePart(convertedParts[0]?.id || '');

    } catch (error) {
      console.error('❌ Unexpected error loading parts:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Beim Laden der Parts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPart = async (productId: string) => {
    try {
      console.log('📝 Creating default part for product:', productId);
      
      const { data: newPart, error } = await supabase
        .from('parts')
        .insert({
          product_id: productId,
          part_name: 'Main Part',
          is_customizable: false,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating default part:', error);
        return;
      }

      const convertedPart: DesignPart = {
        id: newPart.part_id,
        name: newPart.part_name,
        files: [],
        partType: 'static',
        parameters: {
          sketchName: '',
          replacementValue: '',
          replacementType: 'text'
        },
        cadSoftware: '',
        slicer: '',
        nozzleDiameter: '',
        filamentType: '',
        color: '',
        machine: ''
      };

      setDesignParts([convertedPart]);
      setActivePart(convertedPart.id);
      
      console.log('✅ Created default part with ID:', convertedPart.id);

    } catch (error) {
      console.error('❌ Error creating default part:', error);
    }
  };

  const handleAddPart = async (name: string) => {
    if (!productId) {
      toast({
        title: "Fehler",
        description: "Keine Product ID verfügbar.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`📝 Creating new part: ${name}`);
      
      const { data: newPart, error } = await supabase
        .from('parts')
        .insert({
          product_id: productId,
          part_name: name,
          is_customizable: false,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating part:', error);
        toast({
          title: "Fehler beim Erstellen",
          description: "Part konnte nicht erstellt werden.",
          variant: "destructive",
        });
        return;
      }

      const convertedPart: DesignPart = {
        id: newPart.part_id,
        name: newPart.part_name,
        files: [],
        partType: 'static',
        parameters: {
          sketchName: '',
          replacementValue: '',
          replacementType: 'text'
        },
        cadSoftware: '',
        slicer: '',
        nozzleDiameter: '',
        filamentType: '',
        color: '',
        machine: ''
      };

      setDesignParts(prev => [...prev, convertedPart]);
      setActivePart(convertedPart.id);
      
      console.log('✅ Created part with database ID:', convertedPart.id);
      
      toast({
        title: "Part erstellt",
        description: `Part "${name}" wurde erfolgreich erstellt.`,
      });

    } catch (error) {
      console.error('❌ Unexpected error creating part:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Beim Erstellen des Parts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePart = async (partId: string) => {
    if (designParts.length <= 1) return;

    try {
      console.log(`🗑️ Removing part: ${partId}`);
      
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('part_id', partId);

      if (error) {
        console.error('❌ Error removing part:', error);
        toast({
          title: "Fehler beim Löschen",
          description: "Part konnte nicht gelöscht werden.",
          variant: "destructive",
        });
        return;
      }

      setDesignParts(prev => prev.filter(part => part.id !== partId));
      
      if (activePart === partId) {
        const remainingParts = designParts.filter(part => part.id !== partId);
        if (remainingParts.length > 0) {
          setActivePart(remainingParts[0].id);
        }
      }

      console.log('✅ Removed part from database');
      
      toast({
        title: "Part gelöscht",
        description: "Part wurde erfolgreich gelöscht.",
      });

    } catch (error) {
      console.error('❌ Unexpected error removing part:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Beim Löschen des Parts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleRenamePart = async (partId: string, newName: string) => {
    try {
      console.log(`✏️ Renaming part ${partId} to: ${newName}`);
      
      const { error } = await supabase
        .from('parts')
        .update({ part_name: newName })
        .eq('part_id', partId);

      if (error) {
        console.error('❌ Error renaming part:', error);
        toast({
          title: "Fehler beim Umbenennen",
          description: "Part konnte nicht umbenannt werden.",
          variant: "destructive",
        });
        return;
      }

      setDesignParts(prev => prev.map(part =>
        part.id === partId ? { ...part, name: newName } : part
      ));

      console.log('✅ Renamed part in database');
      
      toast({
        title: "Part umbenannt",
        description: `Part wurde zu "${newName}" umbenannt.`,
      });

    } catch (error) {
      console.error('❌ Unexpected error renaming part:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Beim Umbenennen des Parts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handlePartTypeChange = async (partId: string, partType: 'static' | 'personalizable') => {
    try {
      console.log(`🔄 Changing part ${partId} type to: ${partType}`);
      
      const { error } = await supabase
        .from('parts')
        .update({ is_customizable: partType === 'personalizable' })
        .eq('part_id', partId);

      if (error) {
        console.error('❌ Error updating part type:', error);
        toast({
          title: "Fehler beim Ändern des Part-Typs",
          description: "Part-Typ konnte nicht geändert werden.",
          variant: "destructive",
        });
        return;
      }

      setDesignParts(prev => prev.map(part =>
        part.id === partId ? { ...part, partType } : part
      ));

      console.log('✅ Updated part type in database');

    } catch (error) {
      console.error('❌ Unexpected error updating part type:', error);
      toast({
        title: "Unerwarteter Fehler",
        description: "Beim Ändern des Part-Typs ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handlePartParametersChange = async (partId: string, field: string, value: string) => {
    try {
      console.log(`🔄 Updating part ${partId} parameter ${field} to: ${value}`);
      
      const updateData: Record<string, any> = {};
      
      if (field === 'sketchName') {
        updateData.sketch_name = value;
      } else if (field === 'replacementType') {
        updateData.replacement_type = value;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('parts')
          .update(updateData)
          .eq('part_id', partId);

        if (error) {
          console.error('❌ Error updating part parameters:', error);
          return;
        }
      }

      setDesignParts(prev => prev.map(part => 
        part.id === partId 
          ? { 
              ...part, 
              parameters: { 
                ...part.parameters, 
                [field]: value
              } 
            }
          : part
      ));

    } catch (error) {
      console.error('❌ Unexpected error updating part parameters:', error);
    }
  };

  const handlePartSpecificationChange = async (partId: string, field: 'nozzleDiameter' | 'filamentType' | 'color' | 'machine', value: string) => {
    try {
      console.log(`🔄 Updating part ${partId} specification ${field} to: ${value}`);
      
      const updateData: Record<string, any> = {};
      
      switch (field) {
        case 'nozzleDiameter':
          updateData.nozzle_diameter = parseFloat(value) || null;
          break;
        case 'filamentType':
          updateData.filament_type = value;
          break;
        case 'color':
          updateData.color = value;
          break;
        case 'machine':
          updateData.printer_model = value;
          break;
      }

      const { error } = await supabase
        .from('parts')
        .update(updateData)
        .eq('part_id', partId);

      if (error) {
        console.error('❌ Error updating part specifications:', error);
        return;
      }

      setDesignParts(prev => prev.map(part =>
        part.id === partId ? { ...part, [field]: value } : part
      ));

      console.log('✅ Updated part specifications in database');

    } catch (error) {
      console.error('❌ Unexpected error updating part specifications:', error);
    }
  };

  const validatePartFiles = (part: DesignPart) => {
    const hasF3D = part.files?.some(file => file.name?.toLowerCase().endsWith('.f3d')) || false;
    const hasINI = part.files?.some(file => file.name?.toLowerCase().endsWith('.ini')) || false;
    const hasPersonalizedFiles = hasF3D || hasINI;
    
    return { hasF3D, hasINI, hasPersonalizedFiles };
  };

  return {
    designParts,
    activePart,
    loading,
    setActivePart,
    handleAddPart,
    handleRemovePart,
    handleRenamePart,
    handlePartTypeChange,
    handlePartParametersChange,
    handlePartSpecificationChange,
    validatePartFiles,
    loadPartsFromDatabase
  };
};
