import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Share2, Trash2, Edit2, Eye, ThumbsUp, MessageCircle, Share } from 'lucide-react';

interface Campaign {
  id: number;
  productName: string;
  storeName: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  platforms: {
    platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube';
    status: 'published' | 'failed' | 'pending';
    postId: string;
    metrics: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
    };
  }[];
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    productName: 'Kit 3 Calça Jeans Feminina Skinny Elastano Premium',
    storeName: 'Toca da Onça Modas',
    price: 129.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Calça+Jeans',
    createdAt: new Date('2024-01-15'),
    platforms: [
      {
        platform: 'tiktok',
        status: 'published',
        postId: 'tiktok_123',
        metrics: { views: 15420, likes: 1250, comments: 89, shares: 342 },
      },
      {
        platform: 'instagram',
        status: 'published',
        postId: 'instagram_123',
        metrics: { views: 8920, likes: 890, comments: 45, shares: 120 },
      },
      {
        platform: 'facebook',
        status: 'published',
        postId: 'facebook_123',
        metrics: { views: 5430, likes: 320, comments: 28, shares: 95 },
      },
      {
        platform: 'youtube',
        status: 'pending',
        postId: 'youtube_123',
        metrics: { views: 0, likes: 0, comments: 0, shares: 0 },
      },
    ],
  },
  {
    id: 2,
    productName: 'Blusa Feminina Estampada Algodão Premium',
    storeName: 'Toca da Onça Modas',
    price: 79.99,
    imageUrl: 'https://via.placeholder.com/300x200?text=Blusa',
    createdAt: new Date('2024-01-10'),
    platforms: [
      {
        platform: 'tiktok',
        status: 'published',
        postId: 'tiktok_456',
        metrics: { views: 22100, likes: 1890, comments: 156, shares: 512 },
      },
      {
        platform: 'instagram',
        status: 'published',
        postId: 'instagram_456',
        metrics: { views: 12340, likes: 1200, comments: 78, shares: 234 },
      },
    ],
  },
];

export default function CampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(mockCampaigns[0]);
  const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'failed'>('all');

  const totalViews = selectedCampaign
    ? selectedCampaign.platforms.reduce((sum, p) => sum + p.metrics.views, 0)
    : 0;

  const totalLikes = selectedCampaign
    ? selectedCampaign.platforms.reduce((sum, p) => sum + p.metrics.likes, 0)
    : 0;

  const totalComments = selectedCampaign
    ? selectedCampaign.platforms.reduce((sum, p) => sum + p.metrics.comments, 0)
    : 0;

  const totalShares = selectedCampaign
    ? selectedCampaign.platforms.reduce((sum, p) => sum + p.metrics.shares, 0)
    : 0;

  const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews * 100).toFixed(2) : '0';

  const platformData = selectedCampaign
    ? selectedCampaign.platforms.map((p) => ({
        name: p.platform.toUpperCase(),
        views: p.metrics.views,
        likes: p.metrics.likes,
        comments: p.metrics.comments,
        shares: p.metrics.shares,
      }))
    : [];

  const engagementData = selectedCampaign
    ? [
        { name: 'Likes', value: totalLikes, color: '#ef4444' },
        { name: 'Comments', value: totalComments, color: '#3b82f6' },
        { name: 'Shares', value: totalShares, color: '#10b981' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            📊 Dashboard de Campanhas
          </h1>
          <p className="text-gray-300 text-lg">
            Acompanhe o desempenho de seus comerciais em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Estatísticas Principais */}
          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Visualizações</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="text-red-400" size={32} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-800/10 border-pink-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-300 text-sm font-medium">Curtidas</p>
                <p className="text-3xl font-bold text-pink-400 mt-2">{totalLikes.toLocaleString()}</p>
              </div>
              <ThumbsUp className="text-pink-400" size={32} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Comentários</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{totalComments.toLocaleString()}</p>
              </div>
              <MessageCircle className="text-blue-400" size={32} />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Taxa de Engajamento</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{engagementRate}%</p>
              </div>
              <Share className="text-green-400" size={32} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Campanhas */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-purple-500/30 p-6">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">📋 Campanhas</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedCampaign?.id === campaign.id
                        ? 'bg-purple-600/50 border border-purple-400'
                        : 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    <p className="font-semibold text-white text-sm">{campaign.productName}</p>
                    <p className="text-xs text-slate-400 mt-1">{campaign.storeName}</p>
                    <p className="text-xs text-green-400 mt-1">R$ {campaign.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Detalhes da Campanha */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCampaign && (
              <>
                {/* Informações do Produto */}
                <Card className="bg-slate-800/50 border-purple-500/30 p-6">
                  <div className="flex gap-4">
                    <img
                      src={selectedCampaign.imageUrl}
                      alt={selectedCampaign.productName}
                      className="w-24 h-24 object-cover rounded border border-purple-500/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Produto';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{selectedCampaign.productName}</h3>
                      <p className="text-slate-400 text-sm">{selectedCampaign.storeName}</p>
                      <p className="text-green-400 font-bold mt-2">R$ {selectedCampaign.price.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Criada em {selectedCampaign.createdAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Gráfico de Engajamento por Plataforma */}
                <Card className="bg-slate-800/50 border-purple-500/30 p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">📈 Engajamento por Plataforma</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                      <Legend />
                      <Bar dataKey="views" fill="#ef4444" />
                      <Bar dataKey="likes" fill="#f97316" />
                      <Bar dataKey="comments" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                {/* Status de Publicação */}
                <Card className="bg-slate-800/50 border-purple-500/30 p-6">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">🌐 Status de Publicação</h3>
                  <div className="space-y-2">
                    {selectedCampaign.platforms.map((platform) => (
                      <div key={platform.platform} className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
                        <div>
                          <p className="font-semibold text-white">{platform.platform.toUpperCase()}</p>
                          <p className="text-xs text-slate-400">
                            {platform.metrics.views} views • {platform.metrics.likes} likes
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            platform.status === 'published'
                              ? 'bg-green-900/50 text-green-400'
                              : platform.status === 'pending'
                                ? 'bg-yellow-900/50 text-yellow-400'
                                : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {platform.status === 'published'
                            ? '✓ Publicado'
                            : platform.status === 'pending'
                              ? '⏳ Pendente'
                              : '✗ Falhou'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Ações */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Republicar
                  </Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
