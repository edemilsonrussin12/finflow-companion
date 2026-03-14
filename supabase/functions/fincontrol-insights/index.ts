import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { financialData, page } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const pageContextMap: Record<string, string> = {
      dashboard: "Gere 3 insights curtos sobre a saúde financeira geral, evolução do patrimônio e resumo do mês.",
      financas: "Gere 3 insights curtos sobre análise de gastos, comparação de despesas entre categorias e oportunidades de economia.",
      investimentos: "Gere 3 insights curtos sobre evolução de aportes, crescimento de patrimônio investido e diversificação.",
      orcamentos: "Gere 3 insights curtos com sugestões de fechamento de vendas, dicas de precificação ou parcelamento.",
      engenharia: "Gere 3 insights curtos de incentivo à conclusão de módulos e explicações educacionais sobre riqueza.",
    };

    const pageContext = pageContextMap[page] || pageContextMap.dashboard;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `Você é o Assistente FinControl. Gere insights financeiros curtos e educativos baseados nos dados do usuário.

REGRAS:
- Cada insight deve ter no máximo 1-2 frases.
- Seja específico usando os números fornecidos.
- Use tom positivo e educativo.
- NUNCA prometa lucros garantidos.
- Retorne EXATAMENTE um JSON array com objetos {text, type} onde type é "positive", "negative" ou "neutral".
- Retorne APENAS o JSON, sem markdown, sem código, sem explicação.`,
            },
            {
              role: "user",
              content: `${pageContext}

Dados financeiros:
${JSON.stringify(financialData, null, 2)}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_insights",
                description: "Generate financial insights based on user data",
                parameters: {
                  type: "object",
                  properties: {
                    insights: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          text: { type: "string" },
                          type: { type: "string", enum: ["positive", "negative", "neutral"] },
                        },
                        required: ["text", "type"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["insights"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_insights" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit", insights: [] }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ insights: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    let insights: any[] = [];
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        insights = parsed.insights || [];
      }
    } catch {
      // Fallback: try parsing content directly
      try {
        const content = data.choices?.[0]?.message?.content || "";
        insights = JSON.parse(content);
      } catch {
        insights = [];
      }
    }

    return new Response(
      JSON.stringify({ insights: insights.slice(0, 3) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("insights error:", e);
    return new Response(
      JSON.stringify({ insights: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
