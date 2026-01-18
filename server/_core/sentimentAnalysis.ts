/**
 * Sistema de Análise de Sentimento em Comentários
 * Analisa sentimento de comentários e gera respostas automáticas
 */

import { invokeLLM } from "./llm";

export type Sentimento = "positivo" | "neutro" | "negativo";

export interface AnaliseSentimento {
  id: string;
  comentario: string;
  sentimento: Sentimento;
  confianca: number; // 0-100
  palavras_chave: string[];
  resposta_automatica?: string;
  plataforma: string;
  video_id: string;
  usuario_id: string;
  data_analise: Date;
}

export interface ConfiguracaoRespostas {
  plataforma: string;
  responder_positivos: boolean;
  responder_neutros: boolean;
  responder_negativos: boolean;
  tom_resposta: "profissional" | "casual" | "energico";
}

class AnalisadorSentimento {
  private analises: Map<string, AnaliseSentimento> = new Map();
  private configuracoes: Map<string, ConfiguracaoRespostas> = new Map();

  constructor() {
    this.inicializarConfiguracoes();
  }

  /**
   * Inicializar configurações padrão
   */
  private inicializarConfiguracoes(): void {
    const plataformas = ["facebook", "instagram", "tiktok", "youtube"];

    for (const plataforma of plataformas) {
      this.configuracoes.set(plataforma, {
        plataforma,
        responder_positivos: true,
        responder_neutros: false,
        responder_negativos: true,
        tom_resposta: "casual",
      });
    }

    console.log("[Sentimento] Configurações padrão inicializadas");
  }

