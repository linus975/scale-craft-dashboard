
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CADIntegrationCard from './CADIntegrationCard';
import CADConnectionSection from './CADConnectionSection';

interface CADIntegration {
  id: string;
  user_id: string;
  program_type: string | null;
  name: string | null;
  client_id: string;
  client_secret?: string;
  status: string;
  token_expires_in?: number;
  token_type?: string;
  refresh_token?: string;
  access_token?: string;
  created_at: string;
  updated_at: string;
}

interface CADProgram {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CADProgramTabProps {
  program: CADProgram;
  integrations: CADIntegration[];
  onConnect: (programId: string) => void;
  onDeleteIntegration: (integrationId: string) => void;
  deleting: string | null;
  loading: boolean;
}

const CADProgramTab: React.FC<CADProgramTabProps> = ({
  program,
  integrations,
  onConnect,
  onDeleteIntegration,
  deleting,
  loading
}) => {
  return (
    <TabsContent value={program.id} className="space-y-4 mt-6">
      {integrations.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span>{program.icon}</span>
            {program.name} Connections
            <Badge variant="outline">{integrations.length}</Badge>
          </h3>
          
          {integrations.map((integration, index) => (
            <CADIntegrationCard
              key={integration.id}
              integration={integration}
              index={index}
              programIcon={program.icon}
              programName={program.name}
              programColor={program.color}
              onDelete={onDeleteIntegration}
              isDeleting={deleting === integration.id}
            />
          ))}

          <CADConnectionSection
            programIcon={program.icon}
            programName={program.name}
            programId={program.id}
            programColor={program.color}
            onConnect={onConnect}
            loading={loading}
            isAddNew={true}
          />
        </div>
      ) : (
        <CADConnectionSection
          programIcon={program.icon}
          programName={program.name}
          programId={program.id}
          programColor={program.color}
          onConnect={onConnect}
          loading={loading}
          isAddNew={false}
        />
      )}
    </TabsContent>
  );
};

export default CADProgramTab;
