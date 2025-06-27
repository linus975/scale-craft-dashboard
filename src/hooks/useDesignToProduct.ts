
import { useProducts } from './useProducts';
import { useHighPerformanceUpload } from './useHighPerformanceUpload';
import { useToast } from '@/hooks/use-toast';

interface DesignFormData {
  name: string;
  description: string;
  category: string;
  trackingType: string;
  eanNumber: string;
  color: string;
  machine: string;
  cadSoftware: string;
  slicer: string;
  nozzleDiameter: string;
  material: string;
  sketchName?: string;
  replacementValue?: string;
}

interface DesignPart {
  id: string;
  name: string;
  type: 'static' | 'customisable';
  software?: string;
  specifications?: string;
  cadSoftware?: string;
  slicer?: string;
  nozzleDiameter?: string;
  filamentType?: string;
  color?: string;
  machine?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  path: string;
  partId?: string;
}

export const useDesignToProduct = () => {
  const { createProduct, createPart, createProductImage } = useProducts();
  const { uploadFile } = useHighPerformanceUpload();
  const { toast } = useToast();

  const saveDesignAsProduct = async (
    formData: DesignFormData,
    designParts: DesignPart[],
    uploadedFiles: UploadedFile[],
    previewImage?: File,
    multiImages: Array<{ file: File }> = []
  ) => {
    try {
      console.log('🔄 Converting design to product structure...');

      // 1. Create main product
      const product = await createProduct({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        identifier_type: formData.trackingType,
        identifier_value: formData.eanNumber
      });

      console.log('✅ Product created:', product.product_id);

      // 2. Upload and save preview image
      if (previewImage) {
        try {
          const previewPath = await uploadFile(previewImage, 'product-previews');
          await createProductImage({
            product_id: product.product_id,
            image_path: previewPath
          });
          console.log('✅ Preview image saved');
        } catch (error) {
          console.error('❌ Error saving preview image:', error);
        }
      }

      // 3. Upload and save multi-images
      for (const imageItem of multiImages) {
        try {
          const imagePath = await uploadFile(imageItem.file, 'product-images');
          await createProductImage({
            product_id: product.product_id,
            image_path: imagePath
          });
        } catch (error) {
          console.error('❌ Error saving multi-image:', error);
        }
      }

      // 4. Create parts for each design part with part-specific settings and parameters
      for (const designPart of designParts) {
        try {
          // Get files for this part
          const partFiles = uploadedFiles.filter(f => f.partId === designPart.id);
          const f3dFile = partFiles.find(f => f.name.toLowerCase().endsWith('.f3d'));
          const iniFile = partFiles.find(f => f.name.toLowerCase().endsWith('.ini'));
          const gcodeFile = partFiles.find(f => 
            f.name.toLowerCase().endsWith('.gcode') || f.name.toLowerCase().endsWith('.g')
          );

          const partData = {
            product_id: product.product_id,
            part_name: designPart.name,
            is_customizable: designPart.type === 'customisable',
            // Use part-specific settings first, then fallback to global form data
            cad_software: designPart.cadSoftware || formData.cadSoftware || null,
            slicer_software: designPart.slicer || formData.slicer || null,
            color: designPart.color || formData.color || null,
            printer_model: designPart.machine || formData.machine || null,
            nozzle_diameter: designPart.nozzleDiameter ? parseFloat(designPart.nozzleDiameter) : 
                           (formData.nozzleDiameter ? parseFloat(formData.nozzleDiameter) : null),
            filament_type: designPart.filamentType || formData.material || null,
            f3d_file_path: f3dFile?.path || null,
            ini_file_path: iniFile?.path || null,
            gcode_path: gcodeFile?.path || null,
            // Use part-specific parameters if available
            sketch_name: (designPart as any).parameters?.sketchName || formData.sketchName || null,
            replacement_type: (designPart as any).parameters?.replacementValue || formData.replacementValue || null
          };

          await createPart(partData);
          console.log(`✅ Part created: ${designPart.name} with parameters:`, {
            sketch_name: partData.sketch_name,
            replacement_type: partData.replacement_type
          });
        } catch (error) {
          console.error(`❌ Error creating part ${designPart.name}:`, error);
        }
      }

      // If no parts were created, create a default main part
      if (designParts.length === 0) {
        const mainFiles = uploadedFiles.filter(f => !f.partId || f.partId === 'main');
        const f3dFile = mainFiles.find(f => f.name.toLowerCase().endsWith('.f3d'));
        const iniFile = mainFiles.find(f => f.name.toLowerCase().endsWith('.ini'));
        const gcodeFile = mainFiles.find(f => 
          f.name.toLowerCase().endsWith('.gcode') || f.name.toLowerCase().endsWith('.g')
        );

        await createPart({
          product_id: product.product_id,
          part_name: 'Main',
          is_customizable: formData.trackingType === 'personalized',
          cad_software: formData.cadSoftware || null,
          slicer_software: formData.slicer || null,
          color: formData.color || null,
          printer_model: formData.machine || null,
          nozzle_diameter: formData.nozzleDiameter ? parseFloat(formData.nozzleDiameter) : null,
          filament_type: formData.material || null,
          f3d_file_path: f3dFile?.path || null,
          ini_file_path: iniFile?.path || null,
          gcode_path: gcodeFile?.path || null,
          sketch_name: formData.sketchName || null,
          replacement_type: formData.replacementValue || null
        });
      }

      toast({
        title: "Design erfolgreich gespeichert",
        description: `Das Design "${formData.name}" wurde als Produkt mit allen Teilen gespeichert.`,
      });

      return product;
    } catch (error) {
      console.error('❌ Error saving design as product:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Das Design konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    saveDesignAsProduct
  };
};
