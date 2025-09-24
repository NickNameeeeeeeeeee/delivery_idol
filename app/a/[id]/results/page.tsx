"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

type Poll = {
    id: string;
    artistName: string;
    question: string;
    options: string[];
    votes: number[];
    yourChoice?: number; // <-- new
};

function cookieKey(id: string) {
    return `voted_${id}`;
}
function hasVoteCookie(id: string) {
    return (
        typeof document !== "undefined" &&
        document.cookie.split("; ").some((c) => c.startsWith(cookieKey(id) + "="))
    );
}

export default function ResultsPage() {
    const { id } = useParams<{ id: string }>();
    const search = useSearchParams();
    const choiceParam = search.get("choice");
    const choiceIndex = useMemo(() => {
        const n = Number(choiceParam);
        return Number.isInteger(n) ? n : null;
    }, [choiceParam]);

    const [poll, setPoll] = useState<Poll | null>(null);
    const hasVotedRef = useRef(false); // prevent double POST on fast refresh

    async function load() {
        const res = await fetch(`/api/polls/${id}`, { cache: "no-store" });
        if (res.ok) setPoll(await res.json());
    }

    useEffect(() => {
        async function voteThenLoad() {
            // Only vote if a choice is present and there is NO vote cookie yet
            if (id && choiceIndex !== null && !hasVotedRef.current && !hasVoteCookie(id)) {
                hasVotedRef.current = true;
                await fetch(`/api/polls/${id}/vote`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ optionIndex: choiceIndex }),
                }).catch(() => {});
            }

            // Clean "?choice=..." from the URL so refresh doesn't look like a vote
            if (typeof window !== "undefined" && choiceParam !== null) {
                const url = new URL(window.location.href);
                url.searchParams.delete("choice");
                window.history.replaceState(null, "", url.toString());
            }

            await load();
        }
        voteThenLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, choiceIndex]);

    if (!poll) return <main style={{ padding: 24 }}>Loading…</main>;

    const total = poll.votes.reduce((a, b) => a + b, 0) || 0;
    const selected = (poll.yourChoice ?? choiceIndex); // prefer server cookie value

    return (
        <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Link href="/">All artists</Link>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                {poll.artistName} — Results
            </h1>
            <p style={{ color: "#666", marginBottom: 16 }}>{poll.question}</p>

            <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                {poll.options.map((opt, i) => {
                    const count = poll.votes[i] ?? 0;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    const isYourChoice = selected === i;
                    return (
                        <div key={i} style={{ display: "grid", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    {opt} {isYourChoice ? <span style={{ color: "#2563eb" }}>• your choice</span> : null}
                                </div>
                                <div>
                                    {count} ({pct}%)
                                </div>
                            </div>
                            <div style={{ height: 8, background: "#e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "#3b82f6" }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div>
                <b>Total votes:</b> {total}
            </div>
        </main>
    );
}