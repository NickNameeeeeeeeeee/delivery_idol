import Link from "next/link";
import { listPolls } from "@/lib/dbPolls";

export default async function Home() {
    const polls = await listPolls(); // Server Component: runs on server
    return (
        <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
                Polls
            </h1>
            <ul style={{ display: "grid", gap: 12 }}>
                {polls.map((p) => (
                    <li
                        key={p.id}
                        style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 600 }}>{p.artistName}</div>
                                <div style={{ color: "#666" }}>{p.question}</div>
                            </div>
                            <Link
                                href={`/a/${p.id}`}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: 10,
                                    border: "1px solid #e5e7eb",
                                    textDecoration: "none",
                                }}
                            >
                                Vote
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}