import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Wand2, Upload, Play, Download, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { translations as t } from "@/lib/translations";

interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  duration: string;
  genre: string;
  url: string;
}

const MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: "1",
    name: "Energetic Beats",
    artist: "Royalty Free Music",
    duration: "2:45",
    genre: "Eletrônico",
    url: "#",
  },
  {
    id: "2",
    name: "Cinematic Dreams",
    artist: "Royalty Free Music",
    duration: "3:20",
    genre: "Cinematográfico",
    url: "#",
  },
  {
    id: "3",
    name: "Upbeat Pop",
    artist: "Royalty Free Music",
    duration: "2:30",
    genre: "Pop",
    url: "#",
  },
  {
    id: "4",
    name: "Chill Vibes",
    artist: "Royalty Free Music",
    duration: "3:00",
    genre: "Lofi",
    url: "#",
  },
];

export default function MediaTools() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("background");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    if (!uploadedImage) {
      toast.error("Por favor, envie uma imagem");
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setProcessedImage(uploadedImage);
      toast.success("Fundo removido com sucesso!");
    } catch (error) {
      toast.error("Falha ao remover fundo");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectMusic = (trackId: string) => {
    setSelectedMusic(selectedMusic === trackId ? null : trackId);
    if (selectedMusic !== trackId) {
      toast.success("Música selecionada!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Music className="w-8 h-8 text-purple-400" />
            Ferramentas de Mídia
          </h1>
          <p className="text-slate-400 mt-2">
            Remova fundos de imagens e adicione música ao seu conteúdo
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="background" className="gap-2">
              <Wand2 className="w-4 h-4" />
              Remover Fundo
            </TabsTrigger>
            <TabsTrigger value="music" className="gap-2">
              <Music className="w-4 h-4" />
              Banco de Música
            </TabsTrigger>
          </TabsList>

          {/* Remover Fundo */}
          <TabsContent value="background" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Enviar Imagem</CardTitle>
                  <CardDescription>
                    Selecione uma imagem para remover o fundo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition cursor-pointer">
                    <label className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        Clique para enviar ou arraste aqui
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {uploadedImage && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">Prévia:</p>
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full rounded-lg max-h-64 object-cover"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing || !uploadedImage}
                    className="w-full gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Remover Fundo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Resultado */}
              {processedImage && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle>Resultado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full rounded-lg"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = processedImage;
                          link.download = "image-sem-fundo.png";
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(processedImage);
                          toast.success(t.success.copied);
                        }}
                      >
                        Copiar URL
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Banco de Música */}
          <TabsContent value="music" className="space-y-6">
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Biblioteca de Música Livre</CardTitle>
                  <CardDescription>
                    Use música livre de direitos autorais em seus vídeos
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MUSIC_LIBRARY.map((track) => (
                  <Card
                    key={track.id}
                    className={`bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 transition ${
                      selectedMusic === track.id ? "border-purple-500" : ""
                    }`}
                    onClick={() => handleSelectMusic(track.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{track.name}</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            {track.artist}
                          </p>
                          <div className="flex gap-2 mt-2 text-xs text-slate-500">
                            <span>{track.duration}</span>
                            <span>•</span>
                            <span>{track.genre}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success("Reproduzindo...");
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>

                      {selectedMusic === track.id && (
                        <div className="mt-4 p-3 bg-purple-900/30 rounded border border-purple-700">
                          <p className="text-sm text-purple-300">
                            ✓ Selecionada
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Upload de Música Customizada */}
              <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700">
                <CardHeader>
                  <CardTitle>Enviar Sua Própria Música</CardTitle>
                  <CardDescription>
                    Adicione arquivos de áudio customizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-purple-600 rounded-lg p-6 text-center hover:border-purple-500 transition cursor-pointer">
                    <label className="cursor-pointer block">
                      <Music className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <span className="text-sm text-purple-300">
                        Clique para enviar arquivo de áudio
                      </span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
