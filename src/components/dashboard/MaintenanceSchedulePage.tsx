
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Settings, 
  Plus,
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceSchedulePageProps {
  onBack: () => void;
}

const MaintenanceSchedulePage: React.FC<MaintenanceSchedulePageProps> = ({ onBack }) => {
  const { toast } = useToast();
  const [isAddPrinterOpen, setIsAddPrinterOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    type: '',
    location: ''
  });
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    intervalHours: '',
    printerId: ''
  });

  const [printers, setPrinters] = useState([
    { 
      id: 1, 
      name: 'Bambu X1C-1', 
      type: 'Bambu X1C', 
      location: 'Station A',
      totalHours: 1245,
      maintenanceTasks: [
        { id: 1, name: 'Nozzle Cleaning', intervalHours: 100, lastDone: 45, nextDue: 55 },
        { id: 2, name: 'Bed Leveling', intervalHours: 200, lastDone: 180, nextDue: 20 },
        { id: 3, name: 'Filament Path Check', intervalHours: 50, lastDone: 48, nextDue: 2 }
      ]
    },
    { 
      id: 2, 
      name: 'Bambu X1C-2', 
      type: 'Bambu X1C', 
      location: 'Station B',
      totalHours: 890,
      maintenanceTasks: [
        { id: 4, name: 'Nozzle Cleaning', intervalHours: 100, lastDone: 75, nextDue: 25 },
        { id: 5, name: 'Bed Leveling', intervalHours: 200, lastDone: 150, nextDue: 50 }
      ]
    },
    { 
      id: 3, 
      name: 'Prusa MK3S-1', 
      type: 'Prusa MK3S+', 
      location: 'Station C',
      totalHours: 2100,
      maintenanceTasks: [
        { id: 6, name: 'Belt Tension Check', intervalHours: 300, lastDone: 280, nextDue: 20 },
        { id: 7, name: 'Extruder Calibration', intervalHours: 150, lastDone: 140, nextDue: 10 }
      ]
    },
    { 
      id: 4, 
      name: 'Bambu A1 Mini-1', 
      type: 'Bambu A1 Mini', 
      location: 'Station D',
      totalHours: 567,
      maintenanceTasks: [
        { id: 8, name: 'Nozzle Cleaning', intervalHours: 80, lastDone: 70, nextDue: 10 }
      ]
    },
    { 
      id: 5, 
      name: 'Prusa MK3S-2', 
      type: 'Prusa MK3S+', 
      location: 'Station E',
      totalHours: 1789,
      maintenanceTasks: [
        { id: 9, name: 'Belt Tension Check', intervalHours: 300, lastDone: 250, nextDue: 50 },
        { id: 10, name: 'Filament Sensor Check', intervalHours: 200, lastDone: 190, nextDue: 10 }
      ]
    }
  ]);

  const handleAddPrinter = () => {
    const printer = {
      id: Date.now(),
      ...newPrinter,
      totalHours: 0,
      maintenanceTasks: []
    };
    
    setPrinters(prev => [...prev, printer]);
    setNewPrinter({ name: '', type: '', location: '' });
    setIsAddPrinterOpen(false);
    
    toast({
      title: "Printer added",
      description: `${newPrinter.name} has been added to the maintenance schedule.`,
    });
  };

  const handleAddTask = () => {
    if (!selectedPrinter) return;
    
    const task = {
      id: Date.now(),
      name: newTask.name,
      description: newTask.description,
      intervalHours: parseInt(newTask.intervalHours),
      lastDone: 0,
      nextDue: parseInt(newTask.intervalHours)
    };
    
    setPrinters(prev => prev.map(printer => 
      printer.id === selectedPrinter.id 
        ? { ...printer, maintenanceTasks: [...printer.maintenanceTasks, task] }
        : printer
    ));
    
    setNewTask({ name: '', description: '', intervalHours: '', printerId: '' });
    setIsAddTaskOpen(false);
    setSelectedPrinter(null);
    
    toast({
      title: "Maintenance task added",
      description: `${newTask.name} has been scheduled for ${selectedPrinter.name}.`,
    });
  };

  const getTaskStatus = (task: any) => {
    if (task.nextDue <= 0) return 'overdue';
    if (task.nextDue <= 10) return 'due-soon';
    return 'ok';
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'due-soon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ok': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'due-soon': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Machines
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Maintenance Schedule</h2>
            <p className="text-slate-600">Manage printer maintenance tasks and schedules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddPrinterOpen} onOpenChange={setIsAddPrinterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Printer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Printer</DialogTitle>
                <DialogDescription>Add a new printer to the maintenance schedule</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="printerName">Printer Name</Label>
                  <Input
                    id="printerName"
                    value={newPrinter.name}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Bambu X1C-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printerType">Printer Type</Label>
                  <Select value={newPrinter.type} onValueChange={(value) => setNewPrinter(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select printer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bambu X1C">Bambu X1C</SelectItem>
                      <SelectItem value="Bambu A1 Mini">Bambu A1 Mini</SelectItem>
                      <SelectItem value="Prusa MK3S+">Prusa MK3S+</SelectItem>
                      <SelectItem value="Prusa MK4">Prusa MK4</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="printerLocation">Location</Label>
                  <Input
                    id="printerLocation"
                    value={newPrinter.location}
                    onChange={(e) => setNewPrinter(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Station F"
                  />
                </div>
                <Button 
                  onClick={handleAddPrinter} 
                  className="w-full"
                  disabled={!newPrinter.name || !newPrinter.type || !newPrinter.location}
                >
                  Add Printer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Printers List */}
      <div className="grid grid-cols-1 gap-6">
        {printers.map((printer) => (
          <Card key={printer.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {printer.name}
                  </CardTitle>
                  <CardDescription>
                    {printer.type} • {printer.location} • {printer.totalHours}h total runtime
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedPrinter(printer);
                    setIsAddTaskOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {printer.maintenanceTasks.length > 0 ? (
                <div className="space-y-3">
                  {printer.maintenanceTasks.map((task) => {
                    const status = getTaskStatus(task);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTaskStatusIcon(status)}
                          <div>
                            <h5 className="font-medium text-slate-900">{task.name}</h5>
                            <p className="text-sm text-slate-500">
                              Every {task.intervalHours}h • Last done {task.lastDone}h ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTaskStatusColor(status)}>
                            {task.nextDue <= 0 ? `${Math.abs(task.nextDue)}h overdue` : `${task.nextDue}h remaining`}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Wrench className="h-3 w-3 mr-1" />
                            Mark Done
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  No maintenance tasks configured for this printer.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Task</DialogTitle>
            <DialogDescription>
              Configure a new maintenance task for {selectedPrinter?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name</Label>
              <Input
                id="taskName"
                value={newTask.name}
                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Nozzle Cleaning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description (Optional)</Label>
              <Input
                id="taskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the task"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intervalHours">Interval (Hours)</Label>
              <Input
                id="intervalHours"
                type="number"
                value={newTask.intervalHours}
                onChange={(e) => setNewTask(prev => ({ ...prev, intervalHours: e.target.value }))}
                placeholder="e.g., 100"
              />
            </div>
            <Button 
              onClick={handleAddTask}
              className="w-full"
              disabled={!newTask.name || !newTask.intervalHours}
            >
              Add Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceSchedulePage;
