import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get all products from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error: dbError } = await supabase
      .from("products")
      .select("id, name, description, category, subcategory, hair_type, texture, colors, lengths, price, original_price, is_new, is_best_seller, rating, image")
      .limit(100);

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to fetch products");
    }

    // Use AI to understand the query and match products
    const systemPrompt = `You are a product search assistant for a hair/wig e-commerce store called HairyTalesBeauty. 
    
Your task is to analyze a customer's natural language search query and return the IDs of products that best match their request.

Here are the available products:
${JSON.stringify(products, null, 2)}

Analyze the user's query and understand their intent. Consider:
- Hair type (human hair, synthetic, etc.)
- Wig style (straight, curly, wavy, braided, etc.)
- Length preferences (short, medium, long, or specific inches)
- Color preferences
- Price range if mentioned
- Whether they want new arrivals or best sellers
- Any specific categories or features

Return ONLY a JSON object with this format:
{
  "matched_ids": ["id1", "id2", "id3"],
  "explanation": "Brief explanation of why these products match"
}

Return up to 10 most relevant product IDs. If no products match well, return an empty array with an explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("AI search failed");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", content);

    // Parse the AI response
    let result;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fall back to basic text search
      const searchLower = query.toLowerCase();
      const basicMatches = products?.filter((p: any) => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.hair_type?.toLowerCase().includes(searchLower)
      ).slice(0, 10) || [];
      
      result = {
        matched_ids: basicMatches.map((p: any) => p.id),
        explanation: "Showing text-based search results"
      };
    }

    // Fetch full product details for matched IDs
    const matchedIds = result.matched_ids || [];
    let matchedProducts: any[] = [];
    
    if (matchedIds.length > 0) {
      const { data: fullProducts, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .in("id", matchedIds);
      
      if (!fetchError && fullProducts) {
        // Preserve the order from AI response
        matchedProducts = matchedIds
          .map((id: string) => fullProducts.find((p: any) => p.id === id))
          .filter(Boolean);
      }
    }

    return new Response(
      JSON.stringify({
        products: matchedProducts,
        explanation: result.explanation,
        query: query
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Search failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
