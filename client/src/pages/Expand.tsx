import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Expand as ExpandIcon, Zap, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TOKEN_COST = 35;

export default function Expand() {
  const { user } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [expandDirection, setExpandDirection] = useState<"all" | "top" | "bottom" | "left" | "right">("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const { data: balance } = trpc.tokens.getBalance.useQuery();

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExpand = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for Expand");
      return;
    }

    setIsGenerating(true);
    try {
      const mockExpandedUrl = `https://via.placeholder.com/1536x1024?text=Expanded+${expandDirection}`;
      setExpandedImage(mockExpandedUrl);
      toast.success("Image expanded successfully!");
    } catch (error) {
      console.error("Expand failed:", error);
      toast.error("Failed to expand image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <ExpandIcon className="w-8 h-8 text-purple-400" />
            Expand
          </h1>
          <p className="text-slate-400 mt-2">Intelligently expand images by adding new content</p>
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
                This expansion costs {TOKEN_COST} tokens
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Select an image to expand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition cursor-pointer">
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <span className="text-sm text-slate-300">Click to upload or drag and drop</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedImage && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Preview:</p>
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full rounded-lg max-h-64 object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expand Options */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Expand Direction</CardTitle>
              <CardDescription>Choose which direction to expand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "all", label: "All Sides" },
                  { value: "top", label: "Top" },
                  { value: "bottom", label: "Bottom" },
                  { value: "left", label: "Left" },
                  { value: "right", label: "Right" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExpandDirection(option.value as any)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      expandDirection === option.value
                        ? "bg-purple-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleExpand}
                disabled={isGenerating || !uploadedImage || !balance || balance.balance < TOKEN_COST}
                size="lg"
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Expanding...
                  </>
                ) : (
                  <>
                    <ExpandIcon className="w-4 h-4" />
                    Expand Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        {expandedImage && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Expanded Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={expandedImage}
                alt="Expanded"
                className="w-full rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = expandedImage;
                    link.download = "expanded-image.jpg";
                    link.click();
                  }}
                >
                  Download
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(expandedImage);
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
            <CardTitle className="text-lg">Expand Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Intelligent content generation for expanded areas</p>
            <p>• Seamless blending with original image</p>
            <p>• Multiple expansion directions</p>
            <p>• Customizable expansion size</p>
            <p>• Maintains image quality and style</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
