import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface ConnectedAccount {
  platform: string;
  username: string;
  isConnected: boolean;
  connectedAt: string;
}

export default function SocialConnect() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectFacebook = () => {
    setIsLoading(true);
    // Redireciona para OAuth do Facebook
    window.location.href = `/api/oauth/facebook`;
  };

  const handleConnectInstagram = () => {
    setIsLoading(true);
    // Redireciona para OAuth do Instagram
    window.location.href = `/api/oauth/instagram`;
  };

  const handleConnectTikTok = () => {
    setIsLoading(true);
    // Redireciona para OAuth do TikTok
    window.location.href = `/api/oauth/tiktok`;
  };

  const handleDisconnect = (platform: string) => {
    // Implementar desconexão
    console.log(`Desconectar ${platform}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔗 Conectar Redes Sociais</h1>
          <p className="text-slate-400">
            Conecte suas contas de redes sociais para publicar comerciais automaticamente
          </p>
        </div>

        {/* Plataformas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Facebook */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-blue-500/50 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">👍</div>
                <div>
                  <h3 className="text-white font-semibold">Facebook</h3>
                  <p className="text-sm text-slate-400">Páginas e Feed</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {connectedAccounts.find((a) => a.platform === "facebook")?.isConnected ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">
                    Conectado como{" "}
                    {connectedAccounts.find((a) => a.platform === "facebook")?.username}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Não conectado</p>
              )}

              <Button
                onClick={
                  connectedAccounts.find((a) => a.platform === "facebook")?.isConnected
                    ? () => handleDisconnect("facebook")
                    : handleConnectFacebook
                }
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : connectedAccounts.find((a) => a.platform === "facebook")?.isConnected ? (
                  "Desconectar"
                ) : (
                  "Conectar Facebook"
                )}
              </Button>
            </div>
          </Card>

          {/* Instagram */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-pink-500/50 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">📸</div>
                <div>
                  <h3 className="text-white font-semibold">Instagram</h3>
                  <p className="text-sm text-slate-400">Feed e Reels</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {connectedAccounts.find((a) => a.platform === "instagram")?.isConnected ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">
                    Conectado como{" "}
                    {connectedAccounts.find((a) => a.platform === "instagram")?.username}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Não conectado</p>
              )}

              <Button
                onClick={
                  connectedAccounts.find((a) => a.platform === "instagram")?.isConnected
                    ? () => handleDisconnect("instagram")
                    : handleConnectInstagram
                }
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : connectedAccounts.find((a) => a.platform === "instagram")?.isConnected ? (
                  "Desconectar"
                ) : (
                  "Conectar Instagram"
                )}
              </Button>
            </div>
          </Card>

          {/* TikTok */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-500/50 transition">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🎵</div>
                <div>
                  <h3 className="text-white font-semibold">TikTok</h3>
                  <p className="text-sm text-slate-400">Vídeos e Shorts</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {connectedAccounts.find((a) => a.platform === "tiktok")?.isConnected ? (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">
                    Conectado como{" "}
                    {connectedAccounts.find((a) => a.platform === "tiktok")?.username}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Não conectado</p>
              )}

              <Button
                onClick={
                  connectedAccounts.find((a) => a.platform === "tiktok")?.isConnected
                    ? () => handleDisconnect("tiktok")
                    : handleConnectTikTok
                }
                disabled={isLoading}
                className="w-full bg-black hover:bg-slate-900 border border-cyan-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : connectedAccounts.find((a) => a.platform === "tiktok")?.isConnected ? (
                  "Desconectar"
                ) : (
                  "Conectar TikTok"
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Informações */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-blue-400 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-white font-semibold mb-2">Como funciona</h3>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>
                  ✅ Conecte suas contas de redes sociais usando OAuth seguro
                </li>
                <li>
                  ✅ Seus tokens de acesso são armazenados de forma segura no servidor
                </li>
                <li>
                  ✅ Publique comerciais automaticamente em múltiplas plataformas
                </li>
                <li>
                  ✅ Acompanhe o histórico de publicações e métricas de engajamento
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
