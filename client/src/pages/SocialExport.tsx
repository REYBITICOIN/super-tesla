import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Download, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { translations as t } from "@/lib/translations";

const SOCIAL_PLATFORMS = [
  { id: "youtube", name: t.socialMedia.youtube, dimensions: ["1920x1080", "1280x720"] },
  { id: "tiktok", name: t.socialMedia.tiktok, dimensions: ["1080x1920"] },
  { id: "instagram", name: t.socialMedia.instagram, dimensions: ["1080x1080", "1080x1350", "1080x1920"] },
  { id: "whatsapp", name: t.socialMedia.whatsapp, dimensions: ["1080x1920"] },
  { id: "facebook", name: t.socialMedia.facebook, dimensions: ["1200x628", "1080x1080"] },
];

export default function SocialExport() {
  const { user } = useAuth();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  if (!user) return null;

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleExport = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Selecione pelo menos uma rede social");
      return;
    }

    setIsExporting(true);
    try {
      // Simular exportação
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Exportado para ${selectedPlatforms.length} rede(s) social(is)!`);
    } catch (error) {
      toast.error("Falha ao exportar");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Share2 className="w-8 h-8 text-purple-400" />
            {t.socialMedia.exportFor} Redes Sociais
          </h1>
          <p className="text-slate-400 mt-2">
            Exporte seu conteúdo otimizado para cada plataforma
          </p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Selecione as Plataformas</CardTitle>
            <CardDescription>
              Escolha para quais redes sociais você deseja exportar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                onClick={() => togglePlatform(platform.id)}
              >
                <Checkbox
                  checked={selectedPlatforms.includes(platform.id)}
                  onChange={() => togglePlatform(platform.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{platform.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Dimensões: {platform.dimensions.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Opções de Exportação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-700">
                <h4 className="font-semibold mb-2">Formato</h4>
                <select className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm">
                  <option>MP4</option>
                  <option>WebM</option>
                  <option>MOV</option>
                </select>
              </div>
              <div className="p-4 rounded-lg bg-slate-700">
                <h4 className="font-semibold mb-2">Qualidade</h4>
                <select className="w-full bg-slate-600 text-white rounded px-3 py-2 text-sm">
                  <option>Alta (1080p)</option>
                  <option>Média (720p)</option>
                  <option>Baixa (480p)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-900/30 rounded-lg border border-purple-700">
              <input type="checkbox" id="watermark" className="w-4 h-4" />
              <label htmlFor="watermark" className="text-sm cursor-pointer">
                Adicionar marca d'água
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedPlatforms.length === 0}
            size="lg"
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exportando..." : "Exportar Agora"}
          </Button>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Dicas de Exportação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Cada plataforma terá seu próprio arquivo otimizado</p>
            <p>• As dimensões serão ajustadas automaticamente</p>
            <p>• Você receberá um arquivo ZIP com todos os vídeos</p>
            <p>• Qualidade será mantida em todas as versões</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
