
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Settings, FileCode, Calendar, User } from 'lucide-react';
import GCodeViewer from '../GCodeViewer';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface DesignCardProps {
  design: any;
  index: number;
  isSelectionMode: boolean;
  selectedDesigns: string[];
  onSelectDesign: (designId: string) => void;
  onConfigureDesign: (design: any) => void;
  onDownloadDesign: (design: any) => void;
}

const DesignCard: React.FC<DesignCardProps> = ({
  design,
  index,
  isSelectionMode,
  selectedDesigns,
  onSelectDesign,
  onConfigureDesign,
  onDownloadDesign
}) => {
  const { getFileUrl } = useFileUpload();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download fehlgeschlagen');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download erfolgreich",
        description: `${filename} wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download fehlgeschlagen",
        description: "Die Datei konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDesign = async (design: any) => {
    if (design.design_type === 'static') {
      if (design.gcode_file_path) {
        // Download G-code file from storage
        const fileUrl = getFileUrl(design.gcode_file_path);
        await downloadFile(fileUrl, `${design.name}.gcode`);
      } else if (design.gcode) {
        // Download legacy G-code from database
        const blob = new Blob([design.gcode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${design.name}.gcode`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Download erfolgreich",
          description: `${design.name}.gcode wurde heruntergeladen.`,
        });
      }
    } else if (design.design_type === 'personalized') {
      if (design.cad_file_path) {
        // Download CAD file from storage
        const fileUrl = getFileUrl(design.cad_file_path);
        const fileExtension = design.cad_file_path.split('.').pop() || 'f3d';
        await downloadFile(fileUrl, `${design.name}.${fileExtension}`);
      }
    }
  };

  const isDownloadAvailable = () => {
    if (design.design_type === 'static') {
      return design.gcode_file_path || design.gcode;
    } else if (design.design_type === 'personalized') {
      return design.cad_file_path;
    }
    return false;
  };

  return (
    <Card 
      className={`hover:shadow-md transition-all cursor-pointer ${
        isSelectionMode && selectedDesigns.includes(design.id) 
          ? 'border-2 border-red-400 bg-red-50' 
          : 'hover:shadow-md'
      } ${
        isSelectionMode && index < 3 
          ? 'animate-pulse' 
          : ''
      }`}
      onClick={isSelectionMode ? () => onSelectDesign(design.id) : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{design.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={design.design_type === 'static' ? 'outline' : 'default'}
                className={design.design_type === 'static' ? 'bg-gray-200 text-gray-700' : 'bg-black text-white'}
              >
                {design.design_type === 'static' ? 'Static' : 'Personalized'}
              </Badge>
              <Badge variant="outline">{design.category}</Badge>
              {design.tracking_type && (
                <Badge variant="outline" className="text-xs">
                  {design.tracking_type.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {design.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{design.description}</p>
        )}
        
        {design.ean_number && (
          <div className="text-sm">
            <span className="font-medium">
              {design.tracking_type === 'ean' ? 'EAN:' : 'SKU:'}
            </span>
            <span className="ml-1">{design.ean_number}</span>
          </div>
        )}

        {/* G-Code File Display for Static Designs */}
        {design.design_type === 'static' && design.gcode_file_path && (
          <GCodeViewer 
            gcodeFilePath={design.gcode_file_path} 
            designName={design.name}
          />
        )}

        {/* Legacy G-Code Display */}
        {design.design_type === 'static' && design.gcode && !design.gcode_file_path && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileCode className="h-4 w-4" />
            <span>G-Code available ({design.gcode.split('\n').length} lines)</span>
          </div>
        )}

        {/* CAD Software for Personalized Designs */}
        {design.design_type === 'personalized' && design.cad_software && (
          <div className="text-sm">
            <span className="font-medium">CAD Software:</span>
            <span className="ml-1">{design.cad_software}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(design.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Version {design.version || 'v1.0'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadDesign(design);
            }}
            disabled={!isDownloadAvailable()}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onConfigureDesign(design);
            }}
          >
            <Settings className="h-4 w-4 mr-1" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignCard;
