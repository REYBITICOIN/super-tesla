import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TOKEN_COST = 75;

export default function VisionProMax() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
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
      toast.error("Insufficient tokens for Vision Pro Max");
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
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Vision Pro Max</h1>
          <p className="text-slate-400 mt-2">Premium image generation with maximum quality</p>
        </div>

        {/* Token Balance */}
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

        {/* Generator Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Describe Your Image</CardTitle>
            <CardDescription>
              Enter a detailed description for maximum quality generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="A woman standing in a dimly lit gothic interior, wearing a lace lingerie set..."
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
                  Generate with Vision Pro Max
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Image Preview */}
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

        {/* Features */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Vision Pro Max Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Maximum resolution output (up to 4K)</p>
            <p>• Advanced detail preservation</p>
            <p>• Superior color accuracy</p>
            <p>• Professional-grade results</p>
            <p>• Extended processing for optimal quality</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
