import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Zap, Clock } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

// Mock data
const tokenUsageData = [
  { date: '01 Jan', tokens: 150 },
  { date: '02 Jan', tokens: 200 },
  { date: '03 Jan', tokens: 180 },
  { date: '04 Jan', tokens: 250 },
  { date: '05 Jan', tokens: 220 },
  { date: '06 Jan', tokens: 300 },
  { date: '07 Jan', tokens: 280 },
];

const toolUsageData = [
  { name: 'Vision 2.0', value: 450, color: '#3b82f6' },
  { name: 'Video Pro', value: 380, color: '#8b5cf6' },
  { name: 'Upscale', value: 220, color: '#ec4899' },
  { name: 'TTS', value: 150, color: '#06b6d4' },
  { name: 'Outros', value: 100, color: '#f59e0b' },
];

const creationsData = [
  { date: '01 Jan', imagens: 12, videos: 3, audios: 5 },
  { date: '02 Jan', imagens: 15, videos: 4, audios: 6 },
  { date: '03 Jan', imagens: 10, videos: 2, audios: 4 },
  { date: '04 Jan', imagens: 18, videos: 5, audios: 7 },
  { date: '05 Jan', imagens: 14, videos: 3, audios: 5 },
  { date: '06 Jan', imagens: 20, videos: 6, audios: 8 },
  { date: '07 Jan', imagens: 16, videos: 4, audios: 6 },
];

const stats = [
  {
    label: 'Tokens Usados',
    value: '1.480',
    change: '+12%',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    label: 'Criações Totais',
    value: '87',
    change: '+8%',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
  },
  {
    label: 'Tempo Médio',
    value: '2.3s',
    change: '-15%',
    icon: Clock,
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function AnalyticsDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-muted-foreground">Faça login para ver suas estatísticas.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              📊 Analytics Pro
            </h1>
            <p className="text-muted-foreground">Acompanhe seu uso de tokens e criações</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? 'default' : 'outline'}
              className={timeRange === range ? 'bg-purple-600' : ''}
            >
              {range === '7d' ? '7 Dias' : range === '30d' ? '30 Dias' : range === '90d' ? '90 Dias' : 'Tudo'}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="p-6 bg-background/50 backdrop-blur border-purple-500/20 hover:border-purple-500/40 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-400 mt-2">{stat.change} vs semana anterior</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Token Usage Over Time */}
          <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20">
            <h2 className="text-xl font-bold mb-6 text-purple-400">📈 Uso de Tokens</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tokenUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Tool Usage Distribution */}
          <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20">
            <h2 className="text-xl font-bold mb-6 text-purple-400">🎯 Uso por Ferramenta</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={toolUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {toolUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Creations Over Time */}
          <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20 lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 text-purple-400">🎬 Criações por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="imagens" stackId="a" fill="#3b82f6" />
                <Bar dataKey="videos" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="audios" stackId="a" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Creations */}
        <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20">
          <h2 className="text-xl font-bold mb-6 text-purple-400">⭐ Criações Mais Populares</h2>
          <div className="space-y-4">
            {[
              { name: 'Paisagem Futurista', views: 1240, type: 'Imagem', date: '05 Jan' },
              { name: 'Vídeo Produto', views: 856, type: 'Vídeo', date: '04 Jan' },
              { name: 'Narração IA', views: 623, type: 'Áudio', date: '03 Jan' },
              { name: 'Retrato Premium', views: 512, type: 'Imagem', date: '02 Jan' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-purple-500/5 rounded-lg border border-purple-500/10 hover:border-purple-500/20 transition">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.type} • {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cyan-400">{item.views}</p>
                  <p className="text-xs text-muted-foreground">visualizações</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
