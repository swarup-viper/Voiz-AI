import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Enforce dynamic execution on every request (no static caching)
export const dynamic = "force-dynamic";

interface InsightRow {
  id: string;
  feedback_id: string;
  theme: string | null;
  category: string | null;
  type: "complaint" | "suggestion" | "praise" | string | null;
  sentiment: "negative" | "neutral" | "positive" | string | null;
  urgency: number | null;
  who_affected: string | null;
  evidence_quote: string | null;
  quote_verified: boolean | null;
  created_at: string;
}

interface EvidenceItem {
  feedback_id: string;
  quote: string;
  verified: boolean;
}

interface Opportunity {
  theme: string;
  category: string;
  mentions: number;
  complaints: number;
  suggestions: number;
  praise: number;
  avg_urgency: number;
  priority_score: number;
  who_affected: string[];
  evidence: EvidenceItem[];
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          error: "Supabase credentials are not configured",
          details:
            "Please create a .env.local file in the project root containing your real SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then restart the server (npm run dev).",
        },
        { status: 500 }
      );
    }

    // 1. Fetch all insights from the database
    const { data: insights, error } = await supabase
      .from("insights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/opportunities] Failed to query insights:", error);
      return NextResponse.json(
        {
          error: "Failed to retrieve insights from database",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!insights || insights.length === 0) {
      return NextResponse.json({
        total_insights: 0,
        opportunities: [],
      });
    }

    // 2. Group insights by lowercased theme
    const themeMap = new Map<
      string,
      {
        displayTheme: string;
        categories: string[];
        items: InsightRow[];
      }
    >();

    for (const item of insights as InsightRow[]) {
      const rawTheme = (item.theme || "").trim();
      if (!rawTheme) continue;

      const lowerKey = rawTheme.toLowerCase();
      if (!themeMap.has(lowerKey)) {
        themeMap.set(lowerKey, {
          displayTheme: rawTheme, // Keep canonical casing from first occurrence
          categories: [],
          items: [],
        });
      }

      const group = themeMap.get(lowerKey)!;
      if (item.category) {
        group.categories.push(item.category);
      }
      group.items.push(item);
    }

    // 3. Aggregate each theme into an opportunity object
    const opportunities: Opportunity[] = [];

    for (const [, group] of themeMap) {
      const mentions = group.items.length;
      let complaints = 0;
      let suggestions = 0;
      let praise = 0;
      let totalUrgency = 0;

      const whoAffectedSet = new Set<string>();
      const evidenceList: EvidenceItem[] = [];

      // Determine the most common category for this theme
      const categoryFrequency = new Map<string, number>();
      for (const cat of group.categories) {
        categoryFrequency.set(cat, (categoryFrequency.get(cat) || 0) + 1);
      }
      let topCategory = "other";
      let maxCount = 0;
      for (const [cat, count] of categoryFrequency) {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat;
        }
      }

      for (const item of group.items) {
        if (item.type === "complaint") complaints++;
        else if (item.type === "suggestion") suggestions++;
        else if (item.type === "praise") praise++;

        totalUrgency += item.urgency ?? 3;

        // Collect unique who_affected phrases
        if (item.who_affected && item.who_affected.trim().length > 0) {
          whoAffectedSet.add(item.who_affected.trim());
        }

        // Collect evidence quotes
        if (item.evidence_quote && item.evidence_quote.trim().length > 0) {
          evidenceList.push({
            feedback_id: item.feedback_id,
            quote: item.evidence_quote.trim(),
            verified: Boolean(item.quote_verified),
          });
        }
      }

      // Calculate avg_urgency rounded to 1 decimal place
      const avg_urgency =
        mentions > 0 ? Math.round((totalUrgency / mentions) * 10) / 10 : 0;

      // Priority score: mentions * avg_urgency (0 if the theme is entirely praise)
      const isAllPraise = praise === mentions && mentions > 0;
      const priority_score = isAllPraise
        ? 0
        : Math.round(mentions * avg_urgency * 10) / 10;

      // Up to 5 unique who_affected entries
      const who_affected = Array.from(whoAffectedSet).slice(0, 5);

      // Up to 3 evidence quotes (prioritize verified quotes)
      evidenceList.sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0));
      const evidence = evidenceList.slice(0, 3);

      opportunities.push({
        theme: group.displayTheme,
        category: topCategory,
        mentions,
        complaints,
        suggestions,
        praise,
        avg_urgency,
        priority_score,
        who_affected,
        evidence,
      });
    }

    // 4. Sort by priority_score descending (with mentions as secondary tie-breaker)
    opportunities.sort((a, b) => {
      if (b.priority_score !== a.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return b.mentions - a.mentions;
    });

    // 5. Return final opportunities map
    return NextResponse.json({
      total_insights: insights.length,
      opportunities,
    });
  } catch (error) {
    console.error("[GET /api/opportunities] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
