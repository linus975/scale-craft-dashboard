
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'personalizable';
  fileExtension?: string;
  isF3DFile?: boolean;
  isINIFile?: boolean;
  uploadContext?: string;
  fileCategory?: 'CAD' | 'INI' | 'GCODE';
}

export type ExpectedFileType = 'f3d' | 'ini' | 'gcode';
