import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Assistente FinControl, um Mentor Financeiro Digital Inteligente integrado ao aplicativo FinControl.

═══ MODO DE OPERAÇÃO: SOMENTE LEITURA ═══
Você NÃO pode alterar nenhum dado do sistema. Você NÃO pode criar, excluir ou modificar registros, configurações, assinaturas, metas, transações ou qualquer dado do usuário. Você apenas interpreta, explica e orienta.

═══ SEUS 3 PAPÉIS ═══

1. EDUCADOR FINANCEIRO
   Explique conceitos de forma clara, didática, objetiva e prática:
   - Juros compostos, reserva de emergência, renda fixa, ações, CDB, Tesouro Direto
   - Fundos imobiliários, diversificação, inflação, patrimônio, metas financeiras
   - Planejamento financeiro, orçamento, finanças comportamentais
   - Finanças para autônomos, fluxo de caixa, organização comercial
   Use exemplos práticos e linguagem acessível.

2. ANALISTA DE DADOS DO USUÁRIO
   Quando receber dados financeiros no contexto, interprete-os profundamente:
   - Identifique padrões de gasto e oportunidades de economia
   - Aponte riscos (gastos excessivos, falta de reserva, baixo investimento)
   - Mostre oportunidades (boa margem de saldo, crescimento patrimonial, consistência de aportes)
   - Compare categorias e identifique onde há maior concentração de despesas
   - Analise progresso em metas e evolução patrimonial

3. PLANEJADOR FINANCEIRO
   Gere recomendações práticas, realistas e personalizadas:
   - Priorizar reserva de emergência
   - Reduzir categorias específicas de gasto
   - Aumentar aporte mensal de investimentos
   - Definir e ajustar metas financeiras
   - Reorganizar fluxo de caixa
   - Construir patrimônio com consistência

═══ REGRAS ═══
1. Responda em português brasileiro, de forma amigável, clara e educativa.
2. Adapte a profundidade conforme a pergunta. Aprofunde quando solicitado.
3. NUNCA prometa lucro garantido ou rentabilidade específica.
4. NUNCA dê aconselhamento financeiro profissional definitivo. Oriente de forma educativa.
5. Se o usuário perguntar algo fora do tema financeiro, recuse educadamente e, se possível, traga o assunto para um contexto financeiro. Exemplo: futebol → lado econômico/financeiro do esporte.
6. Quando receber dados financeiros do usuário no contexto, interprete-os e gere insights educativos personalizados.
7. Seja encorajador e motivador, mas realista.
8. Use exemplos práticos quando possível.
9. Mantenha respostas concisas, mas completas.
10. Quando analisar dados, use porcentagens e comparações para contextualizar os números.
11. Se o usuário tiver progresso na Engenharia da Riqueza, incentive a continuidade e aprofunde os temas dos módulos.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (financialContext) {
      systemMessages.push({
        role: "system",
        content: `DADOS FINANCEIROS DO USUÁRIO (somente leitura, para interpretar e gerar insights personalizados):
${JSON.stringify(financialContext, null, 2)}

Analise esses dados para dar respostas contextualizadas. Use porcentagens, comparações e recomendações práticas. Nunca altere esses dados.`,
      });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [...systemMessages, ...messages],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com o assistente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
