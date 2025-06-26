
import React from 'react';
import GCodeFileUpload from './GCodeFileUpload';

interface StaticPartUploadProps {
  partName: string;
  partId: string;
  uploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles: any[];
  gcodeFile?: File | null;
  onGcodeFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveGcodeFile?: () => void;
}

const StaticPartUpload: React.FC<StaticPartUploadProps> = ({
  partName,
  partId,
  uploading,
  onFileUpload,
  uploadedFiles,
  gcodeFile,
  onGcodeFileChange,
  onRemoveGcodeFile
}) => {
  return (
    <div className="space-y-2">
      <GCodeFileUpload
        title={`G-code File for "${partName}"`}
        partId={partId}
        uploading={uploading}
        gcodeFile={gcodeFile}
        onGcodeFileChange={onGcodeFileChange}
        onRemoveGcodeFile={onRemoveGcodeFile}
      />
    </div>
  );
};

export default StaticPartUpload;
