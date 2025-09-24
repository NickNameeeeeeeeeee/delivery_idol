import { NextResponse } from "next/server";
import { getPoll } from "@/lib/dbPolls";
import { cookies } from "next/headers";

type Params = { id: string };

function cookieKey(id: string) {
    return `voted_${id}`;
}

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
    const { id } = await ctx.params;
    const poll = await getPoll(id);
    if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Read your previous choice (if any) from cookie
    const cookieStore = await cookies();
    const key = cookieKey(id);
    const c = cookieStore.get(key);
    const yourChoice =
        c && Number.isInteger(Number(c.value)) ? Number(c.value) : undefined;

    return NextResponse.json({ ...poll, yourChoice });
}