
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Repeat,
  RefreshCw
} from 'lucide-react';

interface PrintAutomationPageProps {
  onBack: () => void;
}

const PrintAutomationPage: React.FC<PrintAutomationPageProps> = ({ onBack }) => {
  const plateChangerSolutions = [
    { 
      name: "Bambu Lab AMS Auto Tool Changer", 
      type: "Hardware Integration", 
      size: "15 KB",
      description: "Complete plate changing system for Bambu Lab X1 series with automatic tool switching capabilities",
      version: "v3.2.1",
      printers: ["X1C", "X1E", "A1 series"]
    },
    { 
      name: "Prusa MMU3 Continuous Print System", 
      type: "Python Script", 
      size: "22 KB",
      description: "Automated plate management system for Prusa printers with MMU3 integration",
      version: "v2.8.0",
      printers: ["MK3S+", "MK4", "XL"]
    },
    { 
      name: "Voron Automatic Plate Ejector", 
      type: "G-code + Hardware", 
      size: "18 KB",
      description: "Custom plate ejection system for Voron printers with automatic part removal",
      version: "v1.9.2",
      printers: ["Voron 2.4", "Voron Trident"]
    },
    { 
      name: "Universal Conveyor Belt System", 
      type: "Arduino + Software", 
      size: "35 KB",
      description: "Conveyor belt integration for continuous printing with any FDM printer",
      version: "v2.1.5",
      printers: ["Universal FDM"]
    },
    { 
      name: "Ender Belt Printer Modification", 
      type: "Hardware Kit", 
      size: "28 KB",
      description: "Complete belt printer conversion kit for Ender 3 series with continuous printing",
      version: "v1.7.3",
      printers: ["Ender 3", "Ender 3 V2", "Ender 3 S1"]
    },
    { 
      name: "Industrial Print Farm Manager", 
      type: "Docker Container", 
      size: "85 MB",
      description: "Enterprise-grade continuous printing orchestration for large print farms",
      version: "v4.0.2",
      printers: ["Multi-brand support"]
    }
  ];

  const implementationGuides = [
    {
      title: "Quick Setup Guide",
      description: "Get started with plate changing automation in under 30 minutes",
      category: "Setup"
    },
    {
      title: "Hardware Installation",
      description: "Step-by-step hardware installation for different printer models",
      category: "Hardware"
    },
    {
      title: "Software Configuration",
      description: "Configure your slicer and printer firmware for automated printing",
      category: "Configuration"
    },
    {
      title: "Troubleshooting Common Issues",
      description: "Solutions for typical problems with continuous printing setups",
      category: "Support"
    },
    {
      title: "Advanced Optimization",
      description: "Fine-tuning your system for maximum efficiency and reliability",
      category: "Advanced"
    },
    {
      title: "Safety Considerations",
      description: "Important safety guidelines for unattended continuous printing",
      category: "Safety"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Print Automation</h2>
          <p className="text-slate-600">Plate changers and continuous printing solutions for automated production</p>
        </div>
      </div>

      {/* Plate Changer Solutions */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-blue-600" />
            Plate Changers & Continuous Printing Solutions
          </CardTitle>
          <CardDescription>
            Professional automation solutions for unattended printing with automatic plate changing and part removal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plateChangerSolutions.map((solution, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Repeat className="h-5 w-5 text-slate-400" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{solution.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {solution.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {solution.version}
                        </Badge>
                        <span className="text-xs text-slate-500">{solution.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">{solution.description}</p>
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1">Compatible printers:</p>
                  <div className="flex flex-wrap gap-1">
                    {solution.printers.map((printer, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {printer}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="ghost">
                    Guide
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guides */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Implementation Guides</CardTitle>
          <CardDescription>Step-by-step guides for setting up continuous printing automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {implementationGuides.map((guide, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{guide.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {guide.category}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{guide.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  <FileText className="h-3 w-3 mr-1" />
                  Open Guide
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintAutomationPage;
