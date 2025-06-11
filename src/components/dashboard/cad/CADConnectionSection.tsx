
import React from 'react';
import { Button } from '@/components/ui/button';

interface CADConnectionSectionProps {
  programIcon: string;
  programName: string;
  programId: string;
  programColor: string;
  onConnect: (programId: string) => void;
  loading: boolean;
  isAddNew?: boolean;
}

const CADConnectionSection: React.FC<CADConnectionSectionProps> = ({
  programIcon,
  programName,
  programId,
  programColor,
  onConnect,
  loading,
  isAddNew = false
}) => {
  return (
    <div className={`text-center space-y-4 p-6 bg-gray-50 rounded-lg ${isAddNew ? 'pt-4 border-t' : ''}`}>
      <span className="text-4xl">{programIcon}</span>
      <h4 className="font-medium text-gray-900">
        {isAddNew ? `Add New ${programName} Connection` : `Connect ${programName}`}
      </h4>
      <p className="text-gray-600 text-sm">
        {isAddNew 
          ? `Add another ${programName} connection for additional integrations`
          : `Connect ${programName} for enhanced design integration`
        }
      </p>
      <Button 
        onClick={() => onConnect(programId)}
        disabled={loading}
        className="w-full max-w-xs text-white"
        style={{ backgroundColor: programColor }}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Connecting...
          </>
        ) : (
          isAddNew ? '➕ Add New Connection' : `🔗 Connect ${programName}`
        )}
      </Button>
    </div>
  );
};

export default CADConnectionSection;
