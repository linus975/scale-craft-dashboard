
import React from 'react';

interface ValidationInfoProps {
  partName: string;
  hasPersonalizedFiles: boolean;
  hasF3D: boolean;
  hasINI: boolean;
}

const ValidationInfo: React.FC<ValidationInfoProps> = ({
  partName,
  hasPersonalizedFiles,
  hasF3D,
  hasINI
}) => {
  if (!hasPersonalizedFiles) {
    return null;
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-medium text-blue-900 mb-2">
        Erforderliche Dateien für personalisierbare Designs in "{partName}":
      </h5>
      <div className="flex gap-4 text-sm">
        <div className={`flex items-center gap-1 ${hasF3D ? 'text-green-600' : 'text-red-600'}`}>
          {hasF3D ? '✓' : '✗'} F3D-Datei (CAD)
        </div>
        <div className={`flex items-center gap-1 ${hasINI ? 'text-green-600' : 'text-red-600'}`}>
          {hasINI ? '✓' : '✗'} INI-Datei (Einstellungen)
        </div>
      </div>
    </div>
  );
};

export default ValidationInfo;
