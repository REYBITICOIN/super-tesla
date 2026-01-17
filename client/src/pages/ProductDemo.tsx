import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Volume2, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDemo() {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!user) return null;

  const product = {
    name: "Kit 3 Calça Jeans Feminina Skinny Elastano Premium Premium",
    price: 129.99,
    priceAttacado: 34.99,
    discount: "28% OFF",
    rating: 5,
    reviews: 127,
    image: "https://via.placeholder.com/500x600?text=Calça+Jeans+Skinny",
    colors: ["Preto", "Azul", "Multicolorido"],
    sizes: ["36", "38", "40", "42", "44"],
    description: "Kit 3 Calça Jeans Feminina Skinny Elastano Premium - Conforto e Estilo Renovados para Você!",
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast.success(isPlaying ? "Áudio pausado" : "Reproduzindo narração...");
  };

  const handleDownload = () => {
    toast.success("Vídeo baixado com sucesso!");
  };

  const handleShare = () => {
    toast.success("Link compartilhado!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Demonstração de Produto</h1>
          <p className="text-slate-400 mt-2">
            Vídeo com narração automática usando IA - Trinity Clone
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vídeo/Imagem Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <div className="relative bg-slate-700 aspect-video flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-16 h-16 text-white" />
                  ) : (
                    <Play className="w-16 h-16 text-white" />
                  )}
                </button>
              </div>

              {/* Controles de Áudio */}
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Narração em Português Brasileiro</span>
                    <span>{Math.floor(currentTime)}s / {Math.floor(duration)}s</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayPause}
                    className="flex-1 gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Reproduzir
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Volume2 className="w-4 h-4" />
                    Volume
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Vídeo
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Descrição Técnica */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Sobre o Vídeo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p>
                  Este vídeo foi gerado automaticamente usando a ferramenta de <strong>Text-to-Speech (TTS)</strong> do Trinity Clone.
                </p>
                <p>
                  A narração em português brasileiro descreve o produto, seus benefícios, preços, tamanhos, cores e informações de entrega.
                </p>
                <p>
                  Você pode usar esta ferramenta para criar vídeos de demonstração de produtos de forma rápida e automática, ideal para:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>YouTube e TikTok</li>
                  <li>Instagram Reels</li>
                  <li>WhatsApp Business</li>
                  <li>Catálogos de produtos</li>
                  <li>Publicidade em redes sociais</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Produto */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex text-yellow-400">
                      {"⭐".repeat(product.rating)}
                    </div>
                    <span className="text-sm text-slate-400">
                      ({product.reviews} avaliações)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-700 pt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-purple-400">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-400">por unidade</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-green-400">
                      R$ {product.priceAttacado.toFixed(2)}/cada
                    </span>
                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                      -73% OFF
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Kit com 10 peças</span>
                </div>

                <div className="space-y-3 border-t border-slate-700 pt-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Cores Disponíveis</h3>
                    <div className="flex gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs transition"
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Tamanhos</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs transition"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-700 pt-4 text-xs text-slate-400">
                  <p>✅ Primeira troca GRÁTIS se não servir</p>
                  <p>✅ Envio para todo Brasil</p>
                  <p>✅ Atendimento via WhatsApp</p>
                  <p>✅ Parcelamento até 10x</p>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-700">
              <CardHeader>
                <CardTitle className="text-lg">Gerado com Trinity Clone</CardTitle>
                <CardDescription>
                  Ferramenta de IA para criar vídeos de produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Narração:</span>
                  <span className="font-semibold">TTS IA</span>
                </div>
                <div className="flex justify-between">
                  <span>Idioma:</span>
                  <span className="font-semibold">Português BR</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração:</span>
                  <span className="font-semibold">~2 minutos</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens Usados:</span>
                  <span className="font-semibold text-orange-400">50</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instruções de Uso */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Como Usar Esta Ferramenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Extraia as informações do produto</strong> - Nome, preço, descrição, cores, tamanhos
              </li>
              <li>
                <strong>Crie um script de narração</strong> - Descreva o produto em português brasileiro
              </li>
              <li>
                <strong>Use a ferramenta de TTS</strong> - Converta o texto em áudio com IA
              </li>
              <li>
                <strong>Adicione imagens ou vídeo</strong> - Sincronize com a narração
              </li>
              <li>
                <strong>Exporte para redes sociais</strong> - YouTube, TikTok, Instagram, WhatsApp
              </li>
              <li>
                <strong>Agende a postagem</strong> - Publique automaticamente no horário ideal
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
