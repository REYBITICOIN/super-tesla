import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Play, Pause, Download, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text';
  name: string;
  startTime: number;
  duration: number;
  url?: string;
  content?: string;
  color: string;
}

export default function VideoEditor() {
  const { user, isAuthenticated } = useAuth();
  const [tracks, setTracks] = useState<TimelineTrack[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(30); // 30 segundos padrão
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Editor de Vídeo Pro</h1>
          <p className="text-muted-foreground">Faça login para usar o editor de vídeo integrado.</p>
        </Card>
      </div>
    );
  }

  const addTrack = (type: 'video' | 'audio' | 'text') => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'];
    const newTrack: TimelineTrack = {
      id: `track-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${tracks.length + 1}`,
      startTime: 0,
      duration: 5,
      color: colors[tracks.length % colors.length],
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
  };

  const updateTrack = (id: string, updates: Partial<TimelineTrack>) => {
    setTracks(tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🎬 Editor de Vídeo Pro
          </h1>
          <p className="text-muted-foreground text-lg">Crie vídeos profissionais com timeline integrada</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Painel de Controle */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Controles de Reprodução */}
              <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20">
                <h2 className="text-sm font-bold mb-4 text-purple-400">Reprodução</h2>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Reproduzir
                        </>
                      )}
                    </Button>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tempo: {currentTime.toFixed(1)}s</label>
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      step="0.1"
                      value={currentTime}
                      onChange={(e) => setCurrentTime(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Duração: {duration}s</label>
                    <input
                      type="range"
                      min="5"
                      max="300"
                      step="5"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>

              {/* Adicionar Tracks */}
              <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20">
                <h2 className="text-sm font-bold mb-4 text-purple-400">Adicionar Camadas</h2>
                <div className="space-y-2">
                  <Button
                    onClick={() => addTrack('video')}
                    className="w-full justify-start text-xs"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Vídeo
                  </Button>
                  <Button
                    onClick={() => addTrack('audio')}
                    className="w-full justify-start text-xs"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Áudio
                  </Button>
                  <Button
                    onClick={() => addTrack('text')}
                    className="w-full justify-start text-xs"
                    variant="outline"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Texto
                  </Button>
                </div>
              </Card>

              {/* Tracks List */}
              <Card className="p-6 bg-background/50 backdrop-blur border-purple-500/20">
                <h2 className="text-sm font-bold mb-4 text-purple-400">Camadas ({tracks.length})</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tracks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma camada adicionada</p>
                  ) : (
                    tracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition ${
                          selectedTrack === track.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-purple-500/20 hover:border-purple-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium">{track.name}</p>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTrack(track.id);
                            }}
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {track.startTime.toFixed(1)}s - {(track.startTime + track.duration).toFixed(1)}s
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Export */}
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar Vídeo
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-background/50 backdrop-blur border-purple-500/20">
              <h2 className="text-xl font-bold mb-6 text-purple-400">Timeline</h2>

              {/* Preview */}
              <div className="mb-8 bg-black rounded-lg aspect-video flex items-center justify-center border border-purple-500/20">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-muted-foreground">Preview do vídeo</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentTime.toFixed(1)}s / {duration}s
                  </p>
                </div>
              </div>

              {/* Timeline Tracks */}
              <div className="space-y-4">
                {tracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                    <div className="text-4xl mb-4">📹</div>
                    <p>Nenhuma camada na timeline</p>
                    <p className="text-sm">Adicione vídeo, áudio ou texto usando o painel à esquerda</p>
                  </div>
                ) : (
                  tracks.map((track) => (
                    <div key={track.id} className="border border-purple-500/20 rounded-lg p-4 bg-purple-500/5">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">{track.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {track.duration.toFixed(1)}s
                        </span>
                      </div>
                      <div className="relative h-12 bg-background/50 rounded border border-purple-500/20 overflow-hidden">
                        {/* Track Bar */}
                        <div
                          className={`absolute h-full ${track.color} opacity-70 rounded`}
                          style={{
                            left: `${(track.startTime / duration) * 100}%`,
                            width: `${(track.duration / duration) * 100}%`,
                          }}
                        >
                          <div className="h-full flex items-center px-2 text-xs font-medium text-white truncate">
                            {track.name}
                          </div>
                        </div>

                        {/* Current Time Indicator */}
                        <div
                          className="absolute h-full w-0.5 bg-cyan-400 z-10"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Timeline Ruler */}
              <div className="mt-6 border-t border-purple-500/20 pt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0s</span>
                  <span>{(duration / 2).toFixed(0)}s</span>
                  <span>{duration}s</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-purple-500/20">
            <h3 className="font-bold text-purple-400 mb-2">🎬 Múltiplas Camadas</h3>
            <p className="text-sm text-muted-foreground">Adicione vídeo, áudio e texto em camadas separadas</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <h3 className="font-bold text-pink-400 mb-2">⏱️ Timeline Visual</h3>
            <p className="text-sm text-muted-foreground">Controle preciso de tempo e duração de cada elemento</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-purple-500/20">
            <h3 className="font-bold text-cyan-400 mb-2">📤 Exportação</h3>
            <p className="text-sm text-muted-foreground">Exporte em múltiplos formatos para redes sociais</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
