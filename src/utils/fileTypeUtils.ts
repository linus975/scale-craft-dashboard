
export const getFileTypeFolder = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'f3d':
    case 'step':
    case 'stp':
    case 'stl':
      return 'cad-files';
    case 'ini':
      return 'ini-files';
    case 'gcode':
    case 'g':
      return 'gcode-files';
    default:
      return 'other-files';
  }
};

export const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'f3d':
      return 'Fusion 360 File';
    case 'step':
    case 'stp':
      return 'STEP File';
    case 'stl':
      return 'STL File';
    case 'ini':
      return 'Settings File';
    case 'gcode':
      return 'G-Code File';
    default:
      return 'Unknown';
  }
};

export const validateFileType = (file: File, expectedType?: 'f3d' | 'ini' | 'gcode'): boolean => {
  if (!expectedType) return true;
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (expectedType) {
    case 'f3d':
      return fileExtension === 'f3d';
    case 'ini':
      return fileExtension === 'ini';
    case 'gcode':
      return ['gcode', 'g'].includes(fileExtension || '');
    default:
      return true;
  }
};
