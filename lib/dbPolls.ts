// lib/dbPolls.ts
import { prisma } from "./prisma";

export type DbPoll = {
    id: string;
    artistName: string;
    question: string;
    options: string[];
    votes: number[];
};

// Concrete shapes returned from our SELECTs
type OptionRow = { id: number; text: string; votes: number };
type PollRow = {
    id: string;
    artistName: string;
    question: string;
    options: OptionRow[];
};

export async function listPolls(): Promise<DbPoll[]> {
    const polls: PollRow[] = await prisma.poll.findMany({
        orderBy: { id: "asc" },
        select: {
            id: true,
            artistName: true,
            question: true,
            options: {
                select: { id: true, text: true, votes: true },
                orderBy: { id: "asc" },
            },
        },
    });

    return polls.map((p: PollRow): DbPoll => ({
        id: p.id,
        artistName: p.artistName,
        question: p.question,
        options: p.options.map((o: OptionRow) => o.text),
        votes: p.options.map((o: OptionRow) => o.votes),
    }));
}

export async function getPoll(id: string): Promise<DbPoll | null> {
    const p: PollRow | null = await prisma.poll.findUnique({
        where: { id },
        select: {
            id: true,
            artistName: true,
            question: true,
            options: {
                select: { id: true, text: true, votes: true },
                orderBy: { id: "asc" },
            },
        },
    });
    if (!p) return null;

    return {
        id: p.id,
        artistName: p.artistName,
        question: p.question,
        options: p.options.map((o: OptionRow) => o.text),
        votes: p.options.map((o: OptionRow) => o.votes),
    };
}

export async function vote(id: string, optionIndex: number): Promise<DbPoll> {
    const poll: PollRow | null = await prisma.poll.findUnique({
        where: { id },
        select: {
            id: true,
            artistName: true,
            question: true,
            options: {
                select: { id: true, text: true, votes: true },
                orderBy: { id: "asc" },
            },
        },
    });
    if (!poll) throw new Error("Poll not found");
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
        throw new Error("Invalid option index");
    }

    const target: OptionRow = poll.options[optionIndex];
    await prisma.pollOption.update({
        where: { id: target.id },
        data: { votes: { increment: 1 } },
    });

    const updated = await getPoll(id);
    if (!updated) throw new Error("Poll not found after update");
    return updated;
}