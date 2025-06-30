
import { useProducts } from './useProducts';
import { useToast } from '@/hooks/use-toast';
import { useStructuredFileUpload, StructuredUploadedFile } from './useStructuredFileUpload';

interface DesignFormData {
  name: string;
  trackingType: string;
  eanNumber: string;
  description: string;
  category: string;
  color: string;
  machine: string;
  cadSoftware: string;
  slicer: string;
  nozzleDiameter: string;
  material: string;
}

interface PartData {
  id: string;
  name: string;
  type: 'static' | 'personalizable';
  software: string;
  specifications: string;
  cadSoftware?: string;
  slicer?: string;
  nozzleDiameter?: string;
  filamentType?: string;
  color?: string;
  machine?: string;
}

interface ImageFile {
  file: File;
  id: string;
  preview: string;
}

interface SelectedFile {
  id: string;
  file: File;
  partId: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
}

export const useEnhancedDesignToProduct = () => {
  const { createProduct, createPart, createProductImage } = useProducts();
  const { uploadFileToProduct } = useStructuredFileUpload();
  const { toast } = useToast();

  const saveDesignAsProductWithFiles = async (
    designData: DesignFormData,
    designParts: PartData[],
    selectedFiles: SelectedFile[],
    previewImage?: File,
    additionalImages: ImageFile[] = []
  ) => {
    try {
      console.log('🚀 [EnhancedDesignToProduct] Starting enhanced save process...');
      
      // Validate required fields
      if (!designData.name.trim()) {
        throw new Error('Produktname ist erforderlich');
      }

      if (!designData.eanNumber.trim()) {
        throw new Error('EAN-Nummer ist erforderlich');
      }

      // Create the product
      const productData = {
        name: designData.name,
        identifier_type: designData.trackingType,
        identifier_value: designData.eanNumber,
        category: designData.category,
        description: designData.description
      };

      console.log('📦 [EnhancedDesignToProduct] Creating product:', productData);
      const product = await createProduct(productData);
      console.log('✅ [EnhancedDesignToProduct] Product created:', product.product_id);

      // Upload files with structured paths and create parts with file paths
      for (const partData of designParts) {
        console.log(`🔧 [EnhancedDesignToProduct] Processing part: ${partData.name}`);
        
        // Get files for this part
        const partFiles = selectedFiles.filter(f => f.partId === partData.id);
        console.log(`📁 [EnhancedDesignToProduct] Found ${partFiles.length} files for part ${partData.name}:`, partFiles.map(f => f.file.name));

        let gcodeFilePath = null;
        let cadFilePath = null;
        let iniFilePath = null;

        // Upload files and collect paths
        for (const selectedFile of partFiles) {
          try {
            const uploadedFile = await uploadFileToProduct(
              selectedFile.file,
              designData.name,
              partData.id,
              partData.name
            );

            // Store paths based on file category
            switch (selectedFile.fileCategory) {
              case 'GCODE':
                gcodeFilePath = uploadedFile.path;
                console.log(`✅ [EnhancedDesignToProduct] G-Code path set: ${gcodeFilePath}`);
                break;
              case 'CAD':
                cadFilePath = uploadedFile.path;
                console.log(`✅ [EnhancedDesignToProduct] CAD path set: ${cadFilePath}`);
                break;
              case 'INI':
                iniFilePath = uploadedFile.path;
                console.log(`✅ [EnhancedDesignToProduct] INI path set: ${iniFilePath}`);
                break;
            }
          } catch (uploadError) {
            console.error(`❌ [EnhancedDesignToProduct] File upload failed for ${selectedFile.file.name}:`, uploadError);
            throw new Error(`Datei-Upload fehlgeschlagen: ${selectedFile.file.name}`);
          }
        }

        // Create part with file paths
        const partToCreate = {
          product_id: product.product_id,
          part_name: partData.name,
          is_customizable: partData.type === 'personalizable',
          cad_software: partData.cadSoftware || partData.software || null,
          slicer_software: partData.slicer || null,
          nozzle_diameter: partData.nozzleDiameter ? parseFloat(partData.nozzleDiameter) : null,
          filament_type: partData.filamentType || null,
          color: partData.color || null,
          printer_model: partData.machine || null,
          // Add file paths based on part type
          gcode_path: gcodeFilePath,
          f3d_file_path: cadFilePath,
          ini_file_path: iniFilePath
        };

        console.log('💾 [EnhancedDesignToProduct] Creating part with paths:', partToCreate);
        await createPart(partToCreate);
      }

      // Handle preview image
      if (previewImage) {
        console.log('🖼️ [EnhancedDesignToProduct] Adding preview image');
        await createProductImage({
          product_id: product.product_id,
          image_path: `preview-${Date.now()}-${previewImage.name}`,
          is_preview_image: true
        });
      }

      // Handle additional images
      for (const image of additionalImages) {
        console.log('🖼️ [EnhancedDesignToProduct] Adding additional image');
        await createProductImage({
          product_id: product.product_id,
          image_path: `image-${Date.now()}-${image.file.name}`,
          is_preview_image: false
        });
      }

      console.log('✅ [EnhancedDesignToProduct] All components saved successfully');
      
      toast({
        title: "Produkt erfolgreich erstellt",
        description: `Das Produkt "${designData.name}" wurde mit strukturierten Dateipfaden gespeichert.`,
      });

      return product;

    } catch (error: any) {
      console.error('❌ [EnhancedDesignToProduct] Save failed:', error);
      throw error;
    }
  };

  return {
    saveDesignAsProductWithFiles
  };
};
