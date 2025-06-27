
import { useProducts } from './useProducts';
import { useToast } from '@/hooks/use-toast';

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

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE';
  partId?: string;
}

export const useDesignToProduct = () => {
  const { createProduct, createPart, createProductImage } = useProducts();
  const { toast } = useToast();

  const saveDesignAsProduct = async (
    designData: DesignFormData,
    designParts: PartData[],
    uploadedFiles: UploadedFile[],
    previewImage?: File,
    additionalImages: ImageFile[] = []
  ) => {
    try {
      console.log('🚀 [DesignToProduct] Starting save process...');
      
      // Validate required fields
      if (!designData.name.trim()) {
        throw new Error('Produktname ist erforderlich');
      }

      if (!designData.eanNumber.trim()) {
        throw new Error('EAN-Nummer ist erforderlich');
      }

      // Create the product with better error handling
      const productData = {
        name: designData.name,
        identifier_type: designData.trackingType,
        identifier_value: designData.eanNumber,
        category: designData.category,
        description: designData.description
      };

      console.log('📦 [DesignToProduct] Creating product:', productData);
      const product = await createProduct(productData);
      console.log('✅ [DesignToProduct] Product created:', product.product_id);

      // Create parts for the product
      for (const partData of designParts) {
        console.log(`🔧 [DesignToProduct] Creating part: ${partData.name}`);
        
        const partToCreate = {
          product_id: product.product_id,
          part_name: partData.name,
          is_customizable: partData.type === 'personalizable',
          cad_software: partData.cadSoftware || partData.software || null,
          slicer_software: partData.slicer || null,
          nozzle_diameter: partData.nozzleDiameter ? parseFloat(partData.nozzleDiameter) : null,
          filament_type: partData.filamentType || null,
          color: partData.color || null,
          printer_model: partData.machine || null
        };

        await createPart(partToCreate);
      }

      // Handle preview image
      if (previewImage) {
        console.log('🖼️ [DesignToProduct] Adding preview image');
        await createProductImage({
          product_id: product.product_id,
          image_path: `preview-${Date.now()}-${previewImage.name}`,
          is_preview_image: true
        });
      }

      // Handle additional images
      for (const image of additionalImages) {
        console.log('🖼️ [DesignToProduct] Adding additional image');
        await createProductImage({
          product_id: product.product_id,
          image_path: `image-${Date.now()}-${image.file.name}`,
          is_preview_image: false
        });
      }

      console.log('✅ [DesignToProduct] All components saved successfully');
      
      toast({
        title: "Produkt erfolgreich erstellt",
        description: `Das Produkt "${designData.name}" wurde erfolgreich gespeichert.`,
      });

      return product;

    } catch (error: any) {
      console.error('❌ [DesignToProduct] Save failed:', error);
      
      // Don't show toast here since it's already handled in createProduct
      // Just re-throw the error for the calling component to handle
      throw error;
    }
  };

  return {
    saveDesignAsProduct
  };
};
