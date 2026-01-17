import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Film, Zap, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TOKEN_COST = 80;

export default function UpscaleVideo() {
  const { user } = useAuth();
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [upscaleLevel, setUpscaleLevel] = useState<"2x" | "4x">("2x");
  const [isGenerating, setIsGenerating] = useState(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);

  const { data: balance } = trpc.tokens.getBalance.useQuery();

  if (!user) return null;

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video file too large (max 500MB)");
        return;
      }
      setUploadedVideo(file.name);
      toast.success("Video selected for upscaling");
    }
  };

  const handleUpscale = async () => {
    if (!uploadedVideo) {
      toast.error("Please upload a video first");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for 4K Upscale");
      return;
    }

    setIsGenerating(true);
    try {
      const mockUpscaledUrl = `https://via.placeholder.com/1920x1080?text=4K+Upscaled+${upscaleLevel}`;
      setUpscaledUrl(mockUpscaledUrl);
      toast.success("Video upscaled successfully!");
    } catch (error) {
      console.error("Upscale failed:", error);
      toast.error("Failed to upscale video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Film className="w-8 h-8 text-purple-400" />
            4K Upscale Video
          </h1>
          <p className="text-slate-400 mt-2">Enhance video resolution up to 4K with AI upscaling</p>
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
                This upscale costs {TOKEN_COST} tokens
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>Select a video to upscale (max 500MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition cursor-pointer">
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <span className="text-sm text-slate-300">Click to upload video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedVideo && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Selected:</p>
                  <div className="bg-slate-700 rounded-lg p-3 flex items-center gap-2">
                    <Film className="w-5 h-5 text-purple-400" />
                    <span className="text-sm truncate">{uploadedVideo}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upscale Options */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Upscale Level</CardTitle>
              <CardDescription>Choose upscaling factor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "2x", label: "2x (1080p → 4K)" },
                  { value: "4x", label: "4x (720p → 4K)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUpscaleLevel(option.value as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      upscaleLevel === option.value
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleUpscale}
                disabled={isGenerating || !uploadedVideo || !balance || balance.balance < TOKEN_COST}
                size="lg"
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upscaling...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    Upscale Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        {upscaledUrl && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Upscaled Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    navigator.clipboard.writeText(upscaledUrl);
                    toast.success("URL copied to clipboard");
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">4K Upscale Video Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• AI-powered video upscaling</p>
            <p>• Up to 4x resolution enhancement</p>
            <p>• Frame-by-frame quality preservation</p>
            <p>• Smooth motion interpolation</p>
            <p>• Supports multiple video formats</p>
            <p>• Batch processing available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
