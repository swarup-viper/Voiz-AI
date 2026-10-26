import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "online",
    project: "Feedback to Opportunity Map API",
    description: "Backend API for analyzing unstructured feedback and generating opportunity maps.",
    endpoints: {
      "GET /api/opportunities": "View the prioritized opportunity map aggregated from stored insights",
      "POST /api/analyze": "Ingest and analyze raw feedback items with Claude LLM (1 to 200 items)",
    },
  });
}
