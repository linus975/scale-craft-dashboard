
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStorageFolderManager } from '@/hooks/useStorageFolderManager';
import { RefreshCw, FolderOpen, TestTube } from 'lucide-react';

interface StorageDebugPanelProps {
  isOpen: boolean;
}

const StorageDebugPanel: React.FC<StorageDebugPanelProps> = ({ isOpen }) => {
  const { folders, loading, checkStorageStructure, cleanupEmptyFolders, testStorageAccess } = useStorageFolderManager();

  if (!isOpen) return null;

  const handleTestStorage = async () => {
    console.log('🧪 [StorageDebugPanel] Testing storage access...');
    const result = await testStorageAccess();
    console.log('🧪 [StorageDebugPanel] Storage test result:', result);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-800">
          <FolderOpen className="h-4 w-4" />
          Storage Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestStorage}
            className="text-xs"
          >
            <TestTube className="h-3 w-3 mr-1" />
            Storage testen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={checkStorageStructure}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Ordner prüfen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cleanupEmptyFolders}
            className="text-xs"
          >
            Aufräumen
          </Button>
        </div>
        
        <div className="text-xs space-y-1">
          <div className="font-medium text-orange-800">temp-parts Ordner:</div>
          {loading ? (
            <div className="text-orange-600">Lade...</div>
          ) : folders.length > 0 ? (
            <ul className="list-disc list-inside text-orange-700 space-y-1">
              {folders.map(folder => (
                <li key={folder} className="ml-2">{folder}</li>
              ))}
            </ul>
          ) : (
            <div className="text-orange-600 italic">Keine temp-parts Ordner gefunden (werden beim ersten Upload erstellt)</div>
          )}
        </div>
        
        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          <strong>Debug Info:</strong> Öffne die Browser-Konsole für detaillierte Logs zur Ordnerstruktur und Storage-Zugriff.
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageDebugPanel;
