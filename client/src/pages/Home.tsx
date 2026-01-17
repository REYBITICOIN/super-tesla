import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Film, Image, Mic2, Sparkles, Zap } from "lucide-react";
import { Link } from "wouter";

const FEATURES = [
  {
    icon: Image,
    title: "Image Generation",
    description: "Create stunning AI-generated images from text prompts",
    tokens: "50 tokens",
    href: "/create",
  },
  {
    icon: Film,
    title: "Video Generation",
    description: "Generate videos from text or reference images",
    tokens: "200 tokens",
    href: "/video",
  },
  {
    icon: Zap,
    title: "Image Upscale",
    description: "Enhance image resolution up to 4x",
    tokens: "30 tokens",
    href: "/upscale",
  },
  {
    icon: Mic2,
    title: "Text-to-Speech",
    description: "Convert text to natural-sounding audio",
    tokens: "20 tokens",
    href: "/tts",
  },
];

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Sparkles className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold">Trinity AI</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated && !loading ? (
              <>
                <Link href="/gallery">
                  <Button variant="ghost">Gallery</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost">Profile</Button>
                </Link>
              </>
            ) : null}
            {!isAuthenticated && !loading ? (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Create Stunning AI Content
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Generate images, videos, and audio with advanced AI. Token-based system for flexible usage.
          </p>
          {isAuthenticated && !loading ? (
            <Link href="/gallery">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Start Creating
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Sign Up for Free
              </Button>
            </a>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Powerful AI Tools</h2>
          <p className="text-slate-400 text-lg">Everything you need to create amazing content</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} href={feature.href}>
                <Card
                  className="bg-slate-800 border-slate-700 hover:border-slate-500 transition cursor-pointer h-full"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-blue-400">
                      <Zap className="w-4 h-4" />
                      {feature.tokens}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Token System Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700">
          <CardHeader>
            <CardTitle className="text-2xl">Token-Based System</CardTitle>
            <CardDescription>
              Start with 1000 tokens and use them flexibly across all tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">50</div>
                <div className="text-sm text-blue-200">Image Gen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">200</div>
                <div className="text-sm text-blue-200">Video Gen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">30</div>
                <div className="text-sm text-blue-200">Upscale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">20</div>
                <div className="text-sm text-blue-200">Text-to-Speech</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && !loading ? (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to create?</h2>
          <p className="text-slate-400 text-lg mb-8">
            Sign up now and get 1000 tokens to start creating
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Get Started Free
            </Button>
          </a>
        </section>
      ) : null}

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-slate-400">
          <p>&copy; 2024 Trinity AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
