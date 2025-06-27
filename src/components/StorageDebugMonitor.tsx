
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

      // Check buckets with detailed logging
      console.log('📋 [StorageDebug] Checking available buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ [StorageDebug] Error listing buckets:', bucketsError);
      } else {
        console.log('✅ [StorageDebug] Available buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));
      }

      // Check user files in design-files bucket
      let userFiles = [];
      let tempFiles = [];
      let storageErrors = [];
      
      const designFilesBucket = buckets?.find(b => b.id === 'design-files');
      if (designFilesBucket) {
        console.log('📂 [StorageDebug] design-files bucket found, checking user files...');
        
        // List user's root folder
        const { data: rootFiles, error: rootError } = await supabase.storage
          .from('design-files')
          .list(user.id, { limit: 100 });

        if (rootError) {
          console.error('❌ [StorageDebug] Error listing user root folder:', rootError);
          storageErrors.push(`Root folder error: ${rootError.message}`);
        } else {
          console.log('📁 [StorageDebug] User root files:', rootFiles?.map(f => f.name));
          userFiles = rootFiles || [];
        }

        // List user's temp-parts folder specifically
        const { data: tempFilesData, error: tempError } = await supabase.storage
          .from('design-files')
          .list(`${user.id}/temp-parts`, { limit: 100 });

        if (tempError) {
          console.error('❌ [StorageDebug] Error listing temp-parts folder:', tempError);
          storageErrors.push(`Temp-parts folder error: ${tempError.message}`);
        } else {
          console.log('🗂️ [StorageDebug] User temp-parts files:', tempFilesData?.map(f => f.name));
          tempFiles = tempFilesData || [];
        }
      } else {
        console.error('❌ [StorageDebug] design-files bucket not found!');
        storageErrors.push('design-files bucket not found');
      }

      setStorageInfo({
        userId: user.id,
        buckets: buckets || [],
        userFiles,
        tempFiles,
        bucketsError,
        storageErrors,
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
      const testPath = `${user.id}/temp-parts/test-${Date.now()}.txt`;

      console.log('🧪 [StorageDebug] Testing upload to:', testPath);

      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(testPath, testContent);

      if (error) {
        console.error('❌ [StorageDebug] Test upload failed:', error);
        toast({
          title: "Test-Upload fehlgeschlagen",
          description: `${error.message}`,
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
          await supabase.storage.from('design-files').remove([testPath]);
          console.log('🧹 [StorageDebug] Test file cleaned up');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ [StorageDebug] Test upload error:', error);
    }
  };

  const checkPolicies = async () => {
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

      console.log('🔐 [StorageDebug] Testing storage policies...');
      
      // Test listing permission
      const { data: listTest, error: listError } = await supabase.storage
        .from('design-files')
        .list('', { limit: 1 });
        
      if (listError) {
        console.error('❌ [StorageDebug] List permission test failed:', listError);
        toast({
          title: "Policy-Test: Listen fehlgeschlagen",
          description: listError.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ [StorageDebug] List permission test passed');
        toast({
          title: "Policy-Test erfolgreich",
          description: "Grundlegende Storage-Berechtigungen funktionieren.",
        });
      }
    } catch (error) {
      console.error('❌ [StorageDebug] Policy test error:', error);
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
        <div className="flex gap-2 flex-wrap">
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
          <Button
            size="sm"
            variant="outline"
            onClick={checkPolicies}
          >
            Test Policies
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
                <Badge key={bucket.id} variant={bucket.id === 'design-files' ? 'default' : 'secondary'} className="mr-1">
                  {bucket.id}
                </Badge>
              ))}
            </div>

            <div>
              <strong>User Files:</strong> {storageInfo.userFiles.length} items
            </div>

            <div>
              <strong>Temp-Parts Files:</strong> {storageInfo.tempFiles.length} items
            </div>

            {storageInfo.storageErrors && storageInfo.storageErrors.length > 0 && (
              <div className="text-red-600">
                <strong>Errors:</strong>
                <ul className="list-disc list-inside ml-2">
                  {storageInfo.storageErrors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

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
