
// Convert print jobs to legacy format for display
export const convertToLegacyFormat = (jobs: any[]) => {
  return jobs.map(job => ({
    id: job.id,
    name: job.product_name,
    status: job.status === 'waiting_for_classifying' ? 'queued' : 
            job.status === 'ready_to_print' ? 'queued' :
            job.status === 'done' ? 'completed' : job.status,
    progress: job.status === 'completed' || job.status === 'done' ? 100 : 0,
    material: job.material,
    printer: job.printer_id,
    priority: job.priority > 7 ? 'high' : 'normal',
    count: job.quantity,
    estimatedTime: "2h 30m", // Default estimate
    filePath: job.gcode_file_path || "/gcode/default.gcode",
    iniFile: "/settings/default.ini",
    job_number: job.job_number
  }));
};
