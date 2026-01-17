import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { Film, Image, Mic2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const CREATION_TYPES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "image", label: "Vision", icon: Image },
  { id: "video", label: "Video", icon: Film },
  { id: "upscale", label: "Upscale", icon: Zap },
  { id: "tts", label: "Speak", icon: Mic2 },
  { id: "flow", label: "Flow", icon: Sparkles },
];

export default function Gallery() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("all");

  const { data: allCreations, isLoading: allLoading } = trpc.creations.list.useQuery(
    { limit: 100 },
    { enabled: selectedType === "all" }
  );

  const { data: typeCreations, isLoading: typeLoading } = trpc.creations.listByType.useQuery(
    { type: selectedType, limit: 100 },
    { enabled: selectedType !== "all" }
  );

  const creations = selectedType === "all" ? allCreations : typeCreations;
  const isLoading = selectedType === "all" ? allLoading : typeLoading;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Gallery</h1>
            <p className="text-slate-400 mt-2">Your AI creations</p>
          </div>
          <Link href="/create">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Create New
            </Button>
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {CREATION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <Button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                variant={selectedType === type.id ? "default" : "outline"}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-slate-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : creations && creations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creations.map((creation) => (
              <Card
                key={creation.id}
                className="overflow-hidden bg-slate-800 border-slate-700 hover:border-slate-500 transition group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-slate-700 relative overflow-hidden">
                  {creation.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <Film className="w-8 h-8 text-slate-400" />
                    </div>
                  ) : creation.type === "tts" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <Mic2 className="w-8 h-8 text-slate-400" />
                    </div>
                  ) : (
                    <img
                      src={creation.s3Url}
                      alt={creation.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                    <span className="px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold capitalize opacity-0 group-hover:opacity-100 transition">
                      {creation.type}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <p className="text-sm text-slate-300 line-clamp-2">
                    {creation.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{format(new Date(creation.createdAt), "MMM d")}</span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {creation.tokensUsed}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">No creations yet</h3>
            <p className="text-slate-400 mt-2">Start creating to see your work here</p>
            <Link href="/create">
              <Button className="mt-4">Create Your First</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
