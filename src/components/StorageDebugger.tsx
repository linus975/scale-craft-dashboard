
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
      addDebugMessage('🔍 Starting Enhanced Storage Diagnostic...');
      
      // Test 1: Check Supabase Client Configuration
      addDebugMessage('🔧 Checking Supabase client configuration...');
      const expectedUrl = 'https://xuxgxkemywnyranlhsjh.supabase.co';
      const expectedKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1eGd4a2VteXdueXJhbmxoc2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzQyMTUsImV4cCI6MjA2MzkxMDIxNX0.ilp_enK4vvX2Vy8EpogSh9XGQN-GaMI0Yb8YyVPtIqc';
      
      addDebugMessage('✅ Using expected Supabase URL and key');

      // Test 2: Authentication
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
      addDebugMessage(`📧 User email: ${user.email}`);

      // Test 3: Direct API call to check buckets
      addDebugMessage('🌐 Testing direct API call to Supabase...');
      try {
        const response = await fetch(`${expectedUrl}/storage/v1/bucket`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${expectedKey}`,
            'apikey': expectedKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const buckets = await response.json();
          addDebugMessage(`✅ Direct API call successful, found ${buckets.length} buckets`);
          buckets.forEach((bucket: any) => {
            addDebugMessage(`  - ${bucket.id} (${bucket.public ? 'public' : 'private'})`);
          });
        } else {
          addDebugMessage(`❌ Direct API call failed: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          addDebugMessage(`❌ Error details: ${errorText}`);
        }
      } catch (fetchError) {
        addDebugMessage(`❌ Direct API call exception: ${fetchError}`);
      }

      // Test 4: List buckets using Supabase client
      addDebugMessage('📂 Testing Supabase client listBuckets...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        addDebugMessage(`❌ Bucket error: ${bucketError.message}`);
        addDebugMessage(`❌ Full bucket error: ${JSON.stringify(bucketError)}`);
      } else {
        addDebugMessage(`✅ Supabase client found ${buckets?.length || 0} buckets`);
        buckets?.forEach(bucket => {
          addDebugMessage(`  - ${bucket.id} (${bucket.public ? 'public' : 'private'})`);
        });
      }

      // Test 5: Check specific design-files bucket
      if (buckets && buckets.length > 0) {
        const designBucket = buckets.find(b => b.id === 'design-files');
        if (designBucket) {
          addDebugMessage('✅ design-files bucket found via client');
          addDebugMessage(`  - Public: ${designBucket.public}`);
          addDebugMessage(`  - Created: ${designBucket.created_at}`);
          addDebugMessage(`  - Updated: ${designBucket.updated_at}`);
        } else {
          addDebugMessage('❌ design-files bucket not found in client results');
        }
      }

      // Test 6: Test direct access to design-files
      addDebugMessage('🧪 Testing direct access to design-files bucket...');
      const { data: designFiles, error: designError } = await supabase.storage
        .from('design-files')
        .list('', { limit: 1 });
      
      if (designError) {
        addDebugMessage(`❌ design-files access error: ${designError.message}`);
        addDebugMessage(`❌ Full error: ${JSON.stringify(designError)}`);
      } else {
        addDebugMessage(`✅ design-files bucket accessible, contains ${designFiles?.length || 0} root items`);
      }

      // Test 7: Test user folder access
      const { data: userFolder, error: userError } = await supabase.storage
        .from('design-files')
        .list(user.id, { limit: 1 });
      
      if (userError) {
        addDebugMessage(`⚠️ User folder error: ${userError.message} (might be normal if empty)`);
      } else {
        addDebugMessage(`✅ User folder accessible, contains ${userFolder?.length || 0} items`);
      }

      addDebugMessage('✅ Enhanced diagnostic complete');
      
    } catch (error) {
      addDebugMessage(`❌ Diagnostic failed: ${error}`);
      console.error('Full diagnostic error:', error);
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
