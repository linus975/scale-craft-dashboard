
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDesignToProduct } from '@/hooks/useDesignToProduct';
import { useUserStorageUpload } from '@/hooks/useUserStorageUpload';
import { useStorageManager } from '@/hooks/useStorageManager';
import { supabase } from '@/integrations/supabase/client';
import MultiPartFileManager from './design-edit/MultiPartFileManager';
import StorageDebugMonitor from '../StorageDebugMonitor';
import { UploadedFile } from '@/types/fileUpload';

interface StaticDesignFormProps {
  onCancel: () => void;
  onSave: (designData: any) => void;
}

const StaticDesignForm: React.FC<StaticDesignFormProps> = ({ onCancel, onSave }) => {
  const { saveDesignAsProduct } = useDesignToProduct();
  const { uploading, uploadToTemporary, moveToFinalLocation } = useUserStorageUpload();
  const { ensureUserFolders } = useStorageManager();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('main');
  const [userInitialized, setUserInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    trackingType: 'ean' as 'ean' | 'sku',
    trackingNumber: '',
    description: '',
    category: '',
    color: '',
    machine: '',
    material: '',
    nozzleDiameter: '',
    cadSoftware: '',
    slicer: ''
  });

  // Initialize user and ensure folder structure
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('🔧 [StaticDesignForm] Initializing user and folder structure...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('❌ [StaticDesignForm] User authentication failed:', userError);
          toast({
            title: "Authentifizierung fehlgeschlagen",
            description: "Bitte melden Sie sich erneut an.",
            variant: "destructive",
          });
          return;
        }

        console.log('👤 [StaticDesignForm] User authenticated:', user.id);
        
        // Ensure user folder structure exists
        const foldersCreated = await ensureUserFolders();
        if (foldersCreated) {
          console.log('✅ [StaticDesignForm] User folders initialized successfully');
          setUserInitialized(true);
        } else {
          console.warn('⚠️ [StaticDesignForm] Could not initialize user folders');
        }
      } catch (error) {
        console.error('❌ [StaticDesignForm] Error during initialization:', error);
        toast({
          title: "Initialisierung fehlgeschlagen",
          description: "Fehler beim Vorbereiten der Ordnerstruktur.",
          variant: "destructive",
        });
      }
    };

    initializeUser();
  }, [ensureUserFolders, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [StaticDesignForm] Form submission started...');
    
    if (!userInitialized) {
      console.error('❌ [StaticDesignForm] User not initialized');
      toast({
        title: "System nicht bereit",
        description: "Bitte warten Sie, bis das System initialisiert ist.",
        variant: "destructive",
      });
      return;
    }
    
    // Enhanced validation with logging
    if (!formData.name || !formData.trackingNumber || !formData.category) {
      console.error('❌ [StaticDesignForm] Missing required fields:', {
        name: !!formData.name,
        trackingNumber: !!formData.trackingNumber,
        category: !!formData.category
      });
      
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus (Name, Tracking-Nummer und Kategorie).",
        variant: "destructive",
      });
      return;
    }

    console.log('📋 [StaticDesignForm] Form data:', formData);
    console.log('📁 [StaticDesignForm] Uploaded files:', uploadedFiles.length);

    setLoading(true);
    try {
      const designFormData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        trackingType: formData.trackingType,
        eanNumber: formData.trackingNumber,
        color: formData.color,
        machine: formData.machine,
        material: formData.material,
        nozzleDiameter: formData.nozzleDiameter,
        cadSoftware: formData.cadSoftware,
        slicer: formData.slicer
      };

      console.log('📦 [StaticDesignForm] Design form data prepared:', designFormData);

      const designParts = [{
        id: 'main',
        name: 'Main',
        type: 'static' as const,
        software: formData.cadSoftware,
        specifications: ''
      }];

      console.log('🔧 [StaticDesignForm] Design parts prepared:', designParts);

      console.log('💾 [StaticDesignForm] Calling saveDesignAsProduct...');
      const product = await saveDesignAsProduct(
        designFormData,
        designParts,
        uploadedFiles,
        previewImage || undefined,
        []
      );

      console.log('✅ [StaticDesignForm] Product created successfully:', product);

      // Move files from temp to final location
      if (uploadedFiles.length > 0) {
        console.log('🔄 [StaticDesignForm] Moving files to final location...');
        console.log('📁 [StaticDesignForm] Files to move:', uploadedFiles.map(f => ({ name: f.name, path: f.path, partId: f.partId })));
        
        await moveToFinalLocation(uploadedFiles, product.product_id);
        console.log('✅ [StaticDesignForm] Files moved successfully');
      } else {
        console.log('ℹ️ [StaticDesignForm] No files to move');
      }

      console.log('🎉 [StaticDesignForm] All operations completed successfully');
      onSave(formData);
      
    } catch (error) {
      console.error('❌ [StaticDesignForm] Complete error:', error);
      
      // Enhanced error reporting
      if (error instanceof Error) {
        console.error('❌ [StaticDesignForm] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      
      toast({
        title: "Speichern fehlgeschlagen",
        description: `Fehler beim Speichern des Produkts: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, partName?: string) => {
    const files = event.target.files;
    if (!files) return;

    if (!userInitialized) {
      console.error('❌ [StaticDesignForm] Cannot upload - user not initialized');
      toast({
        title: "Upload nicht möglich",
        description: "Bitte warten Sie, bis das System bereit ist.",
        variant: "destructive",
      });
      return;
    }

    const partId = partName || selectedPartId;
    
    console.log('📤 [StaticDesignForm] File upload initiated:');
    console.log('  - Files count:', files.length);
    console.log('  - Part ID:', partId);
    console.log('  - Part name:', partName);
    console.log('  - User initialized:', userInitialized);

    try {
      for (const file of Array.from(files)) {
        console.log('📤 [StaticDesignForm] Uploading file:', file.name, 'for part:', partId);
        
        const uploadedFile = await uploadToTemporary(file, partId);
        
        // Erweitere das uploadedFile mit Formulardaten
        const enrichedFile: UploadedFile = {
          ...uploadedFile,
          originalName: file.name, // Stelle sicher, dass originalName gesetzt ist
          productName: formData.name,
          material: formData.material,
          color: formData.color,
          machine: formData.machine,
          nozzleDiameter: formData.nozzleDiameter,
          cadSoftware: formData.cadSoftware,
          slicer: formData.slicer
        };
        
        console.log('✅ [StaticDesignForm] File uploaded and enriched:', enrichedFile);
        
        setUploadedFiles(prev => {
          const updated = [...prev, enrichedFile];
          console.log('📋 [StaticDesignForm] Updated files list:', updated.length, 'files');
          return updated;
        });
      }
    } catch (error) {
      console.error('❌ [StaticDesignForm] Upload error:', error);
      
      if (error instanceof Error && error.message.includes('policy')) {
        toast({
          title: "Berechtigung verweigert",
          description: "Keine Berechtigung zum Hochladen. Bitte wenden Sie sich an den Administrator.",
          variant: "destructive",
        });
      }
    }
    
    event.target.value = '';
  };

  const handleFileRemove = (file: UploadedFile) => {
    console.log('🗑️ [StaticDesignForm] Removing file:', file.name);
    
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== file.id);
      console.log('📋 [StaticDesignForm] Files after removal:', updated.length);
      return updated;
    });
    
    toast({
      title: "Datei entfernt",
      description: `${file.name} wurde entfernt.`,
    });
  };

  const handleFileDownload = (file: UploadedFile) => {
    console.log('📥 [StaticDesignForm] Download requested for:', file.name);
    toast({
      title: "Download",
      description: `Download für ${file.name} wird vorbereitet.`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | null) => {
    setPreviewImage(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <StorageDebugMonitor />
      
      {!userInitialized && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-yellow-800">System wird initialisiert...</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Statisches Produkt hinzufügen</CardTitle>
          <CardDescription>
            Erstellen Sie ein neues statisches Produkt. Dateien werden zunächst temporär gespeichert und beim Speichern final abgelegt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Design Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Produkt-Name *</Label>
              <Input
                id="name"
                placeholder="Geben Sie einen Namen für Ihr Produkt ein"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Tracking Type and Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingType">Tracking-Typ *</Label>
                <Select onValueChange={(value) => handleInputChange('trackingType', value)} value={formData.trackingType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie den Tracking-Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ean">EAN-Nummer</SelectItem>
                    <SelectItem value="sku">SKU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">
                  {formData.trackingType === 'ean' ? 'EAN-Nummer *' : 'SKU *'}
                </Label>
                <Input
                  id="trackingNumber"
                  placeholder={formData.trackingType === 'ean' ? '13-stellige EAN-Nummer eingeben' : 'SKU eingeben'}
                  value={formData.trackingNumber}
                  onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                  maxLength={formData.trackingType === 'ean' ? 13 : undefined}
                  required
                />
              </div>
            </div>

            {/* Preview Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="previewImage">Vorschaubild (optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {previewImage ? previewImage.name : 'Klicken Sie hier oder ziehen Sie ein Bild hinein'}
                </p>
                <Input
                  id="previewImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('previewImage')?.click()}
                  disabled={!userInitialized}
                >
                  Bild auswählen
                </Button>
              </div>
            </div>

            {/* Description and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Beschreiben Sie Ihr Produkt..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie *</Label>
                <Input
                  id="category"
                  placeholder="Kategorie eingeben oder auswählen"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Additional Product Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Farbe (optional)</Label>
                <Input
                  id="color"
                  placeholder="z.B. Rot, Blau, Schwarz"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Material (optional)</Label>
                <Input
                  id="material"
                  placeholder="z.B. PLA, ABS, PETG"
                  value={formData.material}
                  onChange={(e) => handleInputChange('material', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Multi-Part File Management */}
            <div className="space-y-2">
              <Label>Dateien (optional)</Label>
              <p className="text-sm text-gray-600">
                {userInitialized 
                  ? "Dateien werden temporär gespeichert und beim Speichern final abgelegt" 
                  : "Warten auf Systeminitialisierung..."
                }
              </p>
              <MultiPartFileManager
                uploadedFiles={uploadedFiles}
                loadingFiles={false}
                uploading={uploading}
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                onFileDownload={handleFileDownload}
                selectedPartId={selectedPartId}
                onPartSelect={setSelectedPartId}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700" 
                disabled={loading || uploading || !userInitialized}
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploading ? 'Datei hochladen...' : 'Speichern...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Produkt speichern
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticDesignForm;
