import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TOKEN_COSTS = {
  image: 50,
  video: 200,
  upscale: 30,
  tts: 20,
};

export default function ImageGenerator() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const { data: balance } = trpc.tokens.getBalance.useQuery();
  const createCreationMutation = trpc.creations.create.useMutation();

  if (!user) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!balance || balance.balance < TOKEN_COSTS.image) {
      toast.error("Insufficient tokens for image generation");
      return;
    }

    setIsGenerating(true);
    try {
      // Call image generation API (placeholder - will be replaced with actual API)
      // For now, we'll create a mock generation
      const mockImageUrl = `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt.substring(0, 20))}`;
      
      // In production, this would be:
      // const response = await fetch('/api/generate-image', { method: 'POST', body: JSON.stringify({ prompt }) });
      // const { url } = await response.json();

      setGeneratedUrl(mockImageUrl);

      // Save to database
      await createCreationMutation.mutateAsync({
        type: "image",
        prompt,
        s3Key: `images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`,
        s3Url: mockImageUrl,
        mimeType: "image/jpeg",
        tokensUsed: TOKEN_COSTS.image,
      });

      toast.success("Image generated successfully!");
      setPrompt("");
      
      // Redirect to gallery after a short delay
      setTimeout(() => {
        navigate("/gallery");
      }, 1500);
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
          <h1 className="text-4xl font-bold">Image Generator</h1>
          <p className="text-slate-400 mt-2">Create stunning images with AI</p>
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
                This generation costs {TOKEN_COSTS.image} tokens
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generator Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Describe Your Image</CardTitle>
            <CardDescription>
              Enter a detailed description of what you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="A serene landscape with mountains, sunset, and a calm lake..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || !balance || balance.balance < TOKEN_COSTS.image}
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
                  Generate Image
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

        {/* Tips */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Better Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Be specific about the style and mood you want</p>
            <p>• Include details about lighting, colors, and composition</p>
            <p>• Mention the art style or reference artists if desired</p>
            <p>• Describe the subject clearly and in detail</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
