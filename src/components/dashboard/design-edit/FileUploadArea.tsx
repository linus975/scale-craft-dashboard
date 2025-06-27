
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';

interface FileUploadAreaProps {
  partType: 'static' | 'personalizable';
  onGcodeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCadUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIniUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  gcodeFile: File | null;
  cadFile: File | null;
  iniFile: File | null;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  partType,
  onGcodeUpload,
  onCadUpload,
  onIniUpload,
  gcodeFile,
  cadFile,
  iniFile
}) => {
  if (partType === 'static') {
    return (
      <div className="space-y-2">
        <Label>G-Code File</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('gcode-upload')?.click()}
              >
                <FileText className="mr-2 h-4 w-4" />
                Upload G-Code
              </Button>
              <input
                id="gcode-upload"
                type="file"
                accept=".gcode,.g"
                onChange={onGcodeUpload}
                className="hidden"
              />
            </div>
            {gcodeFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {gcodeFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>CAD File (.f3d)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('cad-upload')?.click()}
              >
                Upload F3D
              </Button>
              <input
                id="cad-upload"
                type="file"
                accept=".f3d"
                onChange={onCadUpload}
                className="hidden"
              />
            </div>
            {cadFile && (
              <p className="mt-1 text-xs text-gray-600">
                {cadFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>INI File</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('ini-upload')?.click()}
              >
                Upload INI
              </Button>
              <input
                id="ini-upload"
                type="file"
                accept=".ini"
                onChange={onIniUpload}
                className="hidden"
              />
            </div>
            {iniFile && (
              <p className="mt-1 text-xs text-gray-600">
                {iniFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadArea;
