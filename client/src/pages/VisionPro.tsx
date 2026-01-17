import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TOKEN_COST = 60;

export default function VisionPro() {
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
      toast.error("Insufficient tokens for Vision Pro");
      return;
    }

    setIsGenerating(true);
    try {
      const mockImageUrl = `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(prompt.substring(0, 20))}`;
      setGeneratedUrl(mockImageUrl);
      toast.success("Image generated successfully!");
      setPrompt("");
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Vision Pro</h1>
          <p className="text-slate-400 mt-2">Professional image generation with advanced controls</p>
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
            <CardTitle>Describe Your Image</CardTitle>
            <CardDescription>
              Enter a detailed description for professional quality generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="A stylish Instagram model sits alone in a lavish restaurant..."
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
                  <Sparkles className="w-4 h-4" />
                  Generate with Vision Pro
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedUrl && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <img
                  src={generatedUrl}
                  alt="Generated"
                  className="w-full rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = generatedUrl;
                      link.download = "generated-image.jpg";
                      link.click();
                    }}
                  >
                    Download
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
            <CardTitle className="text-lg">Vision Pro Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• High resolution output (up to 2K)</p>
            <p>• Professional detail control</p>
            <p>• Advanced style options</p>
            <p>• Fast generation times</p>
            <p>• Batch processing support</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
