import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { analyzeFeedback } from "@/lib/analyze";

// Ensure maximum execution time on Vercel Pro/Hobby serverless functions (up to 60s)
export const maxDuration = 60;

// Request body validation schema: 1 to 200 feedback items
const AnalyzeRequestSchema = z.object({
  audience_type: z.string().min(1, "audience_type is required"),
  items: z
    .array(
      z.object({
        text: z.string().min(1, "Feedback text cannot be empty"),
      })
    )
    .min(1, "At least 1 feedback item is required")
    .max(200, "Maximum 200 feedback items allowed per request"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const parseResult = AnalyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { audience_type, items } = parseResult.data;

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

    // 2. Insert raw feedback items into the `feedback` table and retrieve generated IDs
    const feedbackRows = items.map((item) => ({
      audience_type,
      text: item.text,
    }));

    const { data: insertedFeedback, error: insertFeedbackError } = await supabase
      .from("feedback")
      .insert(feedbackRows)
      .select("id, text");

    if (insertFeedbackError || !insertedFeedback) {
      console.error("[POST /api/analyze] Failed to store feedback:", insertFeedbackError);
      return NextResponse.json(
        {
          error: "Failed to store raw feedback in database",
          details: insertFeedbackError?.message,
        },
        { status: 500 }
      );
    }

    // 3. Run Claude LLM analysis on the items
    let insightsData;
    try {
      insightsData = await analyzeFeedback(
        audience_type,
        insertedFeedback.map((fb) => ({ id: fb.id, text: fb.text }))
      );
    } catch (llmError) {
      console.error("[POST /api/analyze] LLM analysis failed:", llmError);
      // Return 502 if the LLM fails as required
      return NextResponse.json(
        {
          error: "LLM analysis failed",
          details: llmError instanceof Error ? llmError.message : String(llmError),
        },
        { status: 502 }
      );
    }

    // 4. Insert generated insights into the `insights` table
    let savedInsights: unknown[] = [];
    if (insightsData.length > 0) {
      const { data: insertedInsights, error: insertInsightsError } = await supabase
        .from("insights")
        .insert(insightsData)
        .select();

      if (insertInsightsError) {
        console.error(
          "[POST /api/analyze] Failed to store insights:",
          insertInsightsError
        );
        return NextResponse.json(
          {
            error: "Failed to store generated insights in database",
            details: insertInsightsError.message,
          },
          { status: 500 }
        );
      }

      savedInsights = insertedInsights || [];
    }

    // 5. Return success response
    return NextResponse.json({
      received: items.length,
      insights_created: savedInsights.length,
      insights: savedInsights,
    });
  } catch (error) {
    console.error("[POST /api/analyze] Unexpected internal error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
