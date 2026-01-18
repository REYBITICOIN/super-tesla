import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  tokens: number;
  features: string[];
  popular?: boolean;
  color: string;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Iniciante',
    price: 29,
    tokens: 5000,
    features: [
      '5.000 tokens',
      'Acesso a todas as ferramentas',
      'Suporte por email',
      'Histórico de 30 dias',
      'Exportação básica',
    ],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 79,
    tokens: 20000,
    features: [
      '20.000 tokens',
      'Acesso prioritário a novas ferramentas',
      'Suporte prioritário',
      'Histórico ilimitado',
      'Exportação avançada',
      'Templates profissionais',
      'Agendamento de postagens',
    ],
    popular: true,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    tokens: 100000,
    features: [
      '100.000 tokens',
      'Acesso antecipado a beta features',
      'Suporte 24/7 dedicado',
      'Histórico ilimitado',
      'Exportação premium',
      'Templates ilimitados',
      'Agendamento ilimitado',
      'API access',
      'Colaboração em equipe',
    ],
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (planId: string) => {
    if (!isAuthenticated) {
      alert('Faça login para continuar');
      return;
    }

    setLoading(true);
    try {
      // Simular checkout com Stripe
      const plan = plans.find((p) => p.id === planId);
      alert(`Redirecionando para checkout do plano ${plan?.name}...`);
      // Em produção, isso seria uma chamada real para criar uma sessão Stripe
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-950/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            💎 Planos de Tokens
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Escolha o plano perfeito para suas necessidades de criação de conteúdo com IA
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative ${plan.popular ? 'md:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    ⭐ Mais Popular
                  </span>
                </div>
              )}

              <Card
                className={`p-8 h-full flex flex-col bg-background/50 backdrop-blur border-2 transition hover:border-opacity-100 ${
                  plan.popular
                    ? `border-gradient-to-r border-purple-500`
                    : 'border-blue-500/20 hover:border-blue-500/40'
                }`}
              >
                {/* Plan Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      R$ {plan.price}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.tokens.toLocaleString()} tokens
                  </p>
                </div>

                {/* Features */}
                <div className="flex-1 mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading}
                  className={`w-full h-12 font-bold ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  }`}
                >
                  {loading ? (
                    'Processando...'
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Comprar Agora
                    </>
                  )}
                </Button>

                {/* Billing Info */}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Renovação automática. Cancele a qualquer momento.
                </p>
              </Card>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-background/50 backdrop-blur border border-blue-500/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-8 text-blue-400">❓ Perguntas Frequentes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-2">Como funcionam os tokens?</h3>
              <p className="text-sm text-muted-foreground">
                Cada operação (gerar imagem, vídeo, etc) consome uma quantidade específica de tokens. Você pode usar seus tokens em qualquer ferramenta.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem penalidades. Seus tokens restantes não expiram.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">E se eu precisar de mais tokens?</h3>
              <p className="text-sm text-muted-foreground">
                Você pode fazer upgrade para um plano superior a qualquer momento. A diferença será creditada proporcionalmente.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">Existe suporte para equipes?</h3>
              <p className="text-sm text-muted-foreground">
                Sim! O plano Premium inclui colaboração em equipe. Entre em contato para planos enterprise customizados.
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan Info */}
        {isAuthenticated && user && (
          <Card className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <h3 className="font-bold text-green-400 mb-2">✅ Seu Plano Atual</h3>
            <p className="text-sm text-muted-foreground">
              Usuário: <strong>{user.name}</strong> | Tokens: <strong>1.000</strong> | Próxima renovação: <strong>15 de fevereiro</strong>
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
