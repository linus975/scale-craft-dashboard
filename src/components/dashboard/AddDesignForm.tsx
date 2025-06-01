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

const AddDesignForm: React.FC<AddDesignFormProps> = ({ onCancel, onSave }) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [partParameters, setPartParameters] = useState<Record<string, { sketchName: string; replacementValue: string }>>({});
  
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
        partId: partId || 'main',
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

  const handlePartParametersChange = (partId: string, parameters: { sketchName: string; replacementValue: string }) => {
    setPartParameters(prev => ({
      ...prev,
      [partId]: parameters
    }));
  };

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const designData = {
        name: data.name,
        tracking_type: data.trackingType,
        ean_number: data.eanNumber,
        description: data.description,
        category: data.category,
        design_type: data.designType
      };

      await createDesign(designData);
      onSave();
    } catch (error) {
      console.error('Error creating design:', error);
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
