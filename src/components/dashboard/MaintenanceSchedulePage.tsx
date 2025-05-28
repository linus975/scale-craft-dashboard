
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Settings,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  Edit,
  Trash2
} from 'lucide-react';

interface MaintenanceSchedulePageProps {
  onBack: () => void;
}

const MaintenanceSchedulePage: React.FC<MaintenanceSchedulePageProps> = ({ onBack }) => {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    machineId: '',
    intervalHours: '',
    intervalType: 'hours' // 'hours' or 'prints'
  });

  // Mock machines data
  const mockMachines = [
    { id: 1, name: "Prusa i3 MK3S+", type: "FDM", status: "idle", totalHours: 1240, nextMaintenance: "2024-06-15" },
    { id: 2, name: "Bambu Lab X1 Carbon", type: "FDM", status: "printing", totalHours: 890, nextMaintenance: "2024-06-02" },
    { id: 3, name: "Ender 3 V2", type: "FDM", status: "offline", totalHours: 2350, nextMaintenance: "2024-05-30" },
    { id: 4, name: "Elegoo Mars 3", type: "SLA", status: "idle", totalHours: 560, nextMaintenance: "2024-06-10" },
    { id: 5, name: "Bambu A1 Mini", type: "FDM", status: "printing", totalHours: 320, nextMaintenance: "2024-06-20" },
    { id: 6, name: "Prusa MINI+", type: "FDM", status: "idle", totalHours: 780, nextMaintenance: "2024-06-08" }
  ];

  // Mock maintenance tasks
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { id: 1, name: "Nozzle Cleaning", description: "Clean and inspect nozzle for clogs", machineId: 1, intervalHours: 100, intervalType: "hours", lastCompleted: "2024-05-20", status: "overdue" },
    { id: 2, name: "Bed Leveling", description: "Check and adjust bed leveling", machineId: 1, intervalHours: 50, intervalType: "hours", lastCompleted: "2024-05-25", status: "due" },
    { id: 3, name: "Filament Path Check", description: "Inspect filament path for wear", machineId: 2, intervalHours: 200, intervalType: "hours", lastCompleted: "2024-05-15", status: "overdue" },
    { id: 4, name: "Belt Tension", description: "Check and adjust belt tension", machineId: 2, intervalHours: 150, intervalType: "hours", lastCompleted: "2024-05-22", status: "completed" },
    { id: 5, name: "Lubrication", description: "Lubricate moving parts", machineId: 3, intervalHours: 300, intervalType: "hours", lastCompleted: "2024-05-10", status: "overdue" }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'due': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-100 text-green-800 border-green-200';
      case 'printing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitTask = () => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      intervalHours: parseInt(taskData.intervalHours),
      machineId: parseInt(taskData.machineId),
      lastCompleted: new Date().toISOString().split('T')[0],
      status: 'completed'
    };

    setMaintenanceTasks(prev => [...prev, newTask]);
    setIsAddTaskDialogOpen(false);
    setTaskData({ name: '', description: '', machineId: '', intervalHours: '', intervalType: 'hours' });
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setTaskData({
      name: task.name,
      description: task.description,
      machineId: task.machineId.toString(),
      intervalHours: task.intervalHours.toString(),
      intervalType: task.intervalType
    });
    setIsEditTaskDialogOpen(true);
  };

  const handleUpdateTask = () => {
    setMaintenanceTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { 
            ...task, 
            name: taskData.name,
            description: taskData.description,
            machineId: parseInt(taskData.machineId),
            intervalHours: parseInt(taskData.intervalHours),
            intervalType: taskData.intervalType
          }
        : task
    ));
    setIsEditTaskDialogOpen(false);
    setEditingTask(null);
    setTaskData({ name: '', description: '', machineId: '', intervalHours: '', intervalType: 'hours' });
  };

  const handleDeleteTask = (taskId: number) => {
    setMaintenanceTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleCompleteTask = (taskId: number) => {
    setMaintenanceTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', lastCompleted: new Date().toISOString().split('T')[0] }
        : task
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Machine Statistics
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Maintenance Schedule</h2>
          <p className="text-slate-600">Manage maintenance tasks and schedules for all machines</p>
        </div>
      </div>

      {/* Add New Task Button */}
      <div className="flex justify-end">
        <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Maintenance Task</DialogTitle>
              <DialogDescription>
                Create a new recurring maintenance task for a machine
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskName">Task Name</Label>
                <Input
                  id="taskName"
                  placeholder="e.g., Nozzle Cleaning"
                  value={taskData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Input
                  id="taskDescription"
                  placeholder="Describe the maintenance task"
                  value={taskData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="machine">Machine</Label>
                <Select value={taskData.machineId} onValueChange={(value) => handleInputChange('machineId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMachines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id.toString()}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="interval">Interval</Label>
                  <Input
                    id="interval"
                    type="number"
                    placeholder="100"
                    value={taskData.intervalHours}
                    onChange={(e) => handleInputChange('intervalHours', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervalType">Type</Label>
                  <Select value={taskData.intervalType} onValueChange={(value) => handleInputChange('intervalType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="prints">Print Jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleSubmitTask} 
                className="w-full"
                disabled={!taskData.name || !taskData.machineId || !taskData.intervalHours}
              >
                Add Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Maintenance Task</DialogTitle>
              <DialogDescription>
                Update the maintenance task settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editTaskName">Task Name</Label>
                <Input
                  id="editTaskName"
                  placeholder="e.g., Nozzle Cleaning"
                  value={taskData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTaskDescription">Description</Label>
                <Input
                  id="editTaskDescription"
                  placeholder="Describe the maintenance task"
                  value={taskData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMachine">Machine</Label>
                <Select value={taskData.machineId} onValueChange={(value) => handleInputChange('machineId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMachines.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id.toString()}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="editInterval">Interval</Label>
                  <Input
                    id="editInterval"
                    type="number"
                    placeholder="100"
                    value={taskData.intervalHours}
                    onChange={(e) => handleInputChange('intervalHours', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editIntervalType">Type</Label>
                  <Select value={taskData.intervalType} onValueChange={(value) => handleInputChange('intervalType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="prints">Print Jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleUpdateTask} 
                className="w-full"
                disabled={!taskData.name || !taskData.machineId || !taskData.intervalHours}
              >
                Update Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* All Machines Grid */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            All Machines
          </CardTitle>
          <CardDescription>Complete overview of all machines and their maintenance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockMachines.map((machine) => (
              <div key={machine.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-900">{machine.name}</h4>
                    <p className="text-sm text-slate-500">{machine.type} • {machine.totalHours}h total</p>
                  </div>
                  <Badge className={getMachineStatusColor(machine.status)}>
                    {machine.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Next maintenance: {machine.nextMaintenance}</span>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tasks */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Tasks
          </CardTitle>
          <CardDescription>Scheduled maintenance tasks for all machines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceTasks.map((task) => {
              const machine = mockMachines.find(m => m.id === task.machineId);
              return (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(task.status)}
                    <div>
                      <h4 className="font-medium text-slate-900">{task.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{machine?.name}</span>
                        <span>•</span>
                        <span>Every {task.intervalHours} {task.intervalType}</span>
                        <span>•</span>
                        <span>Last: {task.lastCompleted}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    {task.status !== 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSchedulePage;
