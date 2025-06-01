import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import { useDesigns } from '@/hooks/useDesigns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddDesignFormProps {
  onCancel: () => void;
  onSave: () => void;
}

interface FormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  designType: string;
}

interface DesignPart {
  id: string;
  name: string;
  files: any[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
}

const AddDesignForm: React.FC<AddDesignFormProps> = ({ onCancel, onSave }) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [designParts, setDesignParts] = useState<DesignPart[]>([
    { id: 'main', name: 'Hauptteil', files: [], partType: 'static' }
  ]);
  const [activePart, setActivePart] = useState<string>('main');
  
  const { createDesign } = useDesigns();
  const { toast } = useToast();

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      trackingType: '',
      eanNumber: '',
      description: '',
      category: '',
      designType: 'static'
    }
  });

  const handlePreviewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, partId?: string) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now() + Math.random() + '',
        name: file.name,
        type: getFileType(file.name),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        path: `temp/${file.name}`,
        originalName: file.name,
        partId: partId || activePart,
        designType: 'static' as const
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setUploading(false);
      
      toast({
        title: "Dateien hochgeladen",
        description: `${files.length} Datei(en) wurden erfolgreich hochgeladen.`,
      });
    }, 1000);

    event.target.value = '';
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'f3d':
        return 'Fusion 360 File';
      case 'step':
      case 'stp':
        return 'STEP File';
      case 'stl':
        return 'STL File';
      case 'ini':
        return 'Settings File';
      case 'gcode':
        return 'G-Code File';
      default:
        return 'Unknown';
    }
  };

  const handleFileRemove = (file: any) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    toast({
      title: "Datei gelöscht",
      description: `${file.name} wurde erfolgreich gelöscht.`,
    });
  };

  const handleFileDownload = (file: any) => {
    console.log('Downloading file:', file.name);
  };

  const handlePartParametersChange = (partId: string, field: string, value: string) => {
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
  };

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
    setActivePart(partId);
  };

  const handleAddPart = (name: string) => {
    const newPart: DesignPart = {
      id: Date.now().toString(),
      name,
      files: [],
      partType: 'static'
    };
    setDesignParts(prev => [...prev, newPart]);
    setActivePart(newPart.id);
  };

  const handleRemovePart = (partId: string) => {
    if (designParts.length <= 1) return;
    
    setDesignParts(prev => prev.filter(part => part.id !== partId));
    setUploadedFiles(prev => prev.filter(file => file.partId !== partId));
    
    if (activePart === partId) {
      setActivePart(designParts[0].id);
    }
  };

  const handleRenamePart = (partId: string, newName: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, name: newName } : part
    ));
  };

  const handlePartTypeChange = (partId: string, partType: 'static' | 'personalized') => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, partType } : part
    ));
  };

  const handlePartSoftwareChange = (partId: string, field: 'cadSoftware' | 'slicer', value: string) => {
    setDesignParts(prev => prev.map(part =>
      part.id === partId ? { ...part, [field]: value } : part
    ));
  };

  const validatePartFiles = (part: DesignPart) => {
    const partFiles = uploadedFiles.filter(file => file.partId === part.id);
    const hasF3D = partFiles.some(file => file.name.toLowerCase().endsWith('.f3d'));
    const hasINI = partFiles.some(file => file.name.toLowerCase().endsWith('.ini'));
    const hasPersonalizedFiles = partFiles.some(file => 
      file.name.toLowerCase().endsWith('.f3d') || file.name.toLowerCase().endsWith('.ini')
    );
    
    return { hasF3D, hasINI, hasPersonalizedFiles };
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Sammle alle relevanten Daten
      const currentPart = designParts.find(part => part.id === activePart) || designParts[0];
      const partFiles = uploadedFiles.filter(file => file.partId === activePart);
      
      // Finde spezifische Dateitypen
      const f3dFile = partFiles.find(file => file.name.toLowerCase().endsWith('.f3d'));
      const iniFile = partFiles.find(file => file.name.toLowerCase().endsWith('.ini'));
      const gcodeFile = partFiles.find(file => file.name.toLowerCase().endsWith('.gcode'));
      const stlFile = partFiles.find(file => file.name.toLowerCase().endsWith('.stl'));

      const designData = {
        name: data.name,
        tracking_type: data.trackingType,
        ean_number: data.eanNumber,
        description: data.description,
        category: data.category,
        design_type: data.designType,
        // Dateipfade
        cad_file_path: f3dFile?.path || null,
        ini_file_path: iniFile?.path || null,
        gcode_file_path: gcodeFile?.path || null,
        preview_image_path: previewImage ? `preview/${previewImage.name}` : null,
        // Software-Informationen für personalisierte Designs
        cad_software: currentPart?.cadSoftware || null,
        slicer: currentPart?.slicer || null,
        // Parameter für personalisierte Designs
        sketch_name: currentPart?.parameters?.sketchName || null,
        replacement_value: currentPart?.parameters?.replacementValue || null,
        // Zusätzliche Metadaten
        version: 'v1.0'
      };

      console.log('Speichere Design mit Daten:', designData);
      console.log('Hochgeladene Dateien:', uploadedFiles);
      console.log('Design Parts:', designParts);

      await createDesign(designData);
      
      toast({
        title: "Design erfolgreich erstellt",
        description: `Das Design "${data.name}" wurde mit allen Dateien gespeichert.`,
      });
      
      onSave();
    } catch (error) {
      console.error('Error creating design:', error);
      toast({
        title: "Fehler beim Erstellen des Designs",
        description: "Es gab einen Fehler beim Speichern des Designs.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Design hinzufügen</h3>
        <p className="text-sm text-gray-600">Erstellen Sie ein neues Design mit allen erforderlichen Informationen.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Design Information */}
          <Card>
            <CardHeader>
              <CardTitle>Design-Informationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Design-Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name des Designs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trackingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking-Typ</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tracking-Typ auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ean">EAN</SelectItem>
                          <SelectItem value="sku">SKU</SelectItem>
                          <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eanNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>EAN-Nummer</FormLabel>
                      <FormControl>
                        <Input placeholder="EAN-Nummer eingeben" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="designType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Design-Typ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Design-Typ auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="static">Statisch</SelectItem>
                        <SelectItem value="personalized">Personalisierbar</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="previewImage">Vorschaubild</Label>
                <Input
                  id="previewImage"
                  type="file"
                  accept="image/*"
                  onChange={handlePreviewImageChange}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Beschreibung des Designs"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="household">Haushalt</SelectItem>
                        <SelectItem value="toys">Spielzeug</SelectItem>
                        <SelectItem value="tools">Werkzeuge</SelectItem>
                        <SelectItem value="decoration">Dekoration</SelectItem>
                        <SelectItem value="accessories">Zubehör</SelectItem>
                        <SelectItem value="other">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* File Management */}
          <Card>
            <CardHeader>
              <CardTitle>Dateien verwalten</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiPartFileManager
                uploadedFiles={uploadedFiles}
                loadingFiles={false}
                uploading={uploading}
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                onFileDownload={handleFileDownload}
                onPartParametersChange={handlePartParametersChange}
                selectedPartId={selectedPartId}
                onPartSelect={handlePartSelect}
                designParts={designParts}
                activePart={activePart}
                onPartChange={setActivePart}
                onAddPart={handleAddPart}
                onRemovePart={handleRemovePart}
                onRenamePart={handleRenamePart}
                onPartTypeChange={handlePartTypeChange}
                onPartSoftwareChange={handlePartSoftwareChange}
                validatePartFiles={validatePartFiles}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button type="submit">
              Design speichern
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddDesignForm;
