import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { translations as t } from "@/lib/translations";

interface ScheduledPost {
  id: string;
  title: string;
  platforms: string[];
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "published" | "draft";
}

export default function Scheduler() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([
    {
      id: "1",
      title: "Meu primeiro vídeo",
      platforms: ["YouTube", "TikTok"],
      scheduledDate: "2026-01-20",
      scheduledTime: "14:30",
      status: "scheduled",
    },
  ]);
  const [showNewPost, setShowNewPost] = useState(false);

  if (!user) return null;

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter((p) => p.id !== id));
    toast.success(t.success.deleted);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-900/30 text-green-400 border-green-700";
      case "scheduled":
        return "bg-blue-900/30 text-blue-400 border-blue-700";
      default:
        return "bg-slate-700 text-slate-300 border-slate-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Publicada";
      case "scheduled":
        return "Agendada";
      default:
        return "Rascunho";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8 text-purple-400" />
              {t.scheduler.schedulePost}
            </h1>
            <p className="text-slate-400 mt-2">
              Agende suas postagens para as redes sociais
            </p>
          </div>
          <Button onClick={() => setShowNewPost(!showNewPost)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Postagem
          </Button>
        </div>

        {showNewPost && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Agendar Nova Postagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  placeholder="Descreva sua postagem"
                  className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Data</label>
                  <input
                    type="date"
                    className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hora</label>
                  <input
                    type="time"
                    className="w-full bg-slate-700 border-slate-600 text-white rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Plataformas</label>
                <div className="grid grid-cols-2 gap-2">
                  {["YouTube", "TikTok", "Instagram", "Facebook"].map((platform) => (
                    <label key={platform} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4" />
                      <span className="text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Agendar</Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewPost(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Postagens Agendadas</h2>
          {posts.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6 text-center text-slate-400">
                Nenhuma postagem agendada. Crie uma nova!
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.scheduledDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.scheduledTime}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        {post.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-slate-700 rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          post.status
                        )}`}
                      >
                        {getStatusLabel(post.status)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
