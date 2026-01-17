import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Film, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TOKEN_COST = 250;

export default function VideoPro() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const { data: balance } = trpc.tokens.getBalance.useQuery();

  if (!user) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for Video Pro");
      return;
    }

    setIsGenerating(true);
    try {
      const mockVideoUrl = "https://via.placeholder.com/1024x576?text=Video+Pro+Generation";
      setGeneratedUrl(mockVideoUrl);
      toast.success("Video generation started!");
      setPrompt("");
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Video Pro</h1>
          <p className="text-slate-400 mt-2">Professional video generation with advanced controls</p>
        </div>

        <Card className="bg-blue-900/30 border-blue-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-300">Your Balance:</span>
              </div>
              <div className="text-2xl font-bold">{balance?.balance || 0} tokens</div>
              <div className="text-sm text-slate-400">
                This generation costs {TOKEN_COST} tokens
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Describe Your Video</CardTitle>
            <CardDescription>
              Enter a detailed description for professional video generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Close up beauty video starting from this exact frame of a closed eye with red pink shimmer eyeshadow..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !balance || balance.balance < TOKEN_COST}
              size="lg"
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  Generate with Video Pro
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedUrl && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Generated Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg aspect-video flex items-center justify-center">
                  <Film className="w-16 h-16 text-slate-500" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    Download Video
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedUrl);
                      toast.success("URL copied to clipboard");
                    }}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Video Pro Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• 4K video generation</p>
            <p>• Professional motion control</p>
            <p>• Advanced camera movements</p>
            <p>• Extended video lengths (up to 60 seconds)</p>
            <p>• Cinematic quality output</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
