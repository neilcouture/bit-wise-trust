import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Share, Printer, File } from "lucide-react";

export default function Reports() {
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
    }, 2000);
  };

  const reportTemplates = [
    {
      id: "survival-analysis",
      name: "Survival Analysis Report",
      description: "Complete survival curves, hazard analysis, and KPIs",
      format: "PDF",
      pages: "12-15",
      sections: ["Executive Summary", "Kaplan-Meier Curves", "Hazard Analysis", "Feature Influence", "Recommendations"]
    },
    {
      id: "cohort-comparison", 
      name: "Cohort Comparison Report",
      description: "Side-by-side analysis of multiple bit cohorts",
      format: "PDF",
      pages: "8-10",
      sections: ["Cohort Definitions", "Survival Comparison", "Statistical Tests", "Cost Analysis"]
    },
    {
      id: "predictive-insights",
      name: "Predictive Insights Dashboard",
      description: "Model performance and what-if scenario results",
      format: "PDF + CSV",
      pages: "6-8", 
      sections: ["Model Performance", "Prediction Results", "Scenario Analysis", "Data Export"]
    }
  ];

  const recentReports = [
    {
      name: "Q4 2024 Survival Analysis",
      generated: "2024-01-15",
      cohort: "High RPM Operations",
      size: "2.4 MB",
      status: "completed"
    },
    {
      name: "PDC vs Roller Comparison", 
      generated: "2024-01-12",
      cohort: "Multi-cohort Analysis",
      size: "1.8 MB",
      status: "completed"
    },
    {
      name: "Deep Well Performance Study",
      generated: "2024-01-10", 
      cohort: "Deep Well Drilling",
      size: "3.1 MB",
      status: "completed"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-industrial">Reports</h1>
        <p className="text-muted-foreground">
          Generate comprehensive survival analysis reports and export data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Report Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a template to generate professional analysis reports
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-industrial">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={generateReport}
                      disabled={generating}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {generating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Format: {template.format}</span>
                    <span>Pages: {template.pages}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {template.sections.map((section, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Custom Export */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Custom Data Export</CardTitle>
              <p className="text-sm text-muted-foreground">
                Export raw aggregated data for external analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium text-industrial">Available Datasets</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Kaplan-Meier survival points</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Hazard rate data</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Feature importance scores</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded" />
                      <span>Cohort definitions</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-industrial">Export Options</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <File className="w-4 h-4 mr-2" />
                      Export as CSV
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="w-4 h-4 mr-2" />
                      Export to Excel
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <div>
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentReports.map((report, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <Badge className="status-operational" variant="outline">
                      {report.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Cohort: {report.cohort}</p>
                    <div className="flex items-center justify-between">
                      <span>{report.generated}</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                      <Share className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Report Statistics */}
          <Card className="card-industrial mt-6">
            <CardHeader>
              <CardTitle className="text-industrial">Report Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Generated:</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Most Popular:</span>
                <span className="font-medium text-xs">Survival Analysis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Size:</span>
                <span className="font-medium">342 MB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}