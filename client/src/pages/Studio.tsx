import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Expand,
  Film,
  Mic2,
  Sparkles,
  Wand2,
  Zap,
  MessageSquare,
  GitBranch,
  Image,
  Play,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const TOOLS = [
  { id: "chat", label: "Super Tesla Chat", icon: MessageSquare, badge: "NEW", href: "/chat" },
  { id: "flow", label: "Flow", icon: GitBranch, badge: "BETA", href: "/flow" },
  { id: "vision2", label: "Vision 2.0", icon: Image, badge: "NEW", href: "/create" },
  { id: "instruct", label: "Instruct", icon: Wand2, badge: "BETA", href: "/instruct" },
  { id: "speak", label: "Speak", icon: Mic2, href: "/tts" },
  { id: "visionpromax", label: "Vision Pro Max", icon: Image, href: "/vision-pro-max" },
  { id: "visionpro", label: "Vision Pro", icon: Image, href: "/vision-pro" },
  { id: "videopro", label: "Video Pro", icon: Film, badge: "NEW", href: "/video-pro" },
  { id: "video", label: "Video", icon: Film, href: "/video" },
  { id: "upscale", label: "Upscale", icon: Expand, href: "/upscale" },
  { id: "upscale4k", label: "4K Upscale Video", icon: Film, href: "/upscale-video" },
  { id: "expand", label: "Expand", icon: Expand, href: "/expand" },
];

const FEATURED_CREATIONS = [
  {
    id: 1,
    type: "FLOW",
    title: "Indigo Body Butter",
    prompt: "Product photography of indigo body butter",
    image: "https://via.placeholder.com/300x400?text=Indigo+Body+Butter",
    isVideo: false,
  },
  {
    id: 2,
    type: "FLOW",
    title: "Mini Red Dress",
    prompt: "Fashion model wearing a mini red dress",
    image: "https://via.placeholder.com/300x400?text=Red+Dress",
    isVideo: true,
  },
  {
    id: 3,
    type: "VISION-2.0",
    title: "Fashion Editorial",
    prompt: "A stylish Instagram model sits alone in a lavish restaurant",
    image: "https://via.placeholder.com/300x400?text=Fashion+Editorial",
    isVideo: false,
  },
  {
    id: 4,
    type: "VIDEO-PRO",
    title: "Beauty Video",
    prompt: "Close up beauty video with professional lighting",
    image: "https://via.placeholder.com/300x400?text=Beauty+Video",
    isVideo: true,
  },
  {
    id: 5,
    type: "VISION-PRO-MAX",
    title: "Gothic Interior",
    prompt: "A woman in a dimly lit gothic interior",
    image: "https://via.placeholder.com/300x400?text=Gothic",
    isVideo: false,
  },
  {
    id: 6,
    type: "SPEAK",
    title: "Product Narration",
    prompt: "Girl talking about haircare products",
    image: "https://via.placeholder.com/300x400?text=Speak",
    isVideo: true,
  },
  {
    id: 7,
    type: "UPSCALE",
    title: "Upscale 3x",
    prompt: "Image upscaled to 3x resolution",
    image: "https://via.placeholder.com/300x400?text=Upscale",
    isVideo: false,
  },
  {
    id: 8,
    type: "INSTRUCT",
    title: "AI-assisted Edit",
    prompt: "Professional image editing with AI",
    image: "https://via.placeholder.com/300x400?text=Instruct",
    isVideo: false,
  },
];

export default function Studio() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTool, setSelectedTool] = useState("vision2");

  const { data: balance } = trpc.tokens.getBalance.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Sidebar */}
      <div className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <Link href="/studio">
            <div className="flex items-center gap-2 cursor-pointer">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-sm">SUPER TESLA</span>
            </div>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs text-slate-400 truncate">{user.email}</div>
          <div className="text-sm font-semibold mt-1">{user.name}</div>
        </div>

        {/* Tools Menu */}
        <div className="flex-1 overflow-y-auto p-2">
          {TOOLS.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <button
                onClick={() => setSelectedTool(tool.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition ${
                  selectedTool === tool.id
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <tool.icon className="w-4 h-4" />
                <span className="flex-1 text-left truncate">{tool.label}</span>
                {tool.badge && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-600 rounded text-white">
                    {tool.badge}
                  </span>
                )}
              </button>
            </Link>
          ))}
        </div>

        {/* Token Balance */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">{balance?.balance || 0}</span>
            </div>
            <span className="text-xs text-slate-400">Tokens</span>
          </div>
          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            Get Tokens
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Footer Links */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
          <div className="flex gap-2">
            <a href="#" className="hover:text-slate-300">Terms</a>
            <a href="#" className="hover:text-slate-300">Privacy</a>
          </div>
          <div className="flex gap-2">
            <a href="#" className="hover:text-slate-300">FAQ</a>
            <a href="#" className="hover:text-slate-300">Contact</a>
          </div>
          <div className="pt-2 text-slate-600">Powered by Super Tesla</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-purple-400">✦</span>
            FEATURED
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Click any creation to load it into the tool with the same settings
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURED_CREATIONS.map((creation) => (
              <Card
                key={creation.id}
                className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-500 transition cursor-pointer group"
              >
                {/* Image Container */}
                <div className="relative aspect-video bg-slate-700 overflow-hidden">
                  <img
                    src={creation.image}
                    alt={creation.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                      {creation.type}
                    </span>
                  </div>

                  {/* Play Button for Videos */}
                  {creation.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm text-white truncate">
                    {creation.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {creation.prompt}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7"
                  >
                    Click to try with these settings
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
