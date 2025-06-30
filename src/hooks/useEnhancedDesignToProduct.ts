
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
      console.log('📁 [EnhancedDesignToProduct] Selected files to process:', selectedFiles.length);
      
      // Validate required fields
      if (!designData.name.trim()) {
        throw new Error('Produktname ist erforderlich');
      }

      if (!designData.eanNumber.trim()) {
        throw new Error('EAN-Nummer ist erforderlich');
      }

      if (selectedFiles.length === 0) {
        throw new Error('Mindestens eine Datei muss ausgewählt werden');
      }

      // Create the product first
      const productData = {
        name: designData.name,
        identifier_type: designData.trackingType,
        identifier_value: designData.eanNumber,
        category: designData.category,
        description: designData.description
      };

      console.log('📦 [EnhancedDesignToProduct] Creating product:', productData);
      const product = await createProduct(productData);
      console.log('✅ [EnhancedDesignToProduct] Product created with ID:', product.product_id);

      // Process each part and upload files
      for (const partData of designParts) {
        console.log(`🔧 [EnhancedDesignToProduct] Processing part: ${partData.name} (ID: ${partData.id})`);
        
        // Get files for this specific part
        const partFiles = selectedFiles.filter(f => f.partId === partData.id);
        console.log(`📁 [EnhancedDesignToProduct] Found ${partFiles.length} files for part ${partData.name}:`, 
          partFiles.map(f => `${f.file.name} (${f.fileCategory})`));

        // Initialize file paths
        let gcodeFilePath = null;
        let cadFilePath = null;
        let iniFilePath = null;

        // Upload all files for this part and collect their paths
        for (const selectedFile of partFiles) {
          try {
            console.log(`📤 [EnhancedDesignToProduct] Uploading file: ${selectedFile.file.name} (${selectedFile.fileCategory})`);
            
            const uploadedFile = await uploadFileToProduct(
              selectedFile.file,
              designData.name,
              partData.id,
              partData.name
            );

            console.log(`✅ [EnhancedDesignToProduct] File uploaded successfully:`, uploadedFile.path);

            // Store the correct path based on file category
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
            throw new Error(`Datei-Upload fehlgeschlagen: ${selectedFile.file.name} - ${uploadError.message}`);
          }
        }

        // Create part record with all collected file paths
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
          // File paths based on what was actually uploaded
          gcode_path: gcodeFilePath,
          f3d_file_path: cadFilePath,
          ini_file_path: iniFilePath
        };

        console.log('💾 [EnhancedDesignToProduct] Creating part with file paths:', {
          part_name: partToCreate.part_name,
          gcode_path: partToCreate.gcode_path,
          f3d_file_path: partToCreate.f3d_file_path,
          ini_file_path: partToCreate.ini_file_path
        });

        const createdPart = await createPart(partToCreate);
        console.log('✅ [EnhancedDesignToProduct] Part created successfully:', createdPart);
      }

      // Handle preview image upload
      if (previewImage) {
        console.log('🖼️ [EnhancedDesignToProduct] Processing preview image');
        try {
          const previewUpload = await uploadFileToProduct(
            previewImage,
            designData.name,
            'preview',
            'preview'
          );
          
          await createProductImage({
            product_id: product.product_id,
            image_path: previewUpload.path,
            is_preview_image: true
          });
          console.log('✅ [EnhancedDesignToProduct] Preview image saved');
        } catch (imageError) {
          console.warn('⚠️ [EnhancedDesignToProduct] Preview image upload failed:', imageError);
          // Don't fail the entire process for image upload issues
        }
      }

      // Handle additional images
      for (let i = 0; i < additionalImages.length; i++) {
        const image = additionalImages[i];
        console.log(`🖼️ [EnhancedDesignToProduct] Processing additional image ${i + 1}/${additionalImages.length}`);
        try {
          const imageUpload = await uploadFileToProduct(
            image.file,
            designData.name,
            `image-${i}`,
            `image-${i}`
          );
          
          await createProductImage({
            product_id: product.product_id,
            image_path: imageUpload.path,
            is_preview_image: false
          });
          console.log(`✅ [EnhancedDesignToProduct] Additional image ${i + 1} saved`);
        } catch (imageError) {
          console.warn(`⚠️ [EnhancedDesignToProduct] Additional image ${i + 1} upload failed:`, imageError);
          // Don't fail the entire process for image upload issues
        }
      }

      console.log('✅ [EnhancedDesignToProduct] All components saved successfully');
      
      toast({
        title: "Produkt erfolgreich erstellt",
        description: `Das Produkt "${designData.name}" wurde mit ${selectedFiles.length} Datei(en) gespeichert.`,
      });

      return product;

    } catch (error: any) {
      console.error('❌ [EnhancedDesignToProduct] Save process failed:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error.message || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    saveDesignAsProductWithFiles
  };
};
