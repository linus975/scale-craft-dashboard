
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploadSection from './FileUploadSection';
import GCodeFileUpload from './GCodeFileUpload';

interface PartSpecificFileUploadProps {
  partName: string;
  partId: string;
  partType: 'static' | 'personalizable';
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: any[];
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
}

const PartSpecificFileUpload: React.FC<PartSpecificFileUploadProps> = ({
  partName,
  partId,
  partType,
  uploading,
  onFileUpload,
  uploadedFiles,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile
}) => {
  console.log(`🎯 [PartSpecificFileUpload] Rendering for PART: "${partName}" (ID: ${partId})`);
  console.log(`📁 Files for this part:`, uploadedFiles.filter(f => f.partId === partName).map(f => f.name));

  const handleF3DUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`📤 [PartSpecificFileUpload] F3D upload for PART: "${partName}"`);
    onFileUpload(event);
  };

  const handleINIUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`📤 [PartSpecificFileUpload] INI upload for PART: "${partName}"`);
    onFileUpload(event);
  };

  const handleGCodeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`📤 [PartSpecificFileUpload] G-Code upload for PART: "${partName}"`);
    if (onGcodeFileChange) {
      onGcodeFileChange(event);
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📁 Files für "{partName}"
          <span className="text-sm font-normal text-gray-500">
            ({partType === 'personalizable' ? 'Personalisierbar' : 'Statisch'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {partType === 'personalizable' ? (
          <>
            {/* Personalizable Part: F3D + INI Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUploadSection
                title="CAD-Datei (.f3d)"
                accept=".f3d"
                extensions=".f3d"
                inputId={`f3d-upload-${partId}`}
                required={false}
                partId={partName}
                uploading={uploading}
                uploadedFiles={uploadedFiles}
                onFileUpload={handleF3DUpload}
                expectedFileType="f3d"
              />
              
              <FileUploadSection
                title="INI-Konfiguration"
                accept=".ini"
                extensions=".ini"
                inputId={`ini-upload-${partId}`}
                required={false}
                partId={partName}
                uploading={uploading}
                uploadedFiles={uploadedFiles}
                onFileUpload={handleINIUpload}
                expectedFileType="ini"
              />
            </div>
          </>
        ) : (
          <>
            {/* Static Part: G-Code File */}
            <GCodeFileUpload
              title="G-Code Datei"
              partId={partId}
              uploading={uploading}
              gcodeFile={gcodeFile}
              onGcodeFileChange={handleGCodeUpload}
              onRemoveGcodeFile={onRemoveGcodeFile}
            />
          </>
        )}
        
        {/* File Count Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Dateien für dieses Part: {uploadedFiles.filter(f => f.partId === partName).length}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartSpecificFileUpload;
