import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useHighPerformanceUpload } from '@/hooks/useHighPerformanceUpload';

interface FormData {
  name: string;
  cadSoftware: string;
  slicer: string;
  sketchName: string;
  replacementValue: string;
  version: string;
}

const PersonalizedDesignForm: React.FC = () => {
  const { handleSubmit, register, watch, formState: { errors } } = useForm<FormData>();
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { toast } = useToast();
  const { createProduct, createPart } = useProducts();
  const { uploadFile } = useHighPerformanceUpload();

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Saving personalized design:', data);
      
      // Create design parts with corrected type
      const designParts = [{
        id: 'main',
        name: 'Main Part',
        type: 'customisable' as 'static' | 'customisable', // Fix type here
        software: data.cadSoftware,
        specifications: ''
      }];

      setSaving(true);
      setProgress(0);
      setCurrentStep('Validating...');

      // Step 1: Basic validation - only name is required
      if (!data.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Design name is required",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      setProgress(20);
      setCurrentStep('Saving product...');

      // Step 2: Save as product with new structure - map design parts to the correct interface
      const product = await createProduct({
        name: data.name,
        description: 'Personalized Design',
        category: 'Personalized',
        identifier_type: 'personalized',
        identifier_value: 'personalized'
      });

      console.log('✅ Product created:', product.product_id);

      // Step 3: Create parts for each design part with part-specific settings
      for (const designPart of designParts) {
        try {
          const partData = {
            product_id: product.product_id,
            part_name: designPart.name,
            is_customizable: designPart.type === 'customisable',
            cad_software: data.cadSoftware || null,
            slicer_software: data.slicer || null,
            color: null,
            printer_model: null,
            nozzle_diameter: null,
            filament_type: null,
            f3d_file_path: null,
            ini_file_path: null,
            gcode_path: null,
            sketch_name: data.sketchName || null,
            replacement_type: data.replacementValue || null
          };

          await createPart(partData);
          console.log(`✅ Part created: ${designPart.name}`);
        } catch (error) {
          console.error(`❌ Error creating part ${designPart.name}:`, error);
        }
      }

      setProgress(100);
      setCurrentStep('Complete!');

      toast({
        title: "Design erfolgreich gespeichert",
        description: `Das personalisierte Design "${data.name}" wurde als Produkt gespeichert.`,
      });
      
    } catch (error) {
      console.error('❌ Error saving design as product:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Das Design konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Personalized Design Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Design Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter design name"
                  {...register("name", { required: 'Design name is required' })}
                />
                {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cadSoftware">CAD Software</Label>
                  <Input
                    id="cadSoftware"
                    type="text"
                    placeholder="Enter CAD software"
                    {...register("cadSoftware")}
                  />
                </div>

                <div>
                  <Label htmlFor="slicer">Slicer</Label>
                  <Input
                    id="slicer"
                    type="text"
                    placeholder="Enter slicer"
                    {...register("slicer")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sketchName">Sketch Name</Label>
                  <Input
                    id="sketchName"
                    type="text"
                    placeholder="Enter sketch name"
                    {...register("sketchName")}
                  />
                </div>

                <div>
                  <Label htmlFor="replacementValue">Replacement Value</Label>
                  <Input
                    id="replacementValue"
                    type="text"
                    placeholder="Enter replacement value"
                    {...register("replacementValue")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  type="text"
                  placeholder="Enter version"
                  {...register("version")}
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Design"
                )}
              </Button>
            </div>
          </Form>

          {saving && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">{currentStep}</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Produkt wird gespeichert... Bitte warten Sie.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDesignForm;
