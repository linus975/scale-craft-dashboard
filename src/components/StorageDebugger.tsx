
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStorageManager } from '@/hooks/useStorageManager';

const StorageDebugger: React.FC = () => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<string[]>([]);
  const { toast } = useToast();
  const { ensureUserFolders, listUserFiles } = useStorageManager();

  const addDebugMessage = (message: string) => {
    setDebugResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullDiagnostic = async () => {
    setIsDebugging(true);
    setDebugResults([]);
    
    try {
      addDebugMessage('🔍 Starting Enhanced Storage Diagnostic...');
      
      // Test 1: Check Authentication
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

      // Test 2: Check design-files bucket
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        addDebugMessage(`❌ Bucket error: ${bucketError.message}`);
      } else {
        const designBucket = buckets?.find(b => b.id === 'design-files');
        if (designBucket) {
          addDebugMessage('✅ design-files bucket found');
        } else {
          addDebugMessage('❌ design-files bucket not found');
        }
      }

      // Test 3: Ensure folder structure
      addDebugMessage('🔧 Ensuring folder structure...');
      const folderResult = await ensureUserFolders();
      if (folderResult) {
        addDebugMessage('✅ Folder structure created/verified');
      } else {
        addDebugMessage('❌ Error creating folder structure');
      }

      // Test 4: List user files
      addDebugMessage('📂 Listing user files...');
      const userFiles = await listUserFiles();
      addDebugMessage(`📋 Found ${userFiles.length} files/folders in user directory`);
      
      userFiles.forEach(file => {
        addDebugMessage(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
      });

      // Test 5: Check specific temp folders
      const tempFolders = ['temp/CAD', 'temp/INI', 'temp/GCODE'];
      for (const folder of tempFolders) {
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('design-files')
          .list(`${user.id}/${folder}`, { limit: 10 });
        
        if (folderError) {
          addDebugMessage(`⚠️ ${folder}: ${folderError.message}`);
        } else {
          addDebugMessage(`✅ ${folder}: ${folderFiles?.length || 0} files`);
        }
      }

      addDebugMessage('✅ Enhanced diagnostic complete');
      
    } catch (error) {
      addDebugMessage(`❌ Diagnostic failed: ${error}`);
      console.error('Full diagnostic error:', error);
    } finally {
      setIsDebugging(false);
    }
  };

  const createFolders = async () => {
    setIsDebugging(true);
    addDebugMessage('🔧 Creating folder structure...');
    
    const result = await ensureUserFolders();
    if (result) {
      addDebugMessage('✅ Folder structure created successfully');
      toast({
        title: "Ordner erstellt",
        description: "Die temp-Ordner wurden erfolgreich erstellt.",
      });
    } else {
      addDebugMessage('❌ Failed to create folder structure');
    }
    
    setIsDebugging(false);
  };

  const clearResults = () => {
    setDebugResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Enhanced Supabase Storage Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runFullDiagnostic} 
            disabled={isDebugging}
          >
            {isDebugging ? 'Running Enhanced Diagnostic...' : 'Run Enhanced Diagnostic'}
          </Button>
          <Button 
            onClick={createFolders}
            disabled={isDebugging}
            variant="outline"
          >
            {isDebugging ? 'Creating Folders...' : 'Create Temp Folders'}
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
            <h3 className="font-semibold mb-2">Enhanced Diagnostic Results:</h3>
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
