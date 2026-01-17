import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translations as t } from "@/lib/translations";

const USAGE_DATA = [
  { month: "Jan", tokens: 450 },
  { month: "Fev", tokens: 620 },
  { month: "Mar", tokens: 780 },
  { month: "Abr", tokens: 920 },
  { month: "Mai", tokens: 1100 },
  { month: "Jun", tokens: 1350 },
];

const CREATION_BY_TYPE = [
  { name: "Vision", value: 45, color: "#8b5cf6" },
  { name: "Vídeo", value: 30, color: "#3b82f6" },
  { name: "Upscale", value: 15, color: "#10b981" },
  { name: "TTS", value: 10, color: "#f59e0b" },
];

const MOST_POPULAR = [
  { name: "Mulher em praia tropical", creations: 12, tokens: 600 },
  { name: "Homem em escritório moderno", creations: 8, tokens: 480 },
  { name: "Paisagem montanhosa", creations: 6, tokens: 300 },
];

export default function Analytics() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              {t.analytics.performance}
            </h1>
            <p className="text-slate-400 mt-2">
              Acompanhe seu uso e performance
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            {t.analytics.exportReport}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400">127</div>
              <p className="text-slate-400 text-sm mt-1">Total de Criações</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-400">6,450</div>
              <p className="text-slate-400 text-sm mt-1">Tokens Usados</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-400">3,550</div>
              <p className="text-slate-400 text-sm mt-1">Tokens Restantes</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-400">45%</div>
              <p className="text-slate-400 text-sm mt-1">Uso Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Uso ao Longo do Tempo */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>{t.analytics.usageOverTime}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={USAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Criações por Tipo */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>{t.analytics.creationsByType}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={CREATION_BY_TYPE}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {CREATION_BY_TYPE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Mais Popular */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>{t.analytics.mostPopular}</CardTitle>
            <CardDescription>
              Seus prompts mais usados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOST_POPULAR.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-slate-700">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-400">
                      {item.creations} criações • {item.tokens} tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">{item.creations}</div>
                    <p className="text-xs text-slate-400">usos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Usage por Tipo */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>{t.analytics.tokenUsage}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={CREATION_BY_TYPE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
