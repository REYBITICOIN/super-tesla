import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Mic2, Volume2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const TOKEN_COST = 20;

const VOICES = [
  { id: "en-US-AriaNeural", label: "Aria (Female, US)" },
  { id: "en-US-GuyNeural", label: "Guy (Male, US)" },
  { id: "en-US-AmberNeural", label: "Amber (Female, US)" },
  { id: "en-GB-SoniaNeural", label: "Sonia (Female, UK)" },
  { id: "en-GB-RyanNeural", label: "Ryan (Male, UK)" },
];

export default function TextToSpeech() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("en-US-AriaNeural");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const { data: balance } = trpc.tokens.getBalance.useQuery();
  const generateSpeechMutation = trpc.ai.generateSpeech.useMutation();

  if (!user) return null;

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please enter text");
      return;
    }

    if (text.length > 5000) {
      toast.error("Text is too long (max 5000 characters)");
      return;
    }

    if (!balance || balance.balance < TOKEN_COST) {
      toast.error("Insufficient tokens for text-to-speech");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSpeechMutation.mutateAsync({
        text,
        voice,
      });

      setAudioUrl(result.s3Url);
      toast.success("Speech generated successfully!");
    } catch (error) {
      console.error("Generation failed:", error);
      toast.error("Failed to generate speech");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndContinue = () => {
    setText("");
    setAudioUrl(null);
    setTimeout(() => {
      navigate("/gallery");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">Text-to-Speech</h1>
          <p className="text-slate-400 mt-2">Convert text to natural-sounding audio</p>
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

        {/* TTS Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Enter Your Text</CardTitle>
            <CardDescription>
              Write the text you want to convert to speech
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isGenerating}
              maxLength={5000}
              className="min-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <div className="text-xs text-slate-400">
              {text.length} / 5000 characters
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Voice</label>
              <Select value={voice} onValueChange={setVoice} disabled={isGenerating}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim() || !balance || balance.balance < TOKEN_COST}
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
                  <Mic2 className="w-4 h-4" />
                  Generate Speech
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Audio Player */}
        {audioUrl && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Generated Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <audio
                src={audioUrl}
                controls
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = audioUrl;
                    link.download = "generated-speech.mp3";
                    link.click();
                  }}
                >
                  Download
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveAndContinue}
                >
                  Save & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg">TTS Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>• Use natural language and clear sentences</p>
            <p>• Add punctuation for better pacing and intonation</p>
            <p>• Different voices have different characteristics</p>
            <p>• Longer texts may take more time to generate</p>
            <p>• Perfect for creating voiceovers, narration, and more</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
