import { NextResponse } from "next/server";
import { listPolls } from "@/lib/dbPolls";

export async function GET() {
    const polls = await listPolls();
    return NextResponse.json(polls);
}