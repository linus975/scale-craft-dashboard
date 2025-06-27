
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  path: string;
  originalName?: string;
  partId?: string;
  designType?: 'static' | 'personalized';
}

interface DesignPart {
  id: string;
  name: string;
  files: UploadedFile[];
  partType?: 'static' | 'personalized';
  parameters?: {
    sketchName?: string;
    replacementValue?: string;
    replacementType?: 'text' | 'dimension';
  };
  cadSoftware?: string;
  slicer?: string;
}

export const organizeFilesByParts = (designParts: DesignPart[], uploadedFiles: UploadedFile[]) => {
  return designParts.map(part => ({
    ...part,
    files: uploadedFiles.filter(file => file.partId === part.id || (!file.partId && part.id === 'part1'))
  }));
};

export const validatePartFiles = (part: DesignPart) => {
  const personalizedFiles = part.files.filter(f => f.designType === 'personalized');
  const hasF3D = personalizedFiles.some(f => f.name.toLowerCase().endsWith('.f3d'));
  const hasINI = personalizedFiles.some(f => f.name.toLowerCase().endsWith('.ini'));
  return { hasF3D, hasINI, hasPersonalizedFiles: personalizedFiles.length > 0 };
};
