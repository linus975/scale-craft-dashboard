
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Star, Settings, Calendar, ArrowRight } from 'lucide-react';

interface WhitelabelPromoCardProps {
  onNavigateToWhitelabelCatalog?: () => void;
}

const WhitelabelPromoCard: React.FC<WhitelabelPromoCardProps> = ({ onNavigateToWhitelabelCatalog }) => {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Design Library</CardTitle>
              <CardDescription className="text-slate-600">
                Erweitern Sie Ihr Angebot mit professionellen Whitelabel-Katalogen
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Neu
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-slate-700">
            Mieten Sie komplette Design-Kataloge für nur <span className="font-bold text-blue-600">30€ pro Monat</span> und bieten Sie Ihren Kunden sofort hunderte von professionellen 3D-Designs an.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Über 300 Designs verfügbar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Settings className="h-4 w-4 text-blue-500" />
              <span>Kommerzielle Nutzungsrechte</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="h-4 w-4 text-green-500" />
              <span>Monatlich kündbar</span>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={onNavigateToWhitelabelCatalog}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Kataloge durchsuchen
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhitelabelPromoCard;
