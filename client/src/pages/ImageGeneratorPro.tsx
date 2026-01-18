import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Zap, Settings2, Download } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

export default function ImageGeneratorPro() {
  const { user, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('Uma mulher bonita em um vestido vermelho em um cenário de inverno');
  const [provider, setProvider] = useState<'pollinations' | 'replicate' | 'manus'>('pollinations');
  const [style, setStyle] = useState('photorealistic');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; provider: string; prompt: string; timestamp: Date }>>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Por favor, insira um prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';

      if (provider === 'pollinations') {
        // Pollinations.ai com estilo
        const styleMap: Record<string, string> = {
          photorealistic: 'flux',
          anime: 'flux-anime',
          realistic: 'flux-realism',
          professional: 'flux-pro',
        };
        const model = styleMap[style] || 'flux';
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}&nologo=true`;
      } else if (provider === 'replicate') {
        setError('Replicate requer um token de API. Configure em Configurações.');
        setLoading(false);
        return;
      } else {
        setError('Manus requer configuração. Use Pollinations.ai para começar.');
        setLoading(false);
        return;
      }

      if (imageUrl) {
        setGeneratedImages((prev) => [
          {
            url: imageUrl,
            provider,
            prompt,
            timestamp: new Date(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar imagem');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Gerador de Imagens Pro</h1>
          <p className="text-muted-foreground">Faça login para usar o gerador de imagens com IAs gratuitas.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            ✨ Gerador de Imagens Pro
          </h1>
          <p className="text-muted-foreground text-lg">Crie imagens incríveis com múltiplos provedores de IA gratuitos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Painel de Controle */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Prompt Card */}
              <Card className="p-6 bg-background/50 backdrop-blur border-blue-500/20">
                <label className="block text-sm font-bold mb-3 text-blue-400">Descrição da Imagem</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva em detalhes a imagem que deseja gerar..."
                  className="w-full h-32 p-3 border border-blue-500/30 rounded-lg bg-background/80 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Dica: Seja específico! Inclua estilo, iluminação, composição.
                </p>
              </Card>

              {/* Provider Selection */}
              <Card className="p-6 bg-background/50 backdrop-blur border-blue-500/20">
                <label className="block text-sm font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Provedor de IA
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-blue-500/20 hover:bg-blue-500/5 cursor-pointer transition">
                    <input
                      type="radio"
                      name="provider"
                      value="pollinations"
                      checked={provider === 'pollinations'}
                      onChange={() => setProvider('pollinations')}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-sm">🎨 Pollinations.ai</p>
                      <p className="text-xs text-muted-foreground">Gratuito, sem autenticação</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 rounded-lg border border-blue-500/20 hover:bg-blue-500/5 cursor-pointer transition opacity-50">
                    <input
                      type="radio"
                      name="provider"
                      value="replicate"
                      checked={provider === 'replicate'}
                      onChange={() => setProvider('replicate')}
                      className="w-4 h-4"
                      disabled
                    />
                    <div>
                      <p className="font-medium text-sm">⚡ Replicate Flux</p>
                      <p className="text-xs text-muted-foreground">Requer token</p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Style Selection */}
              <Card className="p-6 bg-background/50 backdrop-blur border-blue-500/20">
                <label className="block text-sm font-bold mb-3 text-blue-400 flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Estilo
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-2 border border-blue-500/30 rounded-lg bg-background/80 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="photorealistic">📸 Fotorrealista</option>
                  <option value="anime">🎨 Anime</option>
                  <option value="realistic">🖼️ Realista</option>
                  <option value="professional">💼 Profissional</option>
                </select>
              </Card>

              {/* Dimensions */}
              <Card className="p-6 bg-background/50 backdrop-blur border-blue-500/20">
                <label className="block text-sm font-bold mb-3 text-blue-400">Dimensões</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Largura: {width}px</label>
                    <input
                      type="range"
                      min="512"
                      max="2048"
                      step="256"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Altura: {height}px</label>
                    <input
                      type="range"
                      min="512"
                      max="2048"
                      step="256"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>

              {/* Error Message */}
              {error && (
                <Card className="p-4 bg-red-500/10 border-red-500/20">
                  <p className="text-xs text-red-500">{error}</p>
                </Card>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateImage}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar Imagem
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Galeria de Imagens */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-background/50 backdrop-blur border-blue-500/20 min-h-96">
              <h2 className="text-2xl font-bold mb-6 text-blue-400">
                Imagens Geradas ({generatedImages.length})
              </h2>

              {generatedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg font-medium">Nenhuma imagem gerada ainda</p>
                  <p className="text-sm">Use o painel à esquerda para criar suas primeiras imagens</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {generatedImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative border border-blue-500/20 rounded-lg overflow-hidden bg-background hover:border-blue-500/50 transition"
                    >
                      <img
                        src={img.url}
                        alt={`Generated ${idx}`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%23999%22%3EErro ao carregar%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4">
                        <p className="text-white text-sm font-medium mb-2 line-clamp-2">{img.prompt}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = img.url;
                              a.download = `image-${idx}.png`;
                              a.click();
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                        {img.provider}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <h3 className="font-bold text-blue-400 mb-2">🎨 Pollinations.ai</h3>
            <p className="text-sm text-muted-foreground">
              API gratuita sem autenticação. Suporta Flux e outros modelos. Rápido e confiável.
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <h3 className="font-bold text-purple-400 mb-2">⚡ Replicate</h3>
            <p className="text-sm text-muted-foreground">
              Tier gratuito disponível. Suporta Flux Dev e Pro. Configure seu token em Configurações.
            </p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <h3 className="font-bold text-green-400 mb-2">🚀 Manus</h3>
            <p className="text-sm text-muted-foreground">
              API padrão do Manus. Integração nativa com S3 e banco de dados.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
