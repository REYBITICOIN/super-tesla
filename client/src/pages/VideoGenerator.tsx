import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Film, Loader2, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TOKEN_COST = 200;

export default function VideoGenerator() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: balance } = trpc.tokens.getBalance.useQuery();
  const generateVideoMutation = trpc.ai.generateVideo.useMutation();

  if (!user) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for video generation");
      return;
    }

    setIsGenerating(true);
    try {
      await generateVideoMutation.mutateAsync({
        prompt,
      });

      toast.success("Video generation started!");
      setPrompt("");
      
      setTimeout(() => {
        navigate("/gallery");
      }, 1500);
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
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Video Generator</h1>
          <p className="text-slate-400 mt-2">Create stunning videos with AI</p>
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
            <CardTitle>Describe Your Video</CardTitle>
            <CardDescription>
              Enter a detailed description of the video you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="A person dancing in a modern studio with colorful lights..."
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
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Tips for Better Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Describe the motion and camera movement</p>
            <p>• Include details about the setting and atmosphere</p>
            <p>• Specify the duration or pacing you want</p>
            <p>• Mention any specific objects or people in the scene</p>
            <p>• Be clear about the style (cinematic, documentary, etc.)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
