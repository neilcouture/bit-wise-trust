import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Play, Save, Users, Shield } from "lucide-react";

interface CohortRule {
  field: string;
  operator: string;
  value: string | string[];
}

interface Cohort {
  id: string;
  name: string;
  rules: CohortRule[];
  size?: number;
  privacy?: "safe" | "suppressed";
}

const FIELD_OPTIONS = [
  { value: "BIT_TYPE", label: "Bit Type", type: "select", options: ["PDC", "Roller", "Diamond", "Hybrid"] },
  { value: "BIT_SIZE", label: "Bit Size", type: "range" },
  { value: "FORMATION", label: "Formation", type: "select", options: ["Sandstone", "Shale", "Limestone", "Granite"] },
  { value: "MUD_TYPE", label: "Mud Type", type: "select", options: ["WBM", "OBM", "SBM"] },
  { value: "VENDOR", label: "Vendor", type: "select", options: ["Smith", "Baker", "Halliburton", "NOV"] },
  { value: "RIG", label: "Rig", type: "select", options: ["Rig-001", "Rig-002", "Rig-003"] },
  { value: "RPM", label: "RPM", type: "range" },
  { value: "WOB", label: "WOB", type: "range" },
  { value: "ROP", label: "ROP", type: "range" },
  { value: "TEMP", label: "Temperature", type: "range" },
  { value: "DEPTH", label: "Depth", type: "range" },
  { value: "RUN_DATE", label: "Run Date", type: "daterange" },
];

export default function Cohorts() {
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [rules, setRules] = useState<CohortRule[]>([]);
  const [cohortName, setCohortName] = useState("");
  const [savedCohorts] = useState<Cohort[]>([
    {
      id: "1",
      name: "High RPM Operations",
      rules: [
        { field: "RPM", operator: ">", value: "180" },
        { field: "BIT_TYPE", operator: "in", value: ["PDC", "Hybrid"] }
      ],
      size: 1247,
      privacy: "safe"
    },
    {
      id: "2", 
      name: "Deep Well Drilling",
      rules: [
        { field: "DEPTH", operator: ">", value: "15000" },
        { field: "FORMATION", operator: "in", value: ["Shale", "Granite"] }
      ],
      size: 89,
      privacy: "suppressed"
    }
  ]);

  const addRule = () => {
    setRules([...rules, { field: "", operator: "=", value: "" }]);
  };

  const updateRule = (index: number, updates: Partial<CohortRule>) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], ...updates };
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const getFieldConfig = (fieldName: string) => {
    return FIELD_OPTIONS.find(f => f.value === fieldName);
  };

  const renderRuleValue = (rule: CohortRule, index: number) => {
    const fieldConfig = getFieldConfig(rule.field);
    
    if (!fieldConfig) return null;

    if (fieldConfig.type === "select" && fieldConfig.options) {
      return (
        <Select
          value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
          onValueChange={(value) => updateRule(index, { value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {fieldConfig.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (fieldConfig.type === "range") {
      return (
        <Input
          type="number"
          placeholder="Enter value"
          value={rule.value as string}
          onChange={(e) => updateRule(index, { value: e.target.value })}
        />
      );
    }

    return (
      <Input
        placeholder="Enter value"
        value={rule.value as string}
        onChange={(e) => updateRule(index, { value: e.target.value })}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-industrial">Cohort Builder</h1>
        <p className="text-muted-foreground">
          Create and manage drilling bit survival cohorts with federated privacy
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cohort Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Build New Cohort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cohort-name">Cohort Name</Label>
                <Input
                  id="cohort-name"
                  placeholder="Enter cohort name"
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Filter Rules</Label>
                  <Button onClick={addRule} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Rule
                  </Button>
                </div>

                {rules.map((rule, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label>Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(value) => updateRule(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Operator</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateRule(index, { operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">=</SelectItem>
                          <SelectItem value="!=">≠</SelectItem>
                          <SelectItem value=">">&gt;</SelectItem>
                          <SelectItem value="<">&lt;</SelectItem>
                          <SelectItem value=">=">&ge;</SelectItem>
                          <SelectItem value="<=">&le;</SelectItem>
                          <SelectItem value="in">in</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-5">
                      <Label>Value</Label>
                      {renderRuleValue(rule, index)}
                    </div>

                    <div className="col-span-1">
                      <Button
                        onClick={() => removeRule(index)}
                        size="sm"
                        variant="ghost"
                        className="h-10 w-10 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {rules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No rules defined. Click "Add Rule" to start building your cohort.</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Estimated size: ~1,200 runs
                  </Badge>
                  <Badge variant="outline" className="status-operational">
                    <Shield className="h-3 w-3 mr-1" />
                    Privacy safe
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" disabled={!cohortName || rules.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Cohort
                  </Button>
                  <Button disabled={!cohortName || rules.length === 0}>
                    <Play className="h-4 w-4 mr-2" />
                    Apply & Analyze
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Cohorts */}
        <div className="space-y-6">
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Saved Cohorts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedCohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedCohort(cohort)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{cohort.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={cohort.privacy === "safe" ? "status-operational" : "status-warning"}
                    >
                      {cohort.privacy === "safe" ? "Safe" : "Suppressed"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {cohort.rules.length} rules • {cohort.size} runs
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {cohort.rules.slice(0, 2).map((rule, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {FIELD_OPTIONS.find(f => f.value === rule.field)?.label}
                      </Badge>
                    ))}
                    {cohort.rules.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{cohort.rules.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Federated Analysis */}
          <Card className="card-industrial">
            <CardHeader>
              <CardTitle className="text-industrial">Federated Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connected Peers:</span>
                <span className="font-medium">3 active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Privacy Level:</span>
                <Badge className="status-operational">k≥10</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Records:</span>
                <span className="font-medium">~4,500 runs</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}