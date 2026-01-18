/**
 * Narrative Templates System
 * Gerencia templates de narrativas por nicho e gera narrativas adaptativas
 */

export interface NarrativeTemplate {
  id: string;
  niche: string;
  platform: "facebook" | "instagram" | "tiktok" | "youtube" | "all";
  title: string;
  description: string;
  template: string; // Template com placeholders: {product_name}, {price}, {description}, etc
  variables: string[]; // Lista de variáveis disponíveis
  tone: "professional" | "casual" | "energetic" | "humorous" | "inspirational";
  max_length: number; // Comprimento máximo da narrativa
  created_at: Date;
  updated_at: Date;
}

export interface GeneratedNarrative {
  id: string;
  template_id: string;
  niche: string;
  platform: string;
  narrative: string;
  variables_used: Record<string, string>;
  generated_at: Date;
}

class NarrativeTemplatesManager {
  private templates: Map<string, NarrativeTemplate> = new Map();
  private generatedNarratives: Map<string, GeneratedNarrative> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Inicializar templates padrão
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: NarrativeTemplate[] = [
      // MODA
      {
        id: "moda-1",
        niche: "moda",
        platform: "instagram",
        title: "Moda - Estilo Casual",
        description: "Template casual para roupas e acessórios",
        template:
          "✨ Novo em estoque: {product_name}! 👗\n\n{description}\n\n💰 Por apenas R$ {price}\n\n👉 Link na bio para comprar agora! #moda #estilo #shopping",
        variables: ["product_name", "description", "price"],
        tone: "casual",
        max_length: 300,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "moda-2",
        niche: "moda",
        platform: "tiktok",
        title: "Moda - Tendência Viral",
        description: "Template para TikTok com tendências",
        template:
          "POV: Você encontrou o {product_name} perfeito! 🔥\n\n{description}\n\nPor apenas R$ {price}! 💸\n\nLink na bio! #moda #tendência #viral #shopping",
        variables: ["product_name", "description", "price"],
        tone: "energetic",
        max_length: 250,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "moda-3",
        niche: "moda",
        platform: "facebook",
        title: "Moda - Promoção",
        description: "Template para promoções no Facebook",
        template:
          "🎉 PROMOÇÃO IMPERDÍVEL! 🎉\n\n{product_name}\n\n{description}\n\n💰 Apenas R$ {price}\n\n👉 Clique aqui e garanta o seu! Estoque limitado!",
        variables: ["product_name", "description", "price"],
        tone: "professional",
        max_length: 280,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // BELEZA
      {
        id: "beleza-1",
        niche: "beleza",
        platform: "instagram",
        title: "Beleza - Inspiração",
        description: "Template inspiracional para produtos de beleza",
        template:
          "💄 Transformação com {product_name}!\n\n{description}\n\n✨ Resultado garantido!\n\n💚 R$ {price}\n\nLink na bio! #beleza #skincare #makeup",
        variables: ["product_name", "description", "price"],
        tone: "inspirational",
        max_length: 280,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "beleza-2",
        niche: "beleza",
        platform: "tiktok",
        title: "Beleza - Antes e Depois",
        description: "Template para vídeos antes e depois",
        template:
          "Antes ❌ Depois ✅\n\n{product_name}: {description}\n\n💎 R$ {price}\n\nLink na bio para comprar! #beleza #transformação #viral",
        variables: ["product_name", "description", "price"],
        tone: "energetic",
        max_length: 250,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // TECNOLOGIA
      {
        id: "tech-1",
        niche: "tecnologia",
        platform: "youtube",
        title: "Tecnologia - Review",
        description: "Template para reviews de produtos tech",
        template:
          "Review: {product_name}\n\n{description}\n\nPreço: R$ {price}\n\nVantagens:\n✅ Qualidade superior\n✅ Durabilidade garantida\n✅ Melhor custo-benefício\n\nLink na descrição!",
        variables: ["product_name", "description", "price"],
        tone: "professional",
        max_length: 350,
        created_at: new Date(),
        updated_at: new Date(),
      },

      // ALIMENTOS
      {
        id: "alimentos-1",
        niche: "alimentos",
        platform: "instagram",
        title: "Alimentos - Delícia",
        description: "Template para produtos alimentares",
        template:
          "😋 Que delícia! {product_name}\n\n{description}\n\n🍽️ Perfeito para toda a família!\n\n💰 R$ {price}\n\nPeça agora! #alimentos #delícia #saudável",
        variables: ["product_name", "description", "price"],
        tone: "casual",
        max_length: 280,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    for (const template of defaultTemplates) {
      this.templates.set(template.id, template);
    }

    console.log(
      `[Templates] ${defaultTemplates.length} templates padrão carregados`
    );
  }

  /**
   * Adicionar novo template
   */
  addTemplate(template: Omit<NarrativeTemplate, "id" | "created_at" | "updated_at">): NarrativeTemplate {
    const newTemplate: NarrativeTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    console.log(`[Templates] Template adicionado: ${newTemplate.id}`);
    return newTemplate;
  }

  /**
   * Obter template por ID
   */
  getTemplate(id: string): NarrativeTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Listar templates por nicho
   */
  getTemplatesByNiche(niche: string): NarrativeTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.niche === niche
    );
  }

  /**
   * Listar templates por plataforma
   */
  getTemplatesByPlatform(platform: string): NarrativeTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.platform === platform || t.platform === "all"
    );
  }

  /**
   * Gerar narrativa a partir de template
   */
  generateNarrative(
    templateId: string,
    variables: Record<string, string>
  ): GeneratedNarrative | null {
    const template = this.getTemplate(templateId);

    if (!template) {
      console.warn(`[Templates] Template não encontrado: ${templateId}`);
      return null;
    }

    // Validar variáveis obrigatórias
    for (const variable of template.variables) {
      if (!variables[variable]) {
        console.warn(
          `[Templates] Variável obrigatória ausente: ${variable}`
        );
        return null;
      }
    }

    // Substituir placeholders
    let narrative = template.template;
    for (const [key, value] of Object.entries(variables)) {
      narrative = narrative.replace(new RegExp(`{${key}}`, "g"), value);
    }

    // Verificar comprimento máximo
    if (narrative.length > template.max_length) {
      console.warn(
        `[Templates] Narrativa excede comprimento máximo (${narrative.length}/${template.max_length})`
      );
      // Truncar se necessário
      narrative = narrative.substring(0, template.max_length - 3) + "...";
    }

    const generated: GeneratedNarrative = {
      id: `narrative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      template_id: templateId,
      niche: template.niche,
      platform: template.platform,
      narrative: narrative,
      variables_used: variables,
      generated_at: new Date(),
    };

    this.generatedNarratives.set(generated.id, generated);
    console.log(`[Templates] Narrativa gerada: ${generated.id}`);
    return generated;
  }

  /**
   * Gerar narrativa com LLM adaptativo (simulado)
   */
  async generateAdaptiveNarrative(
    niche: string,
    platform: string,
    variables: Record<string, string>,
    tone?: string
  ): Promise<string> {
    // Selecionar template mais apropriado
    const templates = this.getTemplatesByNiche(niche).filter(
      (t) => t.platform === platform || t.platform === "all"
    );

    if (templates.length === 0) {
      console.warn(
        `[Templates] Nenhum template encontrado para ${niche}/${platform}`
      );
      return "";
    }

    // Usar primeiro template disponível
    const selectedTemplate = templates[0];
    const generated = this.generateNarrative(selectedTemplate.id, variables);

    return generated?.narrative || "";
  }

  /**
   * Listar todos os templates
   */
  listTemplates(): NarrativeTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Deletar template
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Obter estatísticas
   */
  getStats() {
    const templates = Array.from(this.templates.values());
    const niches = new Set(templates.map((t) => t.niche));
    const platforms = new Set(templates.map((t) => t.platform));

    return {
      total_templates: templates.length,
      total_niches: niches.size,
      total_platforms: platforms.size,
      total_generated: this.generatedNarratives.size,
      niches: Array.from(niches),
      platforms: Array.from(platforms),
    };
  }

  /**
   * Obter narrativas geradas recentemente
   */
  getRecentNarratives(limit: number = 10): GeneratedNarrative[] {
    return Array.from(this.generatedNarratives.values())
      .sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime())
      .slice(0, limit);
  }
}

// Singleton instance
export const narrativeTemplates = new NarrativeTemplatesManager();
