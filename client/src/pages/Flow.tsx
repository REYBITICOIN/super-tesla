import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Flow() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<any[]>([]);

  if (!user) return null;

  const handleAddNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: "action",
      label: "New Step",
      x: Math.random() * 400,
      y: Math.random() * 400,
    };
    setNodes([...nodes, newNode]);
    toast.success("Step added");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-purple-400" />
            Flow Builder
          </h1>
          <p className="text-slate-400 mt-2">Create complex workflows by connecting AI operations</p>
        </div>

        {/* Toolbar */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 flex gap-2 flex-wrap">
            <Button onClick={handleAddNode} variant="outline" size="sm">
              + Add Step
            </Button>
            <Button variant="outline" size="sm">
              + Add Condition
            </Button>
            <Button variant="outline" size="sm">
              + Add Loop
            </Button>
            <Button size="sm">Save Flow</Button>
            <Button size="sm" variant="default">
              Run Flow
            </Button>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="bg-slate-800 border-slate-700 h-96">
          <CardContent className="p-0 h-full relative overflow-hidden bg-slate-700/50">
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Nodes */}
            <div className="absolute inset-0">
              {nodes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Click "Add Step" to start building your workflow</p>
                  </div>
                </div>
              ) : (
                nodes.map((node) => (
                  <div
                    key={node.id}
                    className="absolute bg-purple-600 rounded-lg px-4 py-2 cursor-move hover:bg-purple-700 transition"
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                    }}
                  >
                    <p className="text-sm font-semibold">{node.label}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Flow Builder Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Drag-and-drop workflow builder</p>
            <p>• Connect multiple AI operations</p>
            <p>• Conditional branching</p>
            <p>• Loop and iteration support</p>
            <p>• Save and reuse workflows</p>
            <p>• Real-time execution monitoring</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
