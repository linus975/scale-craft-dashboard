
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Thermometer,
  Zap
} from 'lucide-react';

interface MachineStatisticsPageProps {
  machineName: string;
}

const MachineStatisticsPage: React.FC<MachineStatisticsPageProps> = ({ machineName }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Uptime */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Uptime</CardTitle>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <CardDescription>Total operational time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">3,458 hours</div>
          <Progress value={85} className="mt-2" />
          <p className="text-sm text-slate-500 mt-1">Last maintenance: 2 weeks ago</p>
        </CardContent>
      </Card>

      {/* Print Success Rate */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Print Success Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <CardDescription>Successful prints vs. failed prints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">98.5%</div>
          <p className="text-sm text-slate-500 mt-1">Out of 1,250 print jobs</p>
        </CardContent>
      </Card>

      {/* Material Usage */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Material Usage</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <CardDescription>Total material consumed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">45.2 kg</div>
          <p className="text-sm text-slate-500 mt-1">Mostly PLA and ABS</p>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Jobs</CardTitle>
            <Activity className="h-5 w-5 text-indigo-500" />
          </div>
          <CardDescription>Currently running print jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">3</div>
          <p className="text-sm text-slate-500 mt-1">Estimated completion in 2-5 hours</p>
        </CardContent>
      </Card>

      {/* Temperature */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Temperature</CardTitle>
            <Thermometer className="h-5 w-5 text-orange-500" />
          </div>
          <CardDescription>Average nozzle temperature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">210°C</div>
          <p className="text-sm text-slate-500 mt-1">Stable temperature readings</p>
        </CardContent>
      </Card>

      {/* Power Consumption */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Power Consumption</CardTitle>
            <Zap className="h-5 w-5 text-yellow-500" />
          </div>
          <CardDescription>Average power usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">120W</div>
          <p className="text-sm text-slate-500 mt-1">Energy-efficient operations</p>
        </CardContent>
      </Card>

      {/* Error Rate */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Error Rate</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <CardDescription>Frequency of errors and warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">0.3%</div>
          <p className="text-sm text-slate-500 mt-1">Low incidence of errors</p>
        </CardContent>
      </Card>

      {/* Print Speed */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Print Speed</CardTitle>
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </div>
          <CardDescription>Average printing speed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">60 mm/s</div>
          <p className="text-sm text-slate-500 mt-1">Optimal speed for quality prints</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineStatisticsPage;
