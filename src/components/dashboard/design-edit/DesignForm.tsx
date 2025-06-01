
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Design {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tracking_type?: string;
  ean_number?: string;
  design_type: 'static' | 'personalized';
}

interface DesignFormProps {
  design: Design;
  onDesignChange: (field: string, value: string) => void;
}

const DesignForm: React.FC<DesignFormProps> = ({ design, onDesignChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Design-Name</Label>
        <Input
          id="name"
          value={design.name}
          onChange={(e) => onDesignChange('name', e.target.value)}
          placeholder="Name des Designs"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tracking_type">Tracking-Typ</Label>
          <Select value={design.tracking_type || ''} onValueChange={(value) => onDesignChange('tracking_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tracking-Typ auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ean">EAN</SelectItem>
              <SelectItem value="sku">SKU</SelectItem>
              <SelectItem value="custom">Benutzerdefiniert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ean_number">EAN-Nummer</Label>
          <Input
            id="ean_number"
            value={design.ean_number || ''}
            onChange={(e) => onDesignChange('ean_number', e.target.value)}
            placeholder="EAN-Nummer eingeben"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={design.description || ''}
          onChange={(e) => onDesignChange('description', e.target.value)}
          placeholder="Beschreibung des Designs"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Kategorie</Label>
        <Select value={design.category || ''} onValueChange={(value) => onDesignChange('category', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Kategorie auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="household">Haushalt</SelectItem>
            <SelectItem value="toys">Spielzeug</SelectItem>
            <SelectItem value="tools">Werkzeuge</SelectItem>
            <SelectItem value="decoration">Dekoration</SelectItem>
            <SelectItem value="accessories">Zubehör</SelectItem>
            <SelectItem value="other">Sonstiges</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DesignForm;
