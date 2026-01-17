import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TOKEN_COST = 30;

export default function ImageUpscale() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [imageUrl, setImageUrl] = useState("");
  const [scale, setScale] = useState("2");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: balance } = trpc.tokens.getBalance.useQuery();
  const upscaleMutation = trpc.ai.upscaleImage.useMutation();

  if (!user) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPreviewUrl(url);
        setImageUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpscale = async () => {
    if (!imageUrl) {
      toast.error("Please select an image");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for upscaling");
      return;
    }

    setIsGenerating(true);
    try {
      await upscaleMutation.mutateAsync({
        imageUrl,
        scale: parseInt(scale),
      });

      toast.success("Image upscaled successfully!");
      setImageUrl("");
      setPreviewUrl(null);
      
      setTimeout(() => {
        navigate("/gallery");
      }, 1500);
    } catch (error) {
      console.error("Upscale failed:", error);
      toast.error("Failed to upscale image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Image Upscale</h1>
          <p className="text-slate-400 mt-2">Enhance image resolution up to 4x</p>
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
                This upscale costs {TOKEN_COST} tokens
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upscale Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Select an image to upscale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload */}
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition cursor-pointer">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isGenerating}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-300">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg max-h-64 object-contain"
                />
              </div>
            )}

            {/* Scale Selection */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Upscale Factor</label>
              <Select value={scale} onValueChange={setScale} disabled={isGenerating}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="2">2x (2x resolution)</SelectItem>
                  <SelectItem value="3">3x (3x resolution)</SelectItem>
                  <SelectItem value="4">4x (4x resolution)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleUpscale}
              disabled={isGenerating || !imageUrl || !balance || balance.balance < TOKEN_COST}
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
                  <Zap className="w-4 h-4" />
                  Upscale Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">Upscaling Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Best results with high-quality source images</p>
            <p>• 4x upscaling produces the best results but takes longer</p>
            <p>• Works well with photos, artwork, and generated images</p>
            <p>• Upscaled images maintain quality and detail</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
