
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Zap, Settings } from 'lucide-react';

interface AutomationSettingsProps {
  settings: {
    autoCreateJobs: boolean;
    parameterMapping: boolean;
    orderNotifications: boolean;
  };
  onToggle: (setting: string) => void;
}

const AutomationSettings: React.FC<AutomationSettingsProps> = ({
  settings,
  onToggle
}) => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automation Rules
        </CardTitle>
        <CardDescription>Configure automatic order processing and job creation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div>
            <h4 className="font-medium text-green-900">Auto-create print jobs</h4>
            <p className="text-sm text-green-700">Automatically create print jobs when new orders are received</p>
          </div>
          <Switch
            checked={settings.autoCreateJobs}
            onCheckedChange={() => onToggle('autoCreateJobs')}
          />
        </div>
        
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <h4 className="font-medium text-blue-900">Parameter mapping</h4>
            <p className="text-sm text-blue-700">Map order customization data to CAD parameters</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.parameterMapping}
              onCheckedChange={() => onToggle('parameterMapping')}
            />
            <Button size="sm" variant="outline">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div>
            <h4 className="font-medium text-yellow-900">Order notifications</h4>
            <p className="text-sm text-yellow-700">Send notifications when orders require manual review</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={settings.orderNotifications}
              onCheckedChange={() => onToggle('orderNotifications')}
            />
            <Button size="sm" variant="outline">
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationSettings;
