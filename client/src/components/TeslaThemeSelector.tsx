import { useTeslaTheme, type TeslaTheme } from '@/contexts/TeslaThemeContext';
import { Button } from '@/components/ui/button';
import { Zap, Moon, Sun, Cloud } from 'lucide-react';

export default function TeslaThemeSelector() {
  const { theme, setTheme } = useTeslaTheme();

  const themes: Array<{ id: TeslaTheme; label: string; icon: React.ReactNode; description: string }> = [
    {
      id: 'black',
      label: 'Preto',
      icon: <Moon className="w-4 h-4" />,
      description: 'Trajes formais de Tesla',
    },
    {
      id: 'white',
      label: 'Branco',
      icon: <Sun className="w-4 h-4" />,
      description: 'Camisas brancas',
    },
    {
      id: 'gray',
      label: 'Cinza',
      icon: <Cloud className="w-4 h-4" />,
      description: 'Luvas cinzas',
    },
    {
      id: 'electricity',
      label: 'Eletricidade',
      icon: <Zap className="w-4 h-4" />,
      description: 'Bobinas Tesla',
    },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {themes.map((t) => (
        <Button
          key={t.id}
          onClick={() => setTheme(t.id)}
          variant={theme === t.id ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          title={t.description}
        >
          {t.icon}
          {t.label}
        </Button>
      ))}
    </div>
  );
}
