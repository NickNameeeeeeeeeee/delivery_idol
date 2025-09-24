// lib/pollStore.ts
export type Poll = {
    id: string;          // also the artist slug
    artistName: string;  // display name
    question: string;
    options: string[];
    votes: number[];
};

class PollStore {
    private polls = new Map<string, Poll>();

    constructor(seed: Array<Omit<Poll, "votes">>) {
        seed.forEach(p =>
            this.polls.set(p.id, { ...p, votes: Array(p.options.length).fill(0) })
        );
    }

    list(): Poll[] {
        return Array.from(this.polls.values());
    }

    get(id: string) {
        return this.polls.get(id);
    }

    vote(id: string, optionIndex: number) {
        const poll = this.polls.get(id);
        if (!poll) throw new Error("Poll not found");
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            throw new Error("Invalid option index");
        }
        poll.votes[optionIndex] += 1;
        return poll;
    }
}

// Seed your artists here. Add/remove as needed.
const seedPolls: Array<Omit<Poll, "votes">> = [
    {
        id: "aurora",
        artistName: "Aurora",
        question: "Favorite Aurora song?",
        options: ["Runaway", "Cure For Me", "Into the Unknown", "Queendom"],
    },
    {
        id: "weeknd",
        artistName: "The Weeknd",
        question: "Favorite era?",
        options: ["Trilogy", "Beauty", "Starboy", "After Hours", "Dawn FM"],
    },
    {
        id: "taylor",
        artistName: "Taylor Swift",
        question: "Favorite album?",
        options: ["Red", "1989", "Reputation", "Folklore", "Midnights"],
    },
];

export const pollStore = new PollStore(seedPolls);