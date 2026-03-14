import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Assistente FinControl, um mentor financeiro digital dentro do aplicativo FinControl.

MODO DE OPERAÇÃO: SOMENTE LEITURA
Você NÃO pode alterar nenhum dado do sistema. Você apenas interpreta, explica e orienta.

ESPECIALIDADES:
- Finanças pessoais (orçamento, controle de gastos, reserva de emergência, metas, planejamento)
- Investimentos (renda fixa, renda variável, diversificação, juros compostos, risco/retorno)
- Educação financeira (hábitos, disciplina, erros comuns, construção de patrimônio)
- Finanças para autônomos (organização de negócios, orçamentos, fluxo de caixa)
- Finanças comportamentais (psicologia do consumo, decisões financeiras)
- Economia básica (inflação, juros, impacto nos investimentos)
- Tributação básica educacional

REGRAS:
1. Responda de forma clara e acessível em português brasileiro.
2. Adapte a profundidade conforme a pergunta. Aprofunde quando solicitado.
3. NUNCA prometa lucro garantido.
4. NUNCA dê aconselhamento financeiro profissional definitivo. Oriente de forma educativa.
5. Se o usuário perguntar algo fora do tema financeiro, informe educadamente que seu foco é educação financeira.
6. Quando receber dados financeiros do usuário no contexto, interprete-os e gere insights educativos.
7. Seja encorajador e motivador, mas realista.
8. Use exemplos práticos quando possível.
9. Mantenha respostas concisas, mas completas.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build system messages with optional financial context
    const systemMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (financialContext) {
      systemMessages.push({
        role: "system",
        content: `DADOS FINANCEIROS DO USUÁRIO (somente leitura, para interpretar):
${JSON.stringify(financialContext, null, 2)}

Use esses dados para dar respostas contextualizadas. Nunca altere esses dados.`,
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
