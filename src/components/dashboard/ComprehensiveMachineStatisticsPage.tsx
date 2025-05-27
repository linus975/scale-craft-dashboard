
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Package,
  Thermometer,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  Calendar
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ComprehensiveMachineStatisticsPageProps {
  onBack: () => void;
}

const ComprehensiveMachineStatisticsPage: React.FC<ComprehensiveMachineStatisticsPageProps> = ({ onBack }) => {
  // Mock data for comprehensive statistics
  const uptimeData = [
    { name: 'Mon', uptime: 98 },
    { name: 'Tue', uptime: 95 },
    { name: 'Wed', uptime: 99 },
    { name: 'Thu', uptime: 97 },
    { name: 'Fri', uptime: 94 },
    { name: 'Sat', uptime: 96 },
    { name: 'Sun', uptime: 98 }
  ];

  const performanceData = [
    { name: 'Week 1', jobs: 45, success: 43, failed: 2 },
    { name: 'Week 2', jobs: 52, success: 50, failed: 2 },
    { name: 'Week 3', jobs: 38, success: 36, failed: 2 },
    { name: 'Week 4', jobs: 47, success: 45, failed: 2 }
  ];

  const errorTypeData = [
    { name: 'Bed Adhesion', value: 35, color: '#ef4444' },
    { name: 'Filament Issues', value: 25, color: '#f59e0b' },
    { name: 'Network Problems', value: 20, color: '#3b82f6' },
    { name: 'Power Issues', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 8, color: '#6b7280' }
  ];

  const recentErrors = [
    { id: 1, timestamp: '2024-01-15 14:20:30', machine: 'Prusa i3 MK3S+', error: 'Bed adhesion failure', severity: 'high' },
    { id: 2, timestamp: '2024-01-15 13:55:42', machine: 'Bambu Lab X1C', error: 'Network connectivity timeout', severity: 'medium' },
    { id: 3, timestamp: '2024-01-15 12:30:15', machine: 'Ender 3 V2', error: 'Filament runout not detected', severity: 'low' },
    { id: 4, timestamp: '2024-01-15 11:45:28', machine: 'X1C-2', error: 'Temperature fluctuation', severity: 'medium' },
  ];

  const maintenanceSchedule = [
    { machine: 'Prusa i3 MK3S+', nextMaintenance: '2024-01-18', type: 'Belt Tension Check', overdue: false },
    { machine: 'Bambu Lab X1C', nextMaintenance: '2024-01-16', type: 'Nozzle Cleaning', overdue: true },
    { machine: 'Ender 3 V2', nextMaintenance: '2024-01-20', type: 'Full Service', overdue: false },
    { machine: 'X1C-2', nextMaintenance: '2024-01-22', type: 'Calibration', overdue: false },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Machine Parc
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Comprehensive Machine Statistics</h2>
          <p className="text-slate-600">Complete performance analysis and operational metrics</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Machines</CardTitle>
              <Cpu className="h-4 w-4 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-slate-500">3 active, 5 idle</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Fleet Uptime</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-sm text-slate-500">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Print Hours</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847h</div>
            <p className="text-sm text-slate-500">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-sm text-slate-500">Below target (3%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Uptime Chart */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle>Weekly Uptime Performance</CardTitle>
            <CardDescription>Machine availability over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                uptime: { label: "Uptime %", color: "#3b82f6" }
              }}
              className="h-[200px]"
            >
              <LineChart data={uptimeData}>
                <XAxis dataKey="name" />
                <YAxis domain={[90, 100]} />
                <Line type="monotone" dataKey="uptime" stroke="#3b82f6" strokeWidth={2} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle>Job Performance Trends</CardTitle>
            <CardDescription>Success vs failure rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                success: { label: "Successful Jobs", color: "#10b981" },
                failed: { label: "Failed Jobs", color: "#ef4444" }
              }}
              className="h-[200px]"
            >
              <BarChart data={performanceData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="success" fill="#10b981" />
                <Bar dataKey="failed" fill="#ef4444" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Types Distribution */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle>Error Types Distribution</CardTitle>
            <CardDescription>Common failure patterns across the fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <ChartContainer
                  config={{
                    errors: { label: "Error Types", color: "#ef4444" }
                  }}
                  className="h-[200px]"
                >
                  <PieChart>
                    <Pie
                      data={errorTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {errorTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="space-y-2">
                {errorTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle>Recent Error Log</CardTitle>
            <CardDescription>Latest machine errors and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentErrors.map((error) => (
                <div key={error.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{error.error}</p>
                    <p className="text-sm text-slate-500">{error.machine} • {error.timestamp}</p>
                  </div>
                  <Badge className={getSeverityColor(error.severity)}>
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Schedule */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Maintenance Schedule
          </CardTitle>
          <CardDescription>Upcoming maintenance tasks and overdue items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenanceSchedule.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.overdue ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="font-medium text-slate-900">{item.machine}</p>
                    <p className="text-sm text-slate-500">{item.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${item.overdue ? 'text-red-600' : 'text-slate-900'}`}>
                    {item.nextMaintenance}
                  </p>
                  {item.overdue && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Server Load</span>
                <span className="text-sm font-medium">65%</span>
              </div>
              <Progress value={65} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Disk Usage</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <Progress value={78} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Connectivity</span>
                <span className="text-sm font-medium">98%</span>
              </div>
              <Progress value={98} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComprehensiveMachineStatisticsPage;
