
const WEBHOOK_ENDPOINTS = {
  CLASSIFY_JOB: 'http://n8n.melemeng.com/webhook-test/classify-job'
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
      const response = await fetch(WEBHOOK_ENDPOINTS.CLASSIFY_JOB, {
        method: 'POST',
        mode: 'no-cors', // Bypass CORS restrictions
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      console.log('Webhook request sent successfully (no-cors mode)');
      
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
