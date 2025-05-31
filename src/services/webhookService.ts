
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
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Add this to handle CORS issues
        body: JSON.stringify({ job_id: jobId }),
      });

      // With no-cors mode, we can't read the response status or body
      // So we'll assume success if no error is thrown
      console.log('Webhook request sent (no-cors mode)');
      return { success: true, message: 'Request sent successfully' };
    } catch (error) {
      console.error('Error classifying job:', error);
      throw error;
    }
  }
};
