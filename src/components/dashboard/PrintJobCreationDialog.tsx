
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePrintJobs } from '@/hooks/usePrintJobs';
import { useDesigns } from '@/hooks/useDesigns';

interface PrintJobCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintJobCreationDialog: React.FC<PrintJobCreationDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { createPrintJob } = usePrintJobs();
  const { designs } = useDesigns();
  const [loading, setLoading] = useState(false);
  
  const [jobData, setJobData] = useState({
    product_id: '',
    product_name: '',
    ean_number: '',
    quantity: 1,
    material: '',
    color: '',
    priority: 5,
    notes: '',
    source_type: 'manual' as const
  });

  const handleSubmit = async () => {
    if (!jobData.product_name) return;
    
    setLoading(true);
    try {
      await createPrintJob(jobData);
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
      product_id: '',
      product_name: '',
      ean_number: '',
      quantity: 1,
      material: '',
      color: '',
      priority: 5,
      notes: '',
      source_type: 'manual'
    });
  };

  const handleDesignSelect = (designId: string) => {
    const design = designs.find(d => d.id === designId);
    if (design) {
      setJobData(prev => ({
        ...prev,
        product_id: design.id,
        product_name: design.name,
        ean_number: design.ean_number || '',
        material: design.material || ''
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Print Job erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen manuellen Print Job für Prototypen oder Lagerauffüllung
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Design Selection */}
          <div className="space-y-2">
            <Label htmlFor="design">Design auswählen (Optional)</Label>
            <Select onValueChange={handleDesignSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Design auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {designs.map((design) => (
                  <SelectItem key={design.id} value={design.id}>
                    <div className="flex items-center gap-2">
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

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="product_name">Produktname *</Label>
            <Input
              id="product_name"
              value={jobData.product_name}
              onChange={(e) => setJobData(prev => ({ ...prev, product_name: e.target.value }))}
              placeholder="Name des zu druckenden Produkts"
            />
          </div>

          {/* EAN Number */}
          <div className="space-y-2">
            <Label htmlFor="ean_number">EAN-Nummer</Label>
            <Input
              id="ean_number"
              value={jobData.ean_number}
              onChange={(e) => setJobData(prev => ({ ...prev, ean_number: e.target.value }))}
              placeholder="EAN-Nummer des Produkts"
            />
          </div>

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

          {/* Material */}
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select value={jobData.material} onValueChange={(value) => setJobData(prev => ({ ...prev, material: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Material auswählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLA">PLA</SelectItem>
                <SelectItem value="PETG">PETG</SelectItem>
                <SelectItem value="ABS">ABS</SelectItem>
                <SelectItem value="TPU">TPU</SelectItem>
                <SelectItem value="Wood Fill">Wood Fill</SelectItem>
                <SelectItem value="Carbon Fiber">Carbon Fiber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Farbe</Label>
            <Input
              id="color"
              value={jobData.color}
              onChange={(e) => setJobData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="z.B. Schwarz, Weiß, Rot..."
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priorität (1-10)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={jobData.priority}
              onChange={(e) => setJobData(prev => ({ ...prev, priority: parseInt(e.target.value) || 5 }))}
            />
          </div>

          {/* Source Type */}
          <div className="space-y-2">
            <Label htmlFor="source_type">Auftragstyp</Label>
            <Select value={jobData.source_type} onValueChange={(value: any) => setJobData(prev => ({ ...prev, source_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manuell</SelectItem>
                <SelectItem value="restock">Lagerauffüllung</SelectItem>
                <SelectItem value="prototype">Prototyp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={jobData.notes}
              onChange={(e) => setJobData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Besondere Anweisungen oder Notizen..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={!jobData.product_name || loading}
          >
            {loading ? 'Erstelle...' : 'Print Job erstellen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintJobCreationDialog;
