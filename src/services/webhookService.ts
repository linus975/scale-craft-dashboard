

const WEBHOOK_ENDPOINTS = {
  CLASSIFY_JOB: 'https://n8n.melemeng.com/webhook/classify-job'
} as const;

interface ClassifyJobRequest {
  job_id: string;
}

interface ClassifyJobResponse {
  success: boolean;
  message?: string;
}

export const webhookService = {
  async classifyJob(jobId: string): Promise<ClassifyJobResponse> {
    try {
      console.log('Sending webhook to classify job:', jobId);
      
      // Use GET request with query parameters
      const url = `${WEBHOOK_ENDPOINTS.CLASSIFY_JOB}?source=marketplace&job_id=${jobId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors', // Bypass CORS restrictions
      });

      console.log('Webhook GET request sent successfully (no-cors mode)');
      
      // In no-cors mode, we can't read the response, so we assume success
      // if no error was thrown during the fetch
      return {
        success: true,
        message: 'Webhook sent successfully (response validation not possible in no-cors mode)'
      };
    } catch (error) {
      console.error('Error sending webhook:', error);
      throw error;
    }
  }
};

