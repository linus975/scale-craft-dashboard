
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSimpleFileUpload } from '@/hooks/useSimpleFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const StorageDebugger: React.FC = () => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const { testStorageAccess } = useSimpleFileUpload();
  const { toast } = useToast();

  const addDebugMessage = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullDiagnostic = async () => {
    setIsDebugging(true);
    setDebugResults([]);
    
    try {
      addDebugMessage('🔍 Starting Storage Diagnostic...');
      
      // Test 1: Authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addDebugMessage(`❌ Auth Error: ${authError.message}`);
        return;
      }
      if (!user) {
        addDebugMessage('❌ User not authenticated');
        return;
      }
      addDebugMessage(`✅ User authenticated: ${user.id}`);

      // Test 2: List buckets
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        addDebugMessage(`❌ Bucket error: ${bucketError.message}`);
        return;
      }
      addDebugMessage(`✅ Found ${buckets?.length || 0} buckets`);
      buckets?.forEach(bucket => {
        addDebugMessage(`  - ${bucket.id} (${bucket.public ? 'public' : 'private'})`);
      });

      // Test 3: Check design-files bucket
      const designBucket = buckets?.find(b => b.id === 'design-files');
      if (!designBucket) {
        addDebugMessage('❌ design-files bucket not found');
        return;
      }
      addDebugMessage('✅ design-files bucket exists');

      // Test 4: List user's root folder
      const { data: userRoot, error: rootError } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 100 });
      
      if (rootError) {
        addDebugMessage(`⚠️ User root folder error: ${rootError.message}`);
      } else {
        addDebugMessage(`✅ User root folder accessible, contains ${userRoot?.length || 0} items`);
        userRoot?.forEach(item => {
          addDebugMessage(`  - ${item.name}`);
        });
      }

      // Test 5: Check temp folder
      const { data: tempFolder, error: tempError } = await supabase.storage
        .from('design-files')
        .list(`${user.id}/temp`, { limit: 100 });
      
      if (tempError) {
        addDebugMessage(`⚠️ Temp folder error: ${tempError.message}`);
        addDebugMessage('💡 This is normal if no files have been uploaded yet');
      } else {
        addDebugMessage(`✅ Temp folder accessible, contains ${tempFolder?.length || 0} items`);
        tempFolder?.forEach(item => {
          addDebugMessage(`  - ${item.name}`);
        });
      }

      // Test 6: Try a test upload
      addDebugMessage('🧪 Attempting test upload...');
      const testContent = new Blob(['Test file content'], { type: 'text/plain' });
      const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
      const testPath = `${user.id}/temp/CAD/test-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(testPath, testFile);
      
      if (uploadError) {
        addDebugMessage(`❌ Test upload failed: ${uploadError.message}`);
        addDebugMessage(`❌ Error details: ${JSON.stringify(uploadError)}`);
      } else {
        addDebugMessage(`✅ Test upload successful: ${uploadData.path}`);
        
        // Clean up test file
        await supabase.storage
          .from('design-files')
          .remove([testPath]);
        addDebugMessage('🧹 Test file cleaned up');
      }

      addDebugMessage('✅ Diagnostic complete');
      
    } catch (error) {
      addDebugMessage(`❌ Diagnostic failed: ${error}`);
    } finally {
      setIsDebugging(false);
    }
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Storage Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runFullDiagnostic} 
            disabled={isDebugging}
          >
            {isDebugging ? 'Running...' : 'Run Full Diagnostic'}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearResults}
          >
            Clear Results
          </Button>
        </div>
        
        {debugResults.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-md max-h-96 overflow-y-auto">
            <h3 className="font-semibold mb-2">Diagnostic Results:</h3>
            {debugResults.map((result, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageDebugger;
