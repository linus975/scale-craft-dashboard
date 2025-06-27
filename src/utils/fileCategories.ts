
export const getFileCategory = (fileName: string): 'CAD' | 'INI' | 'GCODE' => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'f3d':
    case 'step':
    case 'stp':
    case 'iges':
    case 'igs':
    case 'dwg':
    case 'dxf':
    case 'stl':
      return 'CAD';
    case 'ini':
      return 'INI';
    case 'gcode':
    case 'g':
      return 'GCODE';
    default:
      return 'CAD';
  }
};
