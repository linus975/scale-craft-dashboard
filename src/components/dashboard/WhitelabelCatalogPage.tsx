
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Star, Clock, Euro, Check } from 'lucide-react';

interface WhitelabelCatalogPageProps {
  onBack: () => void;
}

const WhitelabelCatalogPage: React.FC<WhitelabelCatalogPageProps> = ({ onBack }) => {
  const [selectedCatalog, setSelectedCatalog] = useState<number | null>(null);

  const catalogs = [
    {
      id: 1,
      name: "Tech Accessories",
      description: "Phone cases, stands, cable organizers, and tech gadgets",
      designs: 45,
      rating: 4.8,
      category: "Electronics",
      preview: "/placeholder.svg",
      price: 30
    },
    {
      id: 2,
      name: "Home & Garden",
      description: "Planters, organizers, hooks, and decorative items",
      designs: 62,
      rating: 4.9,
      category: "Lifestyle",
      preview: "/placeholder.svg",
      price: 30
    },
    {
      id: 3,
      name: "Automotive Parts",
      description: "Car accessories, replacement parts, and custom mods",
      designs: 38,
      rating: 4.7,
      category: "Automotive",
      preview: "/placeholder.svg",
      price: 30
    },
    {
      id: 4,
      name: "Educational Tools",
      description: "Learning aids, models, puzzles, and STEM projects",
      designs: 29,
      rating: 4.6,
      category: "Education",
      preview: "/placeholder.svg",
      price: 30
    },
    {
      id: 5,
      name: "Jewelry & Fashion",
      description: "Rings, pendants, bracelets, and fashion accessories",
      designs: 51,
      rating: 4.8,
      category: "Fashion",
      preview: "/placeholder.svg",
      price: 30
    },
    {
      id: 6,
      name: "Gaming Accessories",
      description: "Controller grips, dice, miniatures, and gaming tools",
      designs: 73,
      rating: 4.9,
      category: "Gaming",
      preview: "/placeholder.svg",
      price: 30
    }
  ];

  const handleRentCatalog = (catalogId: number) => {
    setSelectedCatalog(catalogId);
    console.log(`Renting catalog ${catalogId} for €30`);
    // Here you would implement the actual rental logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Designs
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Whitelabel Kataloge mieten</h2>
          <p className="text-slate-600">Erweitern Sie Ihr Angebot mit professionellen Design-Katalogen</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50/50 border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Katalog-Vermietung
          </CardTitle>
          <CardDescription>
            Mieten Sie komplette Design-Kataloge für 30€ pro Monat und erweitern Sie Ihr Produktangebot sofort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Sofortiger Zugang zu allen Designs</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Kommerzielle Nutzungsrechte</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Monatlich kündbar</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogs.map((catalog) => (
          <Card 
            key={catalog.id} 
            className={`bg-white/60 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${
              selectedCatalog === catalog.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
            }`}
            onClick={() => setSelectedCatalog(catalog.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{catalog.name}</CardTitle>
                  <CardDescription className="mt-1">{catalog.description}</CardDescription>
                </div>
                <Badge variant="outline">{catalog.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview Image */}
              <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                <Package className="h-8 w-8 text-slate-400" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-slate-500" />
                  <span>{catalog.designs} Designs</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{catalog.rating}</span>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-lg font-bold">
                  <Euro className="h-4 w-4" />
                  <span>{catalog.price}</span>
                  <span className="text-sm font-normal text-slate-500">/Monat</span>
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRentCatalog(catalog.id);
                  }}
                  className={selectedCatalog === catalog.id ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {selectedCatalog === catalog.id ? 'Gemietet' : 'Mieten'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Info */}
      <Card className="bg-slate-50/50 border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mietbedingungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Monatliche Zahlung von 30€ pro Katalog</li>
            <li>• Sofortiger Zugang zu allen Design-Dateien (STL, G-Code)</li>
            <li>• Kommerzielle Nutzungsrechte für gemietete Designs</li>
            <li>• Jederzeit monatlich kündbar</li>
            <li>• Neue Designs werden automatisch hinzugefügt</li>
            <li>• 24/7 Support und technische Hilfe</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhitelabelCatalogPage;
