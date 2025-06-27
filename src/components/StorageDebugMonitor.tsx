
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StorageDebugMonitor: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkStorageStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 [StorageDebug] Current user:', user?.id);

      if (!user) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an, um Storage-Informationen zu sehen.",
          variant: "destructive",
        });
        return;
      }

      // Check buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('📋 [StorageDebug] Available buckets:', buckets);

      // Check user files in user-storage bucket
      let userFiles = [];
      let tempFiles = [];
      
      if (buckets?.find(b => b.id === 'user-storage')) {
        // List user's root folder
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from('user-storage')
          .list(user.id, { limit: 100 });

        if (!rootError && rootFiles) {
          console.log('📁 [StorageDebug] User root files:', rootFiles);
          userFiles = rootFiles;
        }

        // List user's temp folder specifically
        const { data: tempFilesData, error: tempError } = await supabase.storage
          .from('user-storage')
          .list(`${user.id}/temp`, { limit: 100 });

        if (!tempError && tempFilesData) {
          console.log('🗂️ [StorageDebug] User temp files:', tempFilesData);
          tempFiles = tempFilesData;
        }
      }

      setStorageInfo({
        userId: user.id,
        buckets: buckets || [],
        userFiles,
        tempFiles,
        bucketsError,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ [StorageDebug] Error checking storage:', error);
      toast({
        title: "Storage-Fehler",
        description: "Konnte Storage-Informationen nicht abrufen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Nicht angemeldet",
          description: "Bitte melden Sie sich an.",
          variant: "destructive",
        });
        return;
      }

      const testContent = new Blob(['Test file content'], { type: 'text/plain' });
      const testPath = `${user.id}/test-${Date.now()}.txt`;

      console.log('🧪 [StorageDebug] Testing upload to:', testPath);

      const { data, error } = await supabase.storage
        .from('user-storage')
        .upload(testPath, testContent);

      if (error) {
        console.error('❌ [StorageDebug] Test upload failed:', error);
        toast({
          title: "Test-Upload fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ [StorageDebug] Test upload successful:', data);
        toast({
          title: "Test-Upload erfolgreich",
          description: `Datei wurde unter ${data.path} gespeichert.`,
        });

        // Clean up test file
        setTimeout(async () => {
          await supabase.storage.from('user-storage').remove([testPath]);
          console.log('🧹 [StorageDebug] Test file cleaned up');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ [StorageDebug] Test upload error:', error);
    }
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      checkStorageStatus();
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mb-4 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Storage Debug Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={checkStorageStatus}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Storage'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={testUpload}
          >
            Test Upload
          </Button>
        </div>

        {storageInfo && (
          <div className="space-y-2 text-xs">
            <div>
              <strong>User ID:</strong> {storageInfo.userId}
            </div>
            
            <div>
              <strong>Buckets:</strong>{' '}
              {storageInfo.buckets.map((bucket: any) => (
                <Badge key={bucket.id} variant={bucket.id === 'user-storage' ? 'default' : 'secondary'} className="mr-1">
                  {bucket.id}
                </Badge>
              ))}
            </div>

            <div>
              <strong>User Files:</strong> {storageInfo.userFiles.length} items
            </div>

            <div>
              <strong>Temp Files:</strong> {storageInfo.tempFiles.length} items
            </div>

            <div className="text-gray-500">
              Last checked: {new Date(storageInfo.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageDebugMonitor;
