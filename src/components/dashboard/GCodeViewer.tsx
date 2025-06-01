
import React, { useState, useEffect } from 'react';
import { FileCode, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface GCodeViewerProps {
  gcodeFilePath: string;
  designName: string;
}

const GCodeViewer: React.FC<GCodeViewerProps> = ({ gcodeFilePath, designName }) => {
  const [gcodeContent, setGcodeContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { getFileUrl } = useFileUpload();
  const { toast } = useToast();

  const loadGCodeContent = async () => {
    if (!gcodeFilePath || loading) return;
    
    setLoading(true);
    try {
      const fileUrl = getFileUrl(gcodeFilePath);
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der G-Code Datei');
      }
      
      const content = await response.text();
      setGcodeContent(content);
    } catch (error) {
      console.error('Error loading G-Code:', error);
      toast({
        title: "Fehler",
        description: "G-Code Datei konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadGCode = () => {
    if (!gcodeContent) return;
    
    const blob = new Blob([gcodeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <FileCode className="h-4 w-4 text-gray-500" />
      
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadGCodeContent}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-1" />
            {loading ? 'Laden...' : 'Anzeigen'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>G-Code: {designName}</DialogTitle>
            <DialogDescription>
              G-Code Inhalt für das Design "{designName}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">
              {gcodeContent.split('\n').length} Zeilen
            </span>
            <Button
              onClick={downloadGCode}
              disabled={!gcodeContent}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
          
          <ScrollArea className="h-96 w-full border rounded-md p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {gcodeContent || 'G-Code wird geladen...'}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GCodeViewer;
