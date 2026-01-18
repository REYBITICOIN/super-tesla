import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Download, Share2 } from 'lucide-react';

interface ProductData {
  name: string;
  storeName: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
  logo: string;
}

interface CommercialAd {
  platform: 'tiktok' | 'whatsapp' | 'facebook' | 'instagram' | 'youtube';
  type: 'image' | 'video';
  dimensions: { width: number; height: number };
  aspectRatio: string;
  script: string;
}

export default function CommercialGenerator() {
  const [productData] = useState<ProductData>({
    name: 'Kit 3 Calça Jeans Feminina Skinny Elastano Premium',
    storeName: 'Toca da Onça Modas',
    price: 129.99,
    currency: 'BRL',
    description: 'Calça jeans de alta qualidade com elastano premium',
    images: [],
    logo: '',
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<
    ('tiktok' | 'whatsapp' | 'facebook' | 'instagram' | 'youtube')[]
  >(['tiktok', 'instagram', 'facebook']);

  const [includeVideo, setIncludeVideo] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [commercials, setCommercials] = useState<CommercialAd[]>([]);

  const platforms = [
    { id: 'tiktok', label: 'TikTok', icon: '🎵' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'facebook', label: 'Facebook', icon: '👍' },
    { id: 'whatsapp', label: 'WhatsApp Status', icon: '💬' },
    { id: 'youtube', label: 'YouTube', icon: '▶️' },
  ];

  const handleGenerateCommercials = async () => {
    setIsGenerating(true);

    // Simular geração de comerciais
    const generatedAds: CommercialAd[] = [];

    for (const platform of selectedPlatforms) {
      // Anúncio em imagem
      generatedAds.push({
        platform: platform as any,
        type: 'image',
        dimensions:
          platform === 'tiktok' || platform === 'instagram' || platform === 'whatsapp'
            ? { width: 1080, height: 1920 }
            : platform === 'facebook'
              ? { width: 1200, height: 628 }
              : { width: 1280, height: 720 },
        aspectRatio:
          platform === 'tiktok' || platform === 'instagram' || platform === 'whatsapp'
            ? '9:16'
            : platform === 'facebook'
              ? '1.91:1'
              : '16:9',
        script: `Anúncio em imagem para ${platform}: ${productData.name} - ${productData.currency} ${productData.price.toFixed(2)}`,
      });

      // Anúncio em vídeo (se solicitado)
      if (includeVideo) {
        generatedAds.push({
          platform: platform as any,
          type: 'video',
          dimensions:
            platform === 'tiktok' || platform === 'instagram' || platform === 'whatsapp'
              ? { width: 1080, height: 1920 }
              : platform === 'facebook'
                ? { width: 1080, height: 1080 }
                : { width: 1920, height: 1080 },
          aspectRatio:
            platform === 'tiktok' || platform === 'instagram' || platform === 'whatsapp'
              ? '9:16'
              : platform === 'facebook'
                ? '1:1'
                : '16:9',
          script: `Anúncio em vídeo para ${platform}: Meninas, olhem só que incrível! ${productData.name} da ${productData.storeName}. Por apenas ${productData.currency} ${productData.price.toFixed(2)}. É imperdível!`,
        });
      }
    }

    setCommercials(generatedAds);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">🎬 Gerador de Comerciais</h1>
          <p className="text-slate-300">
            Crie anúncios profissionais para múltiplas plataformas automaticamente
          </p>
        </div>

        {/* Dados do Produto */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">📦 Dados do Produto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-white">{productData.description}</p>
            </div>
          </div>
        </Card>

        {/* Seleção de Plataformas */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">📱 Plataformas</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {platforms.map((platform) => (
              <label
                key={platform.id}
                className="flex items-center space-x-2 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 cursor-pointer transition"
              >
                <Checkbox
                  checked={selectedPlatforms.includes(platform.id as any)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      setSelectedPlatforms([...selectedPlatforms, platform.id as any]);
                    } else if (checked === false) {
                      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform.id));
                    }
                  }}
                />
                <span className="text-white">
                  {platform.icon} {platform.label}
                </span>
              </label>
            ))}
          </div>

          {/* Opções */}
          <div className="flex items-center space-x-4 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={includeVideo}
                onCheckedChange={(checked) => setIncludeVideo(checked === true)}
              />
              <span className="text-white">Incluir anúncios em vídeo</span>
            </label>
          </div>

          {/* Botão Gerar */}
          <Button
            onClick={handleGenerateCommercials}
            disabled={isGenerating || selectedPlatforms.length === 0}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando comerciais...
              </>
            ) : (
              <>
                🎥 Gerar Comerciais ({selectedPlatforms.length} plataformas)
              </>
            )}
          </Button>
        </Card>

        {/* Comerciais Gerados */}
        {commercials.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">✨ Comerciais Gerados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commercials.map((commercial, index) => (
                <Card
                  key={index}
                  className="bg-slate-800/50 border-purple-500/30 p-6 hover:border-cyan-500/50 transition"
                >
                  {/* Preview */}
                  <div
                    className="w-full bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                    style={{
                      aspectRatio: commercial.aspectRatio,
                      maxHeight: '300px',
                    }}
                  >
                    <div className="text-center p-4">
                      <p className="text-slate-400 text-sm mb-2">
                        {commercial.platform.toUpperCase()} - {commercial.type.toUpperCase()}
                      </p>
                      <p className="text-slate-300 text-xs">
                        {commercial.dimensions.width}x{commercial.dimensions.height}px
                      </p>
                      <p className="text-cyan-400 text-lg font-bold mt-4">
                        {commercial.platform === 'tiktok' && '🎵'}
                        {commercial.platform === 'instagram' && '📸'}
                        {commercial.platform === 'facebook' && '👍'}
                        {commercial.platform === 'whatsapp' && '💬'}
                        {commercial.platform === 'youtube' && '▶️'}
                      </p>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="mb-4">
                    <p className="text-slate-400 text-xs mb-2">Script de Narração:</p>
                    <p className="text-white text-sm bg-slate-900/50 p-3 rounded">
                      {commercial.script}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estado Vazio */}
        {commercials.length === 0 && !isGenerating && (
          <Card className="bg-slate-800/50 border-purple-500/30 p-12 text-center">
            <p className="text-slate-400 text-lg">
              Selecione as plataformas e clique em "Gerar Comerciais" para começar
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
