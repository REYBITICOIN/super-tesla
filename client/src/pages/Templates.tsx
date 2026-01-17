import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { translations as t } from "@/lib/translations";

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  duration: string;
  favorite: boolean;
}

const TEMPLATES: Template[] = [
  // Intros
  {
    id: "1",
    name: "Intro Neon",
    category: "intros",
    thumbnail: "https://via.placeholder.com/200x120?text=Intro+Neon",
    duration: "3s",
    favorite: true,
  },
  {
    id: "2",
    name: "Intro Dinâmica",
    category: "intros",
    thumbnail: "https://via.placeholder.com/200x120?text=Intro+Din%C3%A2mica",
    duration: "5s",
    favorite: false,
  },
  {
    id: "3",
    name: "Intro Minimalista",
    category: "intros",
    thumbnail: "https://via.placeholder.com/200x120?text=Intro+Minimalista",
    duration: "2s",
    favorite: false,
  },
  // Transições
  {
    id: "4",
    name: "Transição Fade",
    category: "transitions",
    thumbnail: "https://via.placeholder.com/200x120?text=Fade",
    duration: "1s",
    favorite: true,
  },
  {
    id: "5",
    name: "Transição Zoom",
    category: "transitions",
    thumbnail: "https://via.placeholder.com/200x120?text=Zoom",
    duration: "1s",
    favorite: false,
  },
  {
    id: "6",
    name: "Transição Slide",
    category: "transitions",
    thumbnail: "https://via.placeholder.com/200x120?text=Slide",
    duration: "1s",
    favorite: false,
  },
  // Efeitos
  {
    id: "7",
    name: "Efeito Brilho",
    category: "effects",
    thumbnail: "https://via.placeholder.com/200x120?text=Brilho",
    duration: "2s",
    favorite: false,
  },
  {
    id: "8",
    name: "Efeito Partículas",
    category: "effects",
    thumbnail: "https://via.placeholder.com/200x120?text=Part%C3%ADculas",
    duration: "3s",
    favorite: true,
  },
  {
    id: "9",
    name: "Efeito Glitch",
    category: "effects",
    thumbnail: "https://via.placeholder.com/200x120?text=Glitch",
    duration: "2s",
    favorite: false,
  },
];

export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState(TEMPLATES);
  const [activeTab, setActiveTab] = useState("all");

  if (!user) return null;

  const toggleFavorite = (id: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === id ? { ...t, favorite: !t.favorite } : t
      )
    );
  };

  const handleUseTemplate = (templateName: string) => {
    toast.success(`Usando template: ${templateName}`);
  };

  const filteredTemplates =
    activeTab === "all"
      ? templates
      : activeTab === "favorites"
        ? templates.filter((t) => t.favorite)
        : templates.filter((t) => t.category === activeTab);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "intros":
        return t.templates.intros;
      case "transitions":
        return t.templates.transitions;
      case "effects":
        return t.templates.effects;
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Biblioteca de Templates</h1>
          <p className="text-slate-400 mt-2">
            Use templates prontos para acelerar sua criação de conteúdo
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="intros">{t.templates.intros}</TabsTrigger>
            <TabsTrigger value="transitions">{t.templates.transitions}</TabsTrigger>
            <TabsTrigger value="effects">{t.templates.effects}</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-slate-800 border-slate-700 overflow-hidden hover:border-slate-600 transition group"
                >
                  <div className="relative overflow-hidden bg-slate-700 h-32">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                    <button
                      onClick={() => handleUseTemplate(template.name)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Play className="w-12 h-12 text-white" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          template.favorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-white">{template.name}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">
                        {getCategoryLabel(template.category)} • {template.duration}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleUseTemplate(template.name)}
                        className="flex-1 gap-2"
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                        Usar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-3"
                      >
                        Customizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center text-slate-400">
                  Nenhum template encontrado nesta categoria
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Criar Template Personalizado */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700">
          <CardHeader>
            <CardTitle>Criar Template Personalizado</CardTitle>
            <CardDescription>
              Salve suas criações como template para reutilizar depois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Novo Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
