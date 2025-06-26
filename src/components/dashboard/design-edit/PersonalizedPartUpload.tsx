
import React from 'react';
import FileUploadSection from './FileUploadSection';

interface PersonalizedPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, partId?: string, expectedFileType?: 'f3d' | 'ini' | 'gcode') => void;
  uploadedFiles: any[];
}

const PersonalizedPartUpload: React.FC<PersonalizedPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles
}) => {
  // Separate upload handlers for CAD and INI files
  const handleCADFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event, partId, 'f3d');
  };

  const handleINIFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(event, partId, 'ini');
  };

  return (
    <div className="space-y-4">
      {/* CAD and INI Files Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        {/* CAD File Upload */}
        <FileUploadSection
          title={`CAD-Datei für "${partName}"`}
          accept=".f3d"
          extensions=".f3d"
          inputId={`cadFileUpload-${partId}`}
          required={false}
          partId={partId}
          uploading={uploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleCADFileUpload}
          expectedFileType="f3d"
        />

        {/* INI File Upload */}
        <FileUploadSection
          title="INI-Konfigurationsdatei"
          accept=".ini"
          extensions=".ini"
          inputId={`iniFileUpload-${partId}`}
          required={false}
          partId={partId}
          uploading={uploading}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleINIFileUpload}
          expectedFileType="ini"
        />
      </div>
    </div>
  );
};

export default PersonalizedPartUpload;
