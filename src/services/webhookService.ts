
const WEBHOOK_ENDPOINTS = {
  CLASSIFY_JOB: 'http://n8n.melemeng.com/webhook/classify-job'
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
      const response = await fetch(WEBHOOK_ENDPOINTS.CLASSIFY_JOB, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error classifying job:', error);
      throw error;
    }
  }
};
