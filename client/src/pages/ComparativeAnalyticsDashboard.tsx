import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

export default function ComparativeAnalyticsDashboard() {
  const [periodo, setPeriodo] = useState("7dias");
  const [plataformaFiltro, setPlataformaFiltro] = useState("todas");

  // Dados simulados de comparação entre plataformas
  const dadosComparacao = [
    {
      data: "01/01",
      tiktok: 4500,
      instagram: 3200,
      facebook: 2100,
      youtube: 1800,
    },
    {
      data: "02/01",
      tiktok: 5200,
      instagram: 3800,
      facebook: 2400,
      youtube: 2100,
    },
    {
      data: "03/01",
      tiktok: 4800,
      instagram: 4100,
      facebook: 2800,
      youtube: 2500,
    },
    {
      data: "04/01",
      tiktok: 6100,
      instagram: 4500,
      facebook: 3200,
      youtube: 2800,
    },
    {
      data: "05/01",
      tiktok: 5900,
      instagram: 4800,
      facebook: 3500,
      youtube: 3100,
    },
  ];

  const dadosEngajamento = [
    { plataforma: "TikTok", engajamento: 8.5, alcance: 125000 },
    { plataforma: "Instagram", engajamento: 6.2, alcance: 98000 },
    { plataforma: "Facebook", engajamento: 4.1, alcance: 72000 },
    { plataforma: "YouTube", engajamento: 5.8, alcance: 85000 },
  ];

  const dadosHorarioOtimo = [
    { hora: "08:00", engajamento: 2.1 },
    { hora: "10:00", engajamento: 3.5 },
    { hora: "12:00", engajamento: 4.2 },
    { hora: "14:00", engajamento: 3.8 },
    { hora: "16:00", engajamento: 5.1 },
    { hora: "18:00", engajamento: 6.8 },
    { hora: "20:00", engajamento: 7.5 },
    { hora: "22:00", engajamento: 5.2 },
  ];

  const distribuicaoPlataformas = [
    { name: "TikTok", value: 35, color: "#000000" },
    { name: "Instagram", value: 28, color: "#E4405F" },
    { name: "YouTube", value: 22, color: "#FF0000" },
    { name: "Facebook", value: 15, color: "#1877F2" },
  ];

  const recomendacoes = [
    {
      titulo: "TikTok é sua melhor plataforma",
      descricao:
        "Com 8.5% de taxa de engajamento, TikTok está gerando 35% do seu tráfego total",
      acao: "Aumentar frequência de publicação",
    },
    {
      titulo: "Otimizar horário de publicação",
      descricao:
        "Melhor horário: 20:00 com 7.5% de engajamento. Publique neste horário",
      acao: "Agendar publicações",
    },
    {
      titulo: "Instagram precisa de atenção",
      descricao:
        "Taxa de engajamento caiu 12% na última semana. Considere novo tipo de conteúdo",
      acao: "Analisar conteúdo",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Análise Comparativa de Plataformas
          </h1>
          <p className="text-slate-400">
            Compare performance entre TikTok, Instagram, Facebook e YouTube
          </p>
        </div>

        {/* Controles */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="90dias">Últimos 90 dias</option>
          </select>

          <select
            value={plataformaFiltro}
            onChange={(e) => setPlataformaFiltro(e.target.value)}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
          >
            <option value="todas">Todas as plataformas</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>

          <Button className="ml-auto bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Gráfico de Comparação */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Visualizações por Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosComparacao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="data" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tiktok"
                  stroke="#000000"
                  strokeWidth={2}
                  name="TikTok"
                />
                <Line
                  type="monotone"
                  dataKey="instagram"
                  stroke="#E4405F"
                  strokeWidth={2}
                  name="Instagram"
                />
                <Line
                  type="monotone"
                  dataKey="facebook"
                  stroke="#1877F2"
                  strokeWidth={2}
                  name="Facebook"
                />
                <Line
                  type="monotone"
                  dataKey="youtube"
                  stroke="#FF0000"
                  strokeWidth={2}
                  name="YouTube"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráficos em Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Taxa de Engajamento */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Taxa de Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dadosEngajamento}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="plataforma" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Bar dataKey="engajamento" fill="#3b82f6" name="Engajamento %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Tráfego */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Tráfego</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distribuicaoPlataformas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribuicaoPlataformas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Horário Ótimo de Publicação */}
        <Card className="mb-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Melhor Horário de Publicação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dadosHorarioOtimo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="hora" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="engajamento" fill="#10b981" name="Engajamento %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            💡 Recomendações de Otimização
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recomendacoes.map((rec, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">
                    {rec.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">{rec.descricao}</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {rec.acao}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabela de Comparação Detalhada */}
        <Card className="mt-8 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Comparação Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                      Métrica
                    </th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">
                      TikTok
                    </th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">
                      Instagram
                    </th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">
                      Facebook
                    </th>
                    <th className="text-center py-3 px-4 text-slate-300 font-semibold">
                      YouTube
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-slate-300">Visualizações</td>
                    <td className="text-center text-white">125.000</td>
                    <td className="text-center text-white">98.000</td>
                    <td className="text-center text-white">72.000</td>
                    <td className="text-center text-white">85.000</td>
                  </tr>
                  <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-slate-300">Engajamento %</td>
                    <td className="text-center text-green-400 flex items-center justify-center">
                      8.5% <TrendingUp className="w-4 h-4 ml-2" />
                    </td>
                    <td className="text-center text-white">6.2%</td>
                    <td className="text-center text-red-400 flex items-center justify-center">
                      4.1% <TrendingDown className="w-4 h-4 ml-2" />
                    </td>
                    <td className="text-center text-white">5.8%</td>
                  </tr>
                  <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-slate-300">Conversões</td>
                    <td className="text-center text-white">1.250</td>
                    <td className="text-center text-white">892</td>
                    <td className="text-center text-white">456</td>
                    <td className="text-center text-white">678</td>
                  </tr>
                  <tr className="hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-slate-300">Crescimento</td>
                    <td className="text-center text-green-400">+15%</td>
                    <td className="text-center text-green-400">+8%</td>
                    <td className="text-center text-red-400">-5%</td>
                    <td className="text-center text-green-400">+12%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
