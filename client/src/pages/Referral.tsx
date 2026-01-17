import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { translations as t } from "@/lib/translations";

interface ReferredUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  tokensEarned: number;
  status: "active" | "inactive";
}

const REFERRED_USERS: ReferredUser[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    joinDate: "2026-01-10",
    tokensEarned: 500,
    status: "active",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    joinDate: "2026-01-08",
    tokensEarned: 500,
    status: "active",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@example.com",
    joinDate: "2026-01-05",
    tokensEarned: 500,
    status: "active",
  },
];

export default function Referral() {
  const { user } = useAuth();
  const [referralLink] = useState(
    `https://trinity-clone.manus.space?ref=${user?.id || "abc123"}`
  );

  if (!user) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success(t.success.copied);
  };

  const totalTokensEarned = REFERRED_USERS.reduce((sum, user) => sum + user.tokensEarned, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Share2 className="w-8 h-8 text-purple-400" />
            {t.referral.inviteFriends}
          </h1>
          <p className="text-slate-400 mt-2">
            Convide amigos e ganhe tokens para cada um que se cadastrar
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Amigos Indicados</p>
                  <div className="text-3xl font-bold text-purple-400 mt-2">
                    {REFERRED_USERS.length}
                  </div>
                </div>
                <Users className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Tokens Ganhos</p>
                  <div className="text-3xl font-bold text-green-400 mt-2">
                    {totalTokensEarned}
                  </div>
                </div>
                <Trophy className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Por Referência</p>
                  <div className="text-3xl font-bold text-blue-400 mt-2">
                    500
                  </div>
                </div>
                <Share2 className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link de Referência */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700">
          <CardHeader>
            <CardTitle>{t.referral.yourReferralLink}</CardTitle>
            <CardDescription>
              Compartilhe este link com seus amigos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
              />
              <Button onClick={handleCopyLink} className="gap-2">
                <Copy className="w-4 h-4" />
                {t.buttons.copyUrl}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Email
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Twitter
              </Button>
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Facebook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Amigos Indicados */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>{t.referral.referredFriends}</CardTitle>
            <CardDescription>
              Amigos que se cadastraram através do seu link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {REFERRED_USERS.map((referredUser) => (
                <div
                  key={referredUser.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-700"
                >
                  <div>
                    <p className="font-semibold">{referredUser.name}</p>
                    <p className="text-sm text-slate-400">{referredUser.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Cadastrado em {new Date(referredUser.joinDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      +{referredUser.tokensEarned}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      referredUser.status === "active"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-slate-600 text-slate-400"
                    }`}>
                      {referredUser.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {t.referral.leaderboard}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { position: 1, name: "Você", tokens: totalTokensEarned, medal: "🥇" },
                { position: 2, name: "João Silva", tokens: 2500, medal: "🥈" },
                { position: 3, name: "Maria Santos", tokens: 2000, medal: "🥉" },
              ].map((user) => (
                <div
                  key={user.position}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{user.medal}</span>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-slate-400">#{user.position}</p>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-purple-400">{user.tokens}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
