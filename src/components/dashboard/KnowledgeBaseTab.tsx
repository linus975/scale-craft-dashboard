
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Calendar, 
  User,
  BookOpen,
  Lightbulb,
  Newspaper
} from 'lucide-react';

const KnowledgeBaseTab: React.FC = () => {
  const automationFiles = [
    { name: "Prusa Connect API Integration", type: "Python Script", size: "12 KB" },
    { name: "OctoPrint Automation", type: "Shell Script", size: "8 KB" },
    { name: "Bambu Lab Queue Manager", type: "Node.js", size: "25 KB" },
    { name: "Universal G-code Processor", type: "Python Script", size: "18 KB" }
  ];

  const news = [
    {
      title: "New Bambu Lab X1E Integration Available",
      date: "2 days ago",
      excerpt: "Enhanced support for the new X1E series with improved API connectivity and real-time monitoring capabilities."
    },
    {
      title: "Print Quality Optimization Update",
      date: "1 week ago", 
      excerpt: "Our latest algorithm update improves print success rates by 15% through better failure prediction."
    },
    {
      title: "Multi-Material Support Enhancement",
      date: "2 weeks ago",
      excerpt: "Extended support for complex multi-material prints with automatic material switching protocols."
    }
  ];

  const caseStudies = [
    {
      title: "Scaling Custom Phone Case Production",
      company: "TechAccessories Inc.",
      result: "300% increase in daily output",
      description: "How automation reduced manual intervention from 80% to 15% of total production time."
    },
    {
      title: "Automated Miniature Production Line",
      company: "GameCraft Studios", 
      result: "99.2% print success rate",
      description: "Implementing predictive maintenance and quality control for high-volume miniature production."
    },
    {
      title: "Multi-Location Print Farm Management",
      company: "Global3D Solutions",
      result: "50% reduction in management overhead",
      description: "Centralized control system managing 150+ printers across 5 locations worldwide."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Knowledge Base</h2>
        <p className="text-slate-600">Resources, automation files, and insights for 3D print production</p>
      </div>

      {/* Automation Files Section */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Print Automation Files</CardTitle>
              <CardDescription>Download ready-to-use automation scripts and integrations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{file.type} • {file.size}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* News Section */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle>Latest News</CardTitle>
              <CardDescription>Stay updated with the latest features and improvements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="border-b border-slate-200 last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{item.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Case Studies Section */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle>Case Studies</CardTitle>
              <CardDescription>Learn from successful automation implementations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {caseStudies.map((study, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{study.title}</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {study.result}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <User className="h-3 w-3" />
                  <span>{study.company}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{study.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Read Full Case Study
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBaseTab;
