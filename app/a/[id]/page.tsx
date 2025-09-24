"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Poll = {
    id: string;
    artistName: string;
    question: string;
    options: string[];
    votes: number[];
};

export default function ArtistPage() {
    const { id } = useParams<{ id: string }>();
    const [poll, setPoll] = useState<Poll | null>(null);

    useEffect(() => {
        async function load() {
            const res = await fetch(`/api/polls/${id}`, { cache: "no-store" });
            if (res.ok) setPoll(await res.json());
        }
        if (id) load();
    }, [id]);

    if (!poll) return <main style={{ padding: 24 }}>Loading…</main>;

    return (
        <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
            <div style={{ marginBottom: 8 }}>
                <Link href="/">← Back</Link>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                {poll.artistName}
            </h1>
            <p style={{ color: "#666", marginBottom: 16 }}>{poll.question}</p>

            <div style={{ display: "grid", gap: 12 }}>
                {poll.options.map((opt, i) => (
                    <Link
                        key={i}
                        href={`/a/${id}/results?choice=${i}`}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            textDecoration: "none",
                            display: "block",
                        }}
                    >
                        {opt}
                    </Link>
                ))}
            </div>
        </main>
    );
}