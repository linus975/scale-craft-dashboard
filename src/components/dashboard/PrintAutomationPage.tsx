
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  ArrowLeft
} from 'lucide-react';

interface PrintAutomationPageProps {
  onBack: () => void;
}

const PrintAutomationPage: React.FC<PrintAutomationPageProps> = ({ onBack }) => {
  const automationFiles = [
    { 
      name: "Prusa Connect API Integration", 
      type: "Python Script", 
      size: "12 KB",
      description: "Vollständige Integration mit Prusa Connect API für automatisches Job-Management",
      version: "v2.1.0"
    },
    { 
      name: "OctoPrint Automation", 
      type: "Shell Script", 
      size: "8 KB",
      description: "Automatisierung für OctoPrint-basierte Drucker mit Webcam-Integration",
      version: "v1.8.3"
    },
    { 
      name: "Bambu Lab Queue Manager", 
      type: "Node.js", 
      size: "25 KB",
      description: "Erweiterte Queue-Verwaltung für Bambu Lab Drucker mit Cloud-Integration",
      version: "v3.0.1"
    },
    { 
      name: "Universal G-code Processor", 
      type: "Python Script", 
      size: "18 KB",
      description: "Universal G-Code Prozessor mit automatischer Materialerkennung",
      version: "v1.5.2"
    },
    { 
      name: "Multi-Printer Orchestrator", 
      type: "Docker Container", 
      size: "45 MB",
      description: "Orchestrierung mehrerer Drucker verschiedener Hersteller",
      version: "v2.3.0"
    },
    { 
      name: "Quality Control AI", 
      type: "Python + TensorFlow", 
      size: "120 MB",
      description: "KI-basierte Qualitätskontrolle mit Bilderkennung und automatischer Fehlererkennung",
      version: "v1.2.1"
    }
  ];

  const integrationGuides = [
    {
      title: "Schnellstart-Anleitung",
      description: "Erste Schritte mit der Print-Automatisierung in 10 Minuten",
      category: "Setup"
    },
    {
      title: "API-Konfiguration",
      description: "Detaillierte Anleitung zur Konfiguration verschiedener Drucker-APIs",
      category: "Configuration"
    },
    {
      title: "Troubleshooting Guide",
      description: "Häufige Probleme und deren Lösungen",
      category: "Support"
    },
    {
      title: "Advanced Workflows",
      description: "Erweiterte Automatisierungs-Workflows für komplexe Produktionsumgebungen",
      category: "Advanced"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Print Automation Files</h2>
          <p className="text-slate-600">Download und Implementierung von Automatisierungslösungen</p>
        </div>
      </div>

      {/* Automation Scripts */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Verfügbare Automatisierungs-Scripts
          </CardTitle>
          <CardDescription>
            Professionelle Automatisierungslösungen für verschiedene 3D-Drucker und Workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automationFiles.map((file, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Download className="h-5 w-5 text-slate-400" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{file.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.version}
                        </Badge>
                        <span className="text-xs text-slate-500">{file.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{file.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="ghost">
                    Docs
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Guides */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle>Integration Guides</CardTitle>
          <CardDescription>Schritt-für-Schritt Anleitungen für die Implementierung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrationGuides.map((guide, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{guide.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {guide.category}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{guide.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  Guide öffnen
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