  /**
   * Analisar sentimento de um comentário
   */
  async analisarComentario(
    comentario: string,
    plataforma: string,
    videoId: string,
    usuarioId: string
  ): Promise<AnaliseSentimento | null> {
    try {
      // Usar LLM para análise de sentimento
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um analisador de sentimento especializado em redes sociais. 
Analise o sentimento do comentário em português e responda em JSON com:
{
  "sentimento": "positivo" | "neutro" | "negativo",
  "confianca": número de 0 a 100,
  "palavras_chave": ["palavra1", "palavra2"],
  "resumo": "resumo breve do sentimento"
}`,
          },
          {
            role: "user",
            content: `Analise este comentário: "${comentario}"` as any,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "analise_sentimento",
            strict: true,
            schema: {
              type: "object",
              properties: {
                sentimento: {
                  type: "string",
                  enum: ["positivo", "neutro", "negativo"],
                },
                confianca: { type: "number", minimum: 0, maximum: 100 },
                palavras_chave: {
                  type: "array",
                  items: { type: "string" },
                },
                resumo: { type: "string" },
              },
              required: ["sentimento", "confianca", "palavras_chave"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        return null;
      }

      const analise = JSON.parse(content);

      const resultado: AnaliseSentimento = {
        id: `analise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        comentario,
        sentimento: analise.sentimento,
        confianca: analise.confianca,
        palavras_chave: analise.palavras_chave,
        plataforma,
        video_id: videoId,
        usuario_id: usuarioId,
        data_analise: new Date(),
      };

      // Gerar resposta automática se configurado
      const config = this.configuracoes.get(plataforma);
      if (config && this.deveResponder(resultado.sentimento, config)) {
        resultado.resposta_automatica = await this.gerarRespostaAutomatica(
          resultado,
          config
        );
      }

      this.analises.set(resultado.id, resultado);
      console.log(
        `[Sentimento] Análise concluída: ${resultado.sentimento} (${resultado.confianca}%)`
      );

      return resultado;
    } catch (erro) {
      console.error("[Sentimento] Erro ao analisar comentário:", erro);
      return null;
    }
  }

  /**
   * Verificar se deve responder baseado na configuração
   */
  private deveResponder(
    sentimento: Sentimento,
    config: ConfiguracaoRespostas
  ): boolean {
    switch (sentimento) {
      case "positivo":
        return config.responder_positivos;
      case "neutro":
        return config.responder_neutros;
      case "negativo":
        return config.responder_negativos;
      default:
        return false;
    }
  }

  /**
   * Gerar resposta automática com LLM
   */
  private async gerarRespostaAutomatica(
    analise: AnaliseSentimento,
    config: ConfiguracaoRespostas
  ): Promise<string> {
    try {
      const tonoDescricao = {
        profissional: "profissional e formal",
        casual: "casual e amigável",
        energico: "energético e entusiasmado",
      };

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um gerenciador de redes sociais especializado em ${config.plataforma}.
Gere uma resposta breve e ${tonoDescricao[config.tom_resposta]} ao comentário.
A resposta deve ter no máximo 150 caracteres.
Responda apenas com o texto da resposta, sem aspas ou formatação adicional.`,
          },
          {
            role: "user",
            content: `Comentário (${analise.sentimento}): "${analise.comentario}"` as any,
          },
        ],
      });

      const resposta = response.choices?.[0]?.message?.content;
      const respostaStr = typeof resposta === "string" ? resposta : "";
      return respostaStr.substring(0, 150);
    } catch (erro) {
      console.error("[Sentimento] Erro ao gerar resposta:", erro);
      return "";
    }
  }

  /**
   * Obter análise por ID
   */
  obterAnalise(id: string): AnaliseSentimento | null {
    return this.analises.get(id) || null;
  }

  /**
   * Listar análises por plataforma
   */
  listarPorPlataforma(plataforma: string): AnaliseSentimento[] {
    const analises: AnaliseSentimento[] = [];
    this.analises.forEach((a) => {
      if (a.plataforma === plataforma) {
        analises.push(a);
      }
    });
    return analises;
  }

  /**
   * Listar análises por sentimento
   */
  listarPorSentimento(sentimento: Sentimento): AnaliseSentimento[] {
    const analises: AnaliseSentimento[] = [];
    this.analises.forEach((a) => {
      if (a.sentimento === sentimento) {
        analises.push(a);
      }
    });
    return analises;
  }

  /**
   * Listar análises por vídeo
   */
  listarPorVideo(videoId: string): AnaliseSentimento[] {
    const analises: AnaliseSentimento[] = [];
    this.analises.forEach((a) => {
      if (a.video_id === videoId) {
        analises.push(a);
      }
    });
    return analises;
  }

  /**
   * Atualizar configuração de plataforma
   */
  atualizarConfiguracao(
    plataforma: string,
    config: Partial<ConfiguracaoRespostas>
  ): void {
    const configAtual = this.configuracoes.get(plataforma);
    if (configAtual) {
      this.configuracoes.set(plataforma, {
        ...configAtual,
        ...config,
      });
      console.log(`[Sentimento] Configuração atualizada para ${plataforma}`);
    }
  }

  /**
   * Obter configuração de plataforma
   */
  obterConfiguracao(plataforma: string): ConfiguracaoRespostas | null {
    return this.configuracoes.get(plataforma) || null;
  }

  /**
   * Obter estatísticas de sentimentos
   */
  obterEstatisticas(plataforma?: string): {
    total: number;
    positivos: number;
    neutros: number;
    negativos: number;
    taxa_positiva: number;
  } {
    const analises: AnaliseSentimento[] = [];
    this.analises.forEach((a) => {
      if (!plataforma || a.plataforma === plataforma) {
        analises.push(a);
      }
    });

    const total = analises.length;
    const positivos = analises.filter((a) => a.sentimento === "positivo")
      .length;
    const neutros = analises.filter((a) => a.sentimento === "neutro").length;
    const negativos = analises.filter((a) => a.sentimento === "negativo")
      .length;

    return {
      total,
      positivos,
      neutros,
      negativos,
      taxa_positiva: total > 0 ? (positivos / total) * 100 : 0,
    };
  }

  /**
   * Obter palavras-chave mais frequentes
   */
  obterPalavrasChaveFrequentes(limite: number = 10): {
    palavra: string;
    frequencia: number;
  }[] {
    const frequencia = new Map<string, number>();

    this.analises.forEach((analise) => {
      for (const palavra of analise.palavras_chave) {
        frequencia.set(palavra, (frequencia.get(palavra) || 0) + 1);
      }
    });

    const resultado: { palavra: string; frequencia: number }[] = [];
    frequencia.forEach((freq, palavra) => {
      resultado.push({ palavra, frequencia: freq });
    });

    return resultado
      .sort((a, b) => b.frequencia - a.frequencia)
      .slice(0, limite);
  }

  /**
   * Limpar análises antigas (mais de 30 dias)
   */
  limparAnalisesAntigas(): number {
    const agora = Date.now();
    const trinta_dias = 30 * 24 * 60 * 60 * 1000;
    let removidas = 0;
    const idsParaRemover: string[] = [];

    this.analises.forEach((analise, id) => {
      if (agora - analise.data_analise.getTime() > trinta_dias) {
        idsParaRemover.push(id);
      }
    });

    for (const id of idsParaRemover) {
      this.analises.delete(id);
      removidas++;
    }

    console.log(`[Sentimento] ${removidas} análises antigas removidas`);
    return removidas;
  }
}

// Instância singleton
export const analisadorSentimento = new AnalisadorSentimento();
