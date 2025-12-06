import { NextRequest, NextResponse } from "next/server";
import { handleTriggerHTTPRequest } from "@trigger.dev/nextjs";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleTriggerHTTPRequest(request);
}

export async function GET(request: NextRequest) {
  return handleTriggerHTTPRequest(request);
}

