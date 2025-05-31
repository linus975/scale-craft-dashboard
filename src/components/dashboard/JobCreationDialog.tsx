
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { usePrintJobs } from '@/hooks/usePrintJobs';

interface JobCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const JobCreationDialog: React.FC<JobCreationDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { designs } = useDesigns();
  const { createPrintJob } = usePrintJobs();
  const [loading, setLoading] = useState(false);
  
  const [jobData, setJobData] = useState({
    designId: '',
    quantity: 1,
    priority: 'normal',
    material: '',
    printer: '',
    notes: ''
  });

  const availablePrinters = [
    'Bambu X1C-1',
    'Bambu X1C-2', 
    'Prusa MK3S-1',
    'Bambu A1 Mini-1'
  ];

  const materials = ['PLA', 'PETG', 'ABS', 'TPU', 'Wood Fill', 'Carbon Fiber'];

  const handleSubmit = async () => {
    const selectedDesign = designs.find(d => d.id === jobData.designId);
    if (!selectedDesign) return;
    
    setLoading(true);
    try {
      // Create using the new print jobs system only
      await createPrintJob({
        product_id: selectedDesign.id,
        product_name: selectedDesign.name,
        ean_number: selectedDesign.ean_number,
        quantity: jobData.quantity,
        material: jobData.material || selectedDesign.material || 'PLA',
        priority: jobData.priority === 'high' ? 9 : 5,
        source_type: 'manual',
        printer_id: jobData.printer || undefined,
        notes: jobData.notes || undefined
      });

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating print job:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJobData({
      designId: '',
      quantity: 1,
      priority: 'normal',
      material: '',
      printer: '',
      notes: ''
    });
  };

  const selectedDesign = designs.find(d => d.id === jobData.designId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Print Job erstellen</DialogTitle>
          <DialogDescription>
            Wählen Sie ein Design aus Ihrer Bibliothek und konfigurieren Sie den Print Job
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Priority Selection */}
          <div className="space-y-3">
            <Label>Job-Priorität</Label>
            <RadioGroup
              value={jobData.priority}
              onValueChange={(value) => setJobData(prev => ({ ...prev, priority: value }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-red-500" />
                  Vorrangig (Hohe Priorität)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-blue-500" />
                  Normal (Standard Priorität)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Design Selection */}
          <div className="space-y-2">
            <Label htmlFor="design">Design auswählen</Label>
            <Select value={jobData.designId} onValueChange={(value) => setJobData(prev => ({ ...prev, designId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie ein Design..." />
              </SelectTrigger>
              <SelectContent>
                {designs.map((design) => (
                  <SelectItem key={design.id} value={design.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{design.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {design.design_type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Design Info */}
          {selectedDesign && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="font-medium">{selectedDesign.name}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{selectedDesign.design_type}</Badge>
                {selectedDesign.material && (
                  <Badge variant="outline">Standard: {selectedDesign.material}</Badge>
                )}
                {selectedDesign.ean_number && (
                  <Badge variant="outline">EAN: {selectedDesign.ean_number}</Badge>
                )}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Stückzahl</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={jobData.quantity}
              onChange={(e) => setJobData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            />
          </div>

          {/* Material Override */}
          <div className="space-y-2">
            <Label htmlFor="material">Material (Optional - überschreibt Standard)</Label>
            <Select value={jobData.material} onValueChange={(value) => setJobData(prev => ({ ...prev, material: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Standard Material verwenden..." />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Printer Selection */}
          <div className="space-y-2">
            <Label htmlFor="printer">Drucker (Optional - automatische Auswahl)</Label>
            <Select value={jobData.printer} onValueChange={(value) => setJobData(prev => ({ ...prev, printer: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Automatische Drucker-Auswahl..." />
              </SelectTrigger>
              <SelectContent>
                {availablePrinters.map((printer) => (
                  <SelectItem key={printer} value={printer}>
                    {printer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (Optional)</Label>
            <Input
              id="notes"
              placeholder="Besondere Anweisungen..."
              value={jobData.notes}
              onChange={(e) => setJobData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!jobData.designId || loading}
          >
            {loading ? 'Erstelle Job...' : 'Job erstellen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobCreationDialog;
