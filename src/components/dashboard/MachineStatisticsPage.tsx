
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Thermometer
} from 'lucide-react';

interface MachineStatisticsPageProps {
  onBack: () => void;
}

const MachineStatisticsPage: React.FC<MachineStatisticsPageProps> = ({ onBack }) => {
  const machineStats = [
    {
      id: 1,
      name: "Bambu X1C-1",
      status: "Printing",
      uptime: "94.2%",
      totalJobs: 342,
      successRate: "98.5%",
      avgPrintTime: "4.2h",
      bedTemp: "60°C",
      nozzleTemp: "210°C",
      lastMaintenance: "2 days ago"
    },
    {
      id: 2,
      name: "Prusa MK3S-2",
      status: "Idle",
      uptime: "91.8%",
      totalJobs: 278,
      successRate: "96.8%",
      avgPrintTime: "5.1h",
      bedTemp: "25°C",
      nozzleTemp: "25°C",
      lastMaintenance: "1 week ago"
    },
    {
      id: 3,
      name: "Bambu A1 Mini-1",
      status: "Maintenance",
      uptime: "88.5%",
      totalJobs: 156,
      successRate: "97.2%",
      avgPrintTime: "3.8h",
      bedTemp: "25°C",
      nozzleTemp: "25°C",
      lastMaintenance: "Today"
    }
  ];

  const overallStats = {
    totalPrintTime: "1,247h",
    totalMaterial: "34.2kg",
    energyConsumption: "156 kWh",
    co2Footprint: "78.2 kg CO₂"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Printing': return <Activity className="h-4 w-4 text-green-500" />;
      case 'Idle': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Maintenance': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Printing': return 'bg-green-100 text-green-800 border-green-200';
      case 'Idle': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Machine Statistics</h2>
          <p className="text-slate-600">Detaillierte Statistiken und Performance-Daten Ihrer 3D-Drucker</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Gesamt Druckzeit</p>
                <p className="text-xl font-bold text-slate-900">{overallStats.totalPrintTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Material verbraucht</p>
                <p className="text-xl font-bold text-slate-900">{overallStats.totalMaterial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Energieverbrauch</p>
                <p className="text-xl font-bold text-slate-900">{overallStats.energyConsumption}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-slate-600">CO₂ Fußabdruck</p>
                <p className="text-xl font-bold text-slate-900">{overallStats.co2Footprint}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Machine Statistics */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Maschinen-Details</CardTitle>
          <CardDescription>Performance-Daten und Status einzelner 3D-Drucker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {machineStats.map((machine) => (
              <div key={machine.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(machine.status)}
                    <div>
                      <h3 className="font-semibold text-slate-900">{machine.name}</h3>
                      <Badge className={getStatusColor(machine.status)}>
                        {machine.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Wartung: {machine.lastMaintenance}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Uptime</p>
                    <p className="text-lg font-semibold text-slate-900">{machine.uptime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Jobs Total</p>
                    <p className="text-lg font-semibold text-slate-900">{machine.totalJobs}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Erfolgsrate</p>
                    <p className="text-lg font-semibold text-slate-900">{machine.successRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Ø Druckzeit</p>
                    <p className="text-lg font-semibold text-slate-900">{machine.avgPrintTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-slate-600">Bett: {machine.bedTemp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-slate-600">Düse: {machine.nozzleTemp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineStatisticsPage;
