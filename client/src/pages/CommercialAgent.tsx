import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Link2, Sparkles } from 'lucide-react';

export default function CommercialAgent() {
  const [productUrl, setProductUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScrapeProduct = async () => {
    if (!productUrl.trim()) {
      setError('Por favor, insira uma URL de produto válida');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Aqui você faria a chamada para o backend
      // const response = await trpc.commercialAgent.scrapeProduct.useMutation();
      // Por enquanto, vamos simular
      
      const mockData = {
        name: 'Kit 3 Calça Jeans Feminina Skinny Elastano Premium',
        description: 'Feito com tecido de altíssima qualidade, oferece ajuste perfeito ao corpo com elastano premium que proporciona conforto máximo.',
        price: 129.99,
        currency: 'BRL',
        images: [
          'https://via.placeholder.com/500x600?text=Calça+Jeans+1',
          'https://via.placeholder.com/500x600?text=Calça+Jeans+2',
          'https://via.placeholder.com/500x600?text=Calça+Jeans+3',
        ],
        logo: 'https://via.placeholder.com/200x100?text=Toca+da+Onça',
        storeName: 'Toca da Onça Modas',
        sku: 'JEANS-SKINNY-001',
      };

      setProductData(mockData);
    } catch (err) {
      setError('Erro ao extrair dados do produto. Verifique a URL e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
            🎬 Agente de Comerciais Automáticos
          </h1>
          <p className="text-gray-300 text-lg">
            Crie comerciais profissionais automaticamente a partir de qualquer link de produto
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-slate-800/50 border-purple-500/30 p-6 mb-8">
          <div className="flex gap-3">
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
          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
        </Card>

        {/* Product Data Display */}
        {productData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Images */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-purple-500/30 p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">📸 Imagens do Produto</h2>
                <div className="grid grid-cols-2 gap-4">
                  {productData.images.map((img: string, idx: number) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg overflow-hidden">
                      <img
                        src={img}
                        alt={`Produto ${idx + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Logo */}
              <Card className="bg-slate-800/50 border-purple-500/30 p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Logo da Loja</h3>
                <img
                  src={productData.logo}
                  alt="Logo"
                  className="w-full h-20 object-contain bg-slate-700/50 rounded p-2"
                />
              </Card>

              {/* Product Details */}
              <Card className="bg-slate-800/50 border-purple-500/30 p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Detalhes do Produto</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Nome</p>
                    <p className="text-white font-semibold text-sm">{productData.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Loja</p>
                    <p className="text-cyan-400 font-semibold text-sm">{productData.storeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Preço</p>
                    <p className="text-green-400 font-bold text-lg">
                      {productData.currency} {productData.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">SKU</p>
                    <p className="text-gray-300 text-sm">{productData.sku}</p>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
                  🎥 Gerar Comercial
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold">
                  📱 Escolher Plataforma
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {!productData && (
          <Card className="bg-slate-800/50 border-purple-500/30 p-8 text-center">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Comece inserindo a URL de um produto
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              O agente irá extrair automaticamente as imagens, logo, nome, descrição e preço do produto.
              Depois você pode gerar um comercial profissional e publicar em suas redes sociais.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
