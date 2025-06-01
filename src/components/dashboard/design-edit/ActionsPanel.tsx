
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListPlus, Printer } from 'lucide-react';

interface ActionsPanelProps {
  design: any;
  formData: { version: string };
  uploadedFiles: any[];
  selectedMachine: string;
  setSelectedMachine: (value: string) => void;
  idleMachines: any[];
  onAddToQueue: () => void;
  onPrintOnMachine: () => void;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({
  design,
  formData,
  uploadedFiles,
  selectedMachine,
  setSelectedMachine,
  idleMachines,
  onAddToQueue,
  onPrintOnMachine,
}) => {
  return (
    <div className="space-y-4">
      {/* Add to Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add to QueueBoard</CardTitle>
          <CardDescription>Queue this design for printing</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onAddToQueue} className="w-full">
            <ListPlus className="h-4 w-4 mr-2" />
            Add to Queue
          </Button>
        </CardContent>
      </Card>

      {/* Print on Machine */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Print on Machine</CardTitle>
          <CardDescription>Start printing directly on a machine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Select Machine (Idle Only)</Label>
            <Select onValueChange={setSelectedMachine} value={selectedMachine}>
              <SelectTrigger>
                <SelectValue placeholder="Choose machine" />
              </SelectTrigger>
              <SelectContent>
                {idleMachines.length === 0 ? (
                  <SelectItem value="no-machines" disabled>No idle machines available</SelectItem>
                ) : (
                  idleMachines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id.toString()}>
                      {machine.name} (idle)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={onPrintOnMachine} 
            disabled={!selectedMachine || selectedMachine === 'no-machines' || idleMachines.length === 0}
            className="w-full"
          >
            <Printer className="h-4 w-4 mr-2" />
            Start Print
          </Button>
        </CardContent>
      </Card>

      {/* File Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">File Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Last Modified:</span>
            <span>{design.lastModified || new Date(design.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Version:</span>
            <span>{formData.version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Type:</span>
            <span>{design.design_type === 'static' ? 'Static' : 'Personalized'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Files:</span>
            <span>{uploadedFiles.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActionsPanel;
