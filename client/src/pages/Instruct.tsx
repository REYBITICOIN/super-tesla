import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Wand2, Zap, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TOKEN_COST = 40;

export default function Instruct() {
  const { user } = useAuth();
  const [instruction, setInstruction] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);

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

  const handleEdit = async () => {
    if (!instruction.trim()) {
      toast.error("Please enter an editing instruction");
      return;
    }

    if (!uploadedImage) {
      toast.error("Please upload an image first");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for Instruct");
      return;
    }

    setIsGenerating(true);
    try {
      const mockEditedUrl = `https://via.placeholder.com/1024x1024?text=${encodeURIComponent(instruction.substring(0, 20))}`;
      setEditedImage(mockEditedUrl);
      toast.success("Image edited successfully!");
    } catch (error) {
      console.error("Edit failed:", error);
      toast.error("Failed to edit image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Wand2 className="w-8 h-8 text-purple-400" />
            Instruct
          </h1>
          <p className="text-slate-400 mt-2">AI-assisted image editing with natural language instructions</p>
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
                This edit costs {TOKEN_COST} tokens
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Upload Image</CardTitle>
              <CardDescription>Select an image to edit</CardDescription>
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

          {/* Instruction Section */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Editing Instructions</CardTitle>
              <CardDescription>Describe what you want to change</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., Change the background to a beach, make the person smile, add a hat..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                disabled={isGenerating}
                className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />

              <Button
                onClick={handleEdit}
                disabled={isGenerating || !instruction.trim() || !uploadedImage || !balance || balance.balance < TOKEN_COST}
                size="lg"
                className="w-full gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Apply Edit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        {editedImage && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Edited Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={editedImage}
                alt="Edited"
                className="w-full rounded-lg"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = editedImage;
                    link.download = "edited-image.jpg";
                    link.click();
                  }}
                >
                  Download
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(editedImage);
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
            <CardTitle className="text-lg">Instruct Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Natural language image editing</p>
            <p>• Object removal and addition</p>
            <p>• Background replacement</p>
            <p>• Style transfer</p>
            <p>• Precise control over edits</p>
            <p>• Batch editing support</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
