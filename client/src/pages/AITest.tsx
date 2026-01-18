import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Zap } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

export default function AITest() {
  const { user, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('Uma mulher bonita em um vestido vermelho em um cenário de inverno');
  const [provider, setProvider] = useState<'pollinations' | 'replicate'>('pollinations');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; provider: string; timestamp: Date }>>([]);
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
        // Pollinations.ai - Direct URL generation (no API call needed)
        imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true`;
      } else if (provider === 'replicate') {
        // Replicate - Would need API token
        setError('Replicate requer um token de API. Você pode obter um em https://replicate.com');
        setLoading(false);
        return;
      }

      if (imageUrl) {
        setGeneratedImages((prev) => [
          ...prev,
          { url: imageUrl, provider, timestamp: new Date() },
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
          <h1 className="text-2xl font-bold mb-4">Teste de IAs Gratuitas</h1>
          <p className="text-muted-foreground">Faça login para testar a geração de imagens com IAs gratuitas.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 Teste de IAs Gratuitas</h1>
          <p className="text-muted-foreground">Teste a geração de imagens com Pollinations.ai e Replicate</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Painel de Controle */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Configurações</h2>

              <div className="space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva a imagem que deseja gerar..."
                    className="w-full h-24 p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Provedor</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="provider"
                        value="pollinations"
                        checked={provider === 'pollinations'}
                        onChange={() => setProvider('pollinations')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">🎨 Pollinations.ai (Gratuito)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="provider"
                        value="replicate"
                        checked={provider === 'replicate'}
                        onChange={() => setProvider('replicate')}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">⚡ Replicate Flux (Requer Token)</span>
                    </label>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Usuário:</strong> {user?.name || 'Anônimo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Provedor Selecionado:</strong> {provider === 'pollinations' ? 'Pollinations.ai' : 'Replicate'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-500">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateImage}
                  disabled={loading}
                  className="w-full"
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
            </Card>
          </div>

          {/* Galeria de Imagens */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Imagens Geradas ({generatedImages.length})</h2>

              {generatedImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                  <p>Nenhuma imagem gerada ainda</p>
                  <p className="text-sm">Use o painel à esquerda para gerar imagens</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="border border-border rounded-lg overflow-hidden bg-muted">
                      <img
                        src={img.url}
                        alt={`Generated ${idx}`}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2220%22 fill=%22%23999%22%3EErro ao carregar imagem%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="p-3 bg-background">
                        <p className="text-xs text-muted-foreground">
                          <strong>Provedor:</strong> {img.provider}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Horário:</strong> {img.timestamp.toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-bold mb-2">🎨 Pollinations.ai</h3>
            <p className="text-sm text-muted-foreground mb-3">
              API gratuita sem autenticação. Suporta Flux e outros modelos. Rápido e confiável.
            </p>
            <a
              href="https://pollinations.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Saiba mais →
            </a>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold mb-2">⚡ Replicate</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Tier gratuito disponível. Suporta Flux Dev e Pro. Requer token gratuito.
            </p>
            <a
              href="https://replicate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Obter token gratuito →
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
