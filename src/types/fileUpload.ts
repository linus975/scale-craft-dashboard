
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName: string; // Required für Konsistenz
  partId?: string;
  designType?: 'static' | 'personalizable';
  fileExtension?: string;
  isF3DFile?: boolean;
  isINIFile?: boolean;
  uploadContext?: string;
  fileCategory: 'CAD' | 'INI' | 'GCODE'; // Machen wir required
  // Zusätzliche Felder für Formulardaten
  productName?: string;
  material?: string;
  color?: string;
  machine?: string;
  nozzleDiameter?: string;
  cadSoftware?: string;
  slicer?: string;
}

export type ExpectedFileType = 'f3d' | 'ini' | 'gcode';
