import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPoll, vote as dbVote } from "@/lib/dbPolls";

type Params = { id: string };

function cookieKey(id: string) {
    return `voted_${id}`;
}

export async function POST(req: Request, ctx: { params: Promise<Params> }) {
    try {
        const { id } = await ctx.params;

        // Soft duplicate-vote guard (cookie)
        const cookieStore = await cookies();
        const key = cookieKey(id);
        const existing = cookieStore.get(key);

        let updated = await getPoll(id);
        if (!updated) {
            return NextResponse.json({ error: "Poll not found" }, { status: 404 });
        }

        let yourChoice: number | undefined = undefined;

        if (existing) {
            // Already voted previously — keep their stored choice
            const n = Number(existing.value);
            yourChoice = Number.isInteger(n) ? n : undefined;
        } else {
            // First vote this artist
            const { optionIndex } = (await req.json()) as { optionIndex: number };
            updated = await dbVote(id, optionIndex); // increment in DB
            yourChoice = optionIndex;

            // Persist the choice for this artist
            const res = NextResponse.json({ ...updated, alreadyVoted: false, yourChoice });
            res.cookies.set({
                name: key,
                value: String(optionIndex),
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 365, // 1 year
            });
            return res;
        }

        // If already voted, return poll with the stored yourChoice
        return NextResponse.json({ ...updated, alreadyVoted: true, yourChoice });
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? "Error" }, { status: 400 });
    }
}
