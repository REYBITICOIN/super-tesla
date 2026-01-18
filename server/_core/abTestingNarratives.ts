/**
 * Sistema de Teste A/B de Narrativas
 * Testa diferentes narrativas e mede qual gera mais engajamento
 */

export interface VarianteNarrativa {
  id: string;
  teste_id: string;
  nome: string;
  narrativa: string;
  plataforma: string;
  porcentagem_trafego: number; // 0-100
}

export interface MetricaVariante {
  variante_id: string;
  impressoes: number;
  cliques: number;
  engajamentos: number; // likes + comments + shares
  conversoes: number;
  taxa_clique: number; // CTR
  taxa_engajamento: number; // ER
  taxa_conversao: number;
}

export interface TesteAB {
  id: string;
  nome: string;
  descricao: string;
  plataforma: string;
  variantes: VarianteNarrativa[];
  metricas: Map<string, MetricaVariante>;
  data_inicio: Date;
  data_fim?: Date;
  ativo: boolean;
  vencedor?: string; // ID da variante vencedora
}

class GerenciadorTesteAB {
  private testes: Map<string, TesteAB> = new Map();

  /**
   * Criar novo teste A/B
   */
  criarTeste(
    nome: string,
    descricao: string,
    plataforma: string,
    variantes: Omit<VarianteNarrativa, "id" | "teste_id">[]
  ): TesteAB | null {
    if (variantes.length < 2) {
      console.warn("[A/B] Teste deve ter no mínimo 2 variantes");
      return null;
    }

    const testeId = `teste-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Dividir tráfego igualmente entre variantes
    const porcentagemPorVariante = 100 / variantes.length;

    const variantesComId: VarianteNarrativa[] = variantes.map(
      (v, index) => ({
        ...v,
        id: `variante-${testeId}-${index}`,
        teste_id: testeId,
        porcentagem_trafego: porcentagemPorVariante,
      })
    );

    const teste: TesteAB = {
      id: testeId,
      nome,
      descricao,
      plataforma,
      variantes: variantesComId,
      metricas: new Map(),
      data_inicio: new Date(),
      ativo: true,
    };

    // Inicializar métricas para cada variante
    for (const variante of variantesComId) {
      teste.metricas.set(variante.id, {
        variante_id: variante.id,
        impressoes: 0,
        cliques: 0,
        engajamentos: 0,
        conversoes: 0,
        taxa_clique: 0,
        taxa_engajamento: 0,
        taxa_conversao: 0,
      });
    }

    this.testes.set(testeId, teste);
    console.log(`[A/B] Teste criado: ${testeId}`);
    return teste;
  }

  /**
   * Registrar métrica para uma variante
   */
  registrarMetrica(
    varianteId: string,
    tipo: "impressao" | "clique" | "engajamento" | "conversao"
  ): void {
    // Encontrar a métrica correspondente
    let metricaEncontrada: MetricaVariante | null = null;
    let testeEncontrado: TesteAB | null = null;

    this.testes.forEach((teste: TesteAB) => {
      const metrica = teste.metricas.get(varianteId);
      if (metrica) {
        metricaEncontrada = metrica;
        testeEncontrado = teste;
      }
    });

    if (!metricaEncontrada || !testeEncontrado) {
      console.warn(`[A/B] Variante não encontrada: ${varianteId}`);
      return;
    }

    // Atualizar métrica
    switch (tipo) {
      case "impressao":
        (metricaEncontrada as MetricaVariante).impressoes++;
        break;
      case "clique":
        (metricaEncontrada as MetricaVariante).cliques++;
        break;
      case "engajamento":
        (metricaEncontrada as MetricaVariante).engajamentos++;
        break;
      case "conversao":
        (metricaEncontrada as MetricaVariante).conversoes++;
        break;
    }

    // Atualizar no mapa
    (testeEncontrado as TesteAB).metricas.set(varianteId, metricaEncontrada);

    // Recalcular taxas
    this.recalcularTaxas(metricaEncontrada);
  }

  /**
   * Recalcular taxas de uma métrica
   */
  private recalcularTaxas(metrica: MetricaVariante): void {
    metrica.taxa_clique =
      metrica.impressoes > 0
        ? (metrica.cliques / metrica.impressoes) * 100
        : 0;
    metrica.taxa_engajamento =
      metrica.impressoes > 0
        ? (metrica.engajamentos / metrica.impressoes) * 100
        : 0;
    metrica.taxa_conversao =
      metrica.cliques > 0 ? (metrica.conversoes / metrica.cliques) * 100 : 0;
  }

  /**
   * Obter teste por ID
   */
  obterTeste(testeId: string): TesteAB | null {
    return this.testes.get(testeId) || null;
  }

  /**
   * Listar todos os testes
   */
  listarTestes(): TesteAB[] {
    const testes: TesteAB[] = [];
    this.testes.forEach((t) => testes.push(t));
    return testes;
  }

  /**
   * Listar testes ativos
   */
  listarTestesAtivos(): TesteAB[] {
    const testes: TesteAB[] = [];
    this.testes.forEach((t) => {
      if (t.ativo) {
        testes.push(t);
      }
    });
    return testes;
  }

  /**
   * Finalizar teste e determinar vencedor
   */
  finalizarTeste(testeId: string): string | null {
    const teste = this.obterTeste(testeId);

    if (!teste) {
      console.warn(`[A/B] Teste não encontrado: ${testeId}`);
      return null;
    }

    // Encontrar variante com melhor taxa de engajamento
    let vencedor: string | null = null;
    let melhorTaxa = -1;

    teste.variantes.forEach((variante) => {
      const metrica = teste.metricas.get(variante.id);
      if (metrica && metrica.taxa_engajamento > melhorTaxa) {
        melhorTaxa = metrica.taxa_engajamento;
        vencedor = variante.id;
      }
    });

    teste.ativo = false;
    teste.data_fim = new Date();
    teste.vencedor = vencedor || undefined;

    console.log(
      `[A/B] Teste finalizado: ${testeId}, Vencedor: ${vencedor}`
    );
    return vencedor;
  }

  /**
   * Obter variante aleatória para um teste
   */
  obterVarianteAleatoria(testeId: string): VarianteNarrativa | null {
    const teste = this.obterTeste(testeId);

    if (!teste || !teste.ativo) {
      return null;
    }

    const aleatorio = Math.random() * 100;
    let acumulado = 0;

    for (const variante of teste.variantes) {
      acumulado += variante.porcentagem_trafego;
      if (aleatorio <= acumulado) {
        return variante;
      }
    }

    return teste.variantes[0] || null;
  }

  /**
   * Obter relatório de teste
   */
  obterRelatorio(testeId: string): {
    teste: TesteAB | null;
    variantes_com_metricas: Array<{
      variante: VarianteNarrativa;
      metrica: MetricaVariante;
      posicao: number;
    }>;
    vencedor: VarianteNarrativa | null;
    confianca_estatistica: number;
  } | null {
    const teste = this.obterTeste(testeId);

    if (!teste) {
      return null;
    }

    // Ordenar variantes por taxa de engajamento
    const variantesComMetricas = teste.variantes
      .map((variante) => ({
        variante,
        metrica: teste.metricas.get(variante.id)!,
      }))
      .sort(
        (a, b) =>
          b.metrica.taxa_engajamento - a.metrica.taxa_engajamento
      )
      .map((item, index) => ({
        ...item,
        posicao: index + 1,
      }));

    // Calcular confiança estatística (simulado)
    const confianca = this.calcularConfiancaEstatistica(
      variantesComMetricas[0]?.metrica,
      variantesComMetricas[1]?.metrica
    );

    const vencedor = teste.vencedor
      ? teste.variantes.find((v) => v.id === teste.vencedor) || null
      : null;

    return {
      teste,
      variantes_com_metricas: variantesComMetricas,
      vencedor,
      confianca_estatistica: confianca,
    };
  }

  /**
   * Calcular confiança estatística entre duas variantes
   */
  private calcularConfiancaEstatistica(
    metrica1?: MetricaVariante,
    metrica2?: MetricaVariante
  ): number {
    if (!metrica1 || !metrica2) {
      return 0;
    }

    // Fórmula simplificada de confiança
    const diferenca = Math.abs(
      metrica1.taxa_engajamento - metrica2.taxa_engajamento
    );
    const media =
      (metrica1.taxa_engajamento + metrica2.taxa_engajamento) / 2;

    if (media === 0) {
      return 0;
    }

    const confianca = Math.min(
      100,
      (diferenca / media) * 100 * Math.sqrt(metrica1.impressoes)
    );
    return Math.round(confianca);
  }

  /**
   * Obter recomendação de ação
   */
  obterRecomendacao(testeId: string): string {
    const relatorio = this.obterRelatorio(testeId);

    if (!relatorio) {
      return "Teste não encontrado";
    }

    const { variantes_com_metricas, confianca_estatistica } = relatorio;

    if (variantes_com_metricas.length === 0) {
      return "Sem dados suficientes";
    }

    const melhor = variantes_com_metricas[0];
    const segunda = variantes_com_metricas[1];

    if (confianca_estatistica < 50) {
      return "Continue o teste para obter mais dados";
    }

    if (confianca_estatistica >= 95) {
      return `Use a variante "${melhor.variante.nome}" - ${confianca_estatistica}% de confiança`;
    }

    return `A variante "${melhor.variante.nome}" está ganhando com ${confianca_estatistica}% de confiança`;
  }

  /**
   * Deletar teste
   */
  deletarTeste(testeId: string): boolean {
    return this.testes.delete(testeId);
  }

  /**
   * Obter estatísticas gerais
   */
  obterEstatisticas() {
    const testes = this.listarTestes();
    const testesAtivos = this.listarTestesAtivos();

    return {
      total_testes: testes.length,
      testes_ativos: testesAtivos.length,
      testes_finalizados: testes.length - testesAtivos.length,
      total_variantes: testes.reduce((sum, t) => sum + t.variantes.length, 0),
    };
  }

  // Mapa privado para armazenar métricas
  private metricas: Map<string, MetricaVariante> = new Map();
}

// Instância singleton
export const gerenciadorTesteAB = new GerenciadorTesteAB();
