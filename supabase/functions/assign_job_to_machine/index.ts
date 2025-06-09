
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`Method not allowed: ${req.method}`)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }

  try {
    // Parse request body
    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    const { machine_id } = requestBody;

    // Validate machine_id
    if (!machine_id) {
      console.log('Missing machine_id in request body');
      return new Response(
        JSON.stringify({ error: 'Missing machine_id parameter' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(machine_id)) {
      console.log(`Invalid machine_id format: ${machine_id}`);
      return new Response(
        JSON.stringify({ error: 'Invalid machine_id format. Must be a valid UUID.' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Attempting to assign job to machine: ${machine_id}`);

    // Call the atomic assign_job_to_machine SQL function
    const { data, error } = await supabase.rpc('assign_job_to_machine', {
      machine_id: machine_id
    });

    console.log('RPC Response data:', data);
    console.log('RPC Response error:', error);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Database error', 
          details: error.message 
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Check if job was assigned
    if (!data || data.length === 0) {
      console.log('No job available for assignment');
      return new Response(
        JSON.stringify({ message: "No job found" }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Job successfully assigned
    const assignedJob = data[0];
    console.log('Job successfully assigned:', assignedJob);

    return new Response(
      JSON.stringify({
        success: true,
        job: assignedJob,
        message: `Job ${assignedJob.job_number} assigned to machine successfully`
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
