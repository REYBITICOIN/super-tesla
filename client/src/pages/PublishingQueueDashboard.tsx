import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
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
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";

interface QueueJob {
  id: string;
  type: "facebook" | "instagram" | "tiktok" | "youtube";
  status: "pending" | "processing" | "success" | "failed";
  priority: number;
  data: {
    commercialId: string;
    narrative: string;
    imageUrl: string;
    videoUrl?: string;
    platform: string;
  };
  retries: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  error?: string;
}

interface QueueStats {
  total: number;
  pending: number;
  processing: number;
  success: number;
  failed: number;
  avgRetries: number;
  queueLength: number;
  processingCount: number;
}

export default function PublishingQueueDashboard() {
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [filter, setFilter] = useState<QueueJob["status"] | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Atualizar a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const loadQueueData = async () => {
    try {
      // Simulando dados - em produção, isso viria de uma API tRPC
      const mockJobs: QueueJob[] = [
        {
          id: "job-1",
          type: "facebook",
          status: "processing",
          priority: 8,
          data: {
            commercialId: "1",
            narrative: "Confira nossa nova coleção de roupas!",
            imageUrl: "https://via.placeholder.com/300",
            platform: "facebook",
          },
          retries: 0,
          maxRetries: 3,
          createdAt: new Date(Date.now() - 60000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "job-2",
          type: "instagram",
          status: "pending",
          priority: 7,
          data: {
            commercialId: "2",
            narrative: "Novo Reel: Dicas de estilo!",
            imageUrl: "https://via.placeholder.com/300",
            videoUrl: "https://via.placeholder.com/video.mp4",
            platform: "instagram",
          },
          retries: 1,
          maxRetries: 3,
          createdAt: new Date(Date.now() - 120000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "job-3",
          type: "tiktok",
          status: "success",
          priority: 5,
          data: {
            commercialId: "3",
            narrative: "Tendência viral: Desafio de moda",
            imageUrl: "https://via.placeholder.com/300",
            videoUrl: "https://via.placeholder.com/video.mp4",
            platform: "tiktok",
          },
          retries: 0,
          maxRetries: 3,
          createdAt: new Date(Date.now() - 300000).toISOString(),
          updatedAt: new Date(Date.now() - 60000).toISOString(),
          processedAt: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: "job-4",
          type: "youtube",
          status: "failed",
          priority: 3,
          data: {
            commercialId: "4",
            narrative: "Vídeo completo: Coleção Verão 2026",
            imageUrl: "https://via.placeholder.com/300",
            videoUrl: "https://via.placeholder.com/video.mp4",
            platform: "youtube",
          },
          retries: 3,
          maxRetries: 3,
          createdAt: new Date(Date.now() - 600000).toISOString(),
          updatedAt: new Date(Date.now() - 120000).toISOString(),
          error: "Erro ao conectar com YouTube API",
        },
      ];

      const mockStats: QueueStats = {
        total: mockJobs.length,
        pending: mockJobs.filter((j) => j.status === "pending").length,
        processing: mockJobs.filter((j) => j.status === "processing").length,
        success: mockJobs.filter((j) => j.status === "success").length,
        failed: mockJobs.filter((j) => j.status === "failed").length,
        avgRetries:
          mockJobs.reduce((sum, j) => sum + j.retries, 0) / mockJobs.length,
        queueLength: mockJobs.filter((j) => j.status === "pending").length,
        processingCount: mockJobs.filter((j) => j.status === "processing")
          .length,
      };

      setJobs(mockJobs);
      setStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar fila:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: QueueJob["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: QueueJob["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

  const chartData = [
    { name: "Pendente", value: stats?.pending || 0 },
    { name: "Processando", value: stats?.processing || 0 },
    { name: "Sucesso", value: stats?.success || 0 },
    { name: "Falha", value: stats?.failed || 0 },
  ];

  const COLORS = ["#FBBF24", "#3B82F6", "#10B981", "#EF4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Fila de Publicação
          </h1>
          <p className="text-slate-400">
            Gerencie e monitore todos os jobs de publicação automática
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total de Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">
                  {stats.pending}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Processando
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {stats.processingCount}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {stats.total > 0
                    ? Math.round((stats.success / stats.total) * 100)
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Status da Fila</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição por Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1E293B",
                      border: "1px solid #475569",
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "processing", "success", "failed"] as const).map(
            (status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status === "all" ? "Todos" : status}
              </Button>
            )
          )}
        </div>

        {/* Jobs Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              Jobs ({filteredJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400">ID</th>
                    <th className="text-left py-3 px-4 text-slate-400">
                      Plataforma
                    </th>
                    <th className="text-left py-3 px-4 text-slate-400">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400">
                      Prioridade
                    </th>
                    <th className="text-left py-3 px-4 text-slate-400">
                      Tentativas
                    </th>
                    <th className="text-left py-3 px-4 text-slate-400">
                      Criado em
                    </th>
                    <th className="text-left py-3 px-4 text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b border-slate-700">
                      <td className="py-3 px-4 text-white font-mono text-xs">
                        {job.id.substring(0, 12)}...
                      </td>
                      <td className="py-3 px-4 text-white capitalize">
                        {job.type}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(job.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white">{job.priority}/10</td>
                      <td className="py-3 px-4 text-white">
                        {job.retries}/{job.maxRetries}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(job.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {job.status === "processing" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                          {job.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          {job.status === "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
