import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Link2, Sparkles, Download, Share2, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function CommercialAgent() {
  const [productUrl, setProductUrl] = useState('https://www.tocadaoncamodas.com.br/produto/a443a118-8094-4827-ac6f-a394eda92caa');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedCommercials, setGeneratedCommercials] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok', 'instagram', 'facebook']);
  const [includeVideo, setIncludeVideo] = useState(false);

  const scrapeMutation = trpc.commercial.scrapeProduct.useMutation();
  const generateAllMutation = trpc.commercial.generateAllCommercials.useMutation();

  const platforms = [
    { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-black to-cyan-600' },
    { id: 'instagram', label: 'Instagram', icon: '📸', color: 'from-purple-600 to-pink-600' },
    { id: 'facebook', label: 'Facebook', icon: '👍', color: 'from-blue-600 to-blue-800' },
    { id: 'whatsapp', label: 'WhatsApp Status', icon: '💬', color: 'from-green-600 to-green-800' },
    { id: 'youtube', label: 'YouTube', icon: '▶️', color: 'from-red-600 to-red-800' },
  ];

  const handleScrapeProduct = async () => {
    if (!productUrl.trim()) {
      setError('Por favor, insira uma URL de produto válida');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await scrapeMutation.mutateAsync({ url: productUrl });
      
      if (result.success) {
        setProductData(result.data);
        setSuccess('✅ Dados do produto extraídos com sucesso!');
      } else {
        setError(`❌ Erro: ${result.error}`);
      }
    } catch (err) {
      setError('❌ Erro ao extrair dados do produto. Verifique a URL e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCommercials = async () => {
    if (!productData) {
      setError('Por favor, extraia os dados do produto primeiro');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError('Por favor, selecione pelo menos uma rede social');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await generateAllMutation.mutateAsync({
        productUrl,
        platforms: selectedPlatforms as any,
        includeVideo,
      });

      if (result.success && result.data) {
        setGeneratedCommercials(result.data.commercials);
        setSuccess(`✅ ${result.data.commercials.length} comerciais gerados com sucesso! Tokens usados: ${result.data.totalTokensUsed}`);
      } else {
        setError(`❌ Erro: ${result.error}`);
      }
    } catch (err) {
      setError('❌ Erro ao gerar comerciais. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            🎬 Agente de Comerciais Automáticos
          </h1>
          <p className="text-gray-300 text-lg">
            Crie comerciais profissionais automaticamente a partir de qualquer link de produto
          </p>
        </div>

        {/* Mensagens de Status */}
        {error && (
          <Card className="bg-red-900/20 border-red-500/50 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />
            <p className="text-red-300">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="bg-green-900/20 border-green-500/50 p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
            <p className="text-green-300">{success}</p>
          </Card>
        )}

        {/* Input Section */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Link2 className="inline mr-2 w-4 h-4" />
                URL do Produto
              </label>
              <Input
                type="url"
                placeholder="https://www.tocadaoncamodas.com.br/produto/..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleScrapeProduct()}
                className="bg-slate-700/50 border-purple-500/30 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleScrapeProduct}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analisar Produto
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Dados do Produto */}
        {productData && (
          <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">📦 Dados do Produto Extraídos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-slate-400 text-sm">Nome do Produto</p>
                <p className="text-white font-semibold">{productData.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Loja</p>
                <p className="text-white font-semibold">{productData.storeName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Preço</p>
                <p className="text-green-400 font-bold">
                  {productData.currency} {productData.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Descrição</p>
                <p className="text-white text-sm">{productData.description}</p>
              </div>
            </div>

            {/* Imagens do Produto */}
            {productData.images && productData.images.length > 0 && (
              <div>
                <p className="text-slate-400 text-sm mb-2">Imagens do Produto</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {productData.images.slice(0, 5).map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Produto ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border border-purple-500/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Imagem';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Seleção de Plataformas */}
        {productData && (
          <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">📱 Selecione as Redes Sociais</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {platforms.map((platform) => (
                <label
                  key={platform.id}
                  className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-gradient-to-r ' + platform.color + ' border border-white/30'
                      : 'bg-slate-700/50 hover:bg-slate-700 border border-slate-600'
                  }`}
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                  <span className="text-sm font-medium text-white">
                    {platform.icon} {platform.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Opção de Vídeo */}
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-slate-700/50 border border-slate-600 w-fit">
              <Checkbox
                checked={includeVideo}
                onCheckedChange={(checked) => setIncludeVideo(checked as boolean)}
              />
              <span className="text-sm font-medium text-white">
                🎥 Incluir Vídeos (200 tokens cada)
              </span>
            </div>
          </Card>
        )}

        {/* Botão de Geração */}
        {productData && (
          <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
            <Button
              onClick={handleGenerateCommercials}
              disabled={loading || selectedPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Comerciais...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Comerciais para {selectedPlatforms.length} Plataforma{selectedPlatforms.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Comerciais Gerados */}
        {generatedCommercials.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">✨ Comerciais Gerados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedCommercials.map((commercial, idx) => (
                <Card key={idx} className="bg-slate-800/50 border-purple-500/30 p-4 hover:border-purple-500/60 transition">
                  <div className="mb-3">
                    <p className="text-sm text-slate-400">
                      {commercial.platform.toUpperCase()} • {commercial.type.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {commercial.dimensions.width}x{commercial.dimensions.height}px
                    </p>
                  </div>

                  {commercial.imageUrl && (
                    <img
                      src={commercial.imageUrl}
                      alt={`${commercial.platform} ${commercial.type}`}
                      className="w-full h-48 object-cover rounded mb-3 border border-purple-500/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Erro+ao+carregar';
                      }}
                    />
                  )}

                  <p className="text-xs text-slate-300 mb-3 line-clamp-3">{commercial.script}</p>

                  <div className="flex gap-2">
                    {commercial.imageUrl && (
                      <Button
                        onClick={() => window.open(commercial.imageUrl, '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(commercial.imageUrl || '');
                        alert('URL copiada!');
                      }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs py-1"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
