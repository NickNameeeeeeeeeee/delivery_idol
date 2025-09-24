// prisma/seed.ts
import { prisma } from "../lib/prisma";

const seed = [
    {
        id: "taylor",
        artistName: "Taylor Swift",
        question: "Favorite album?",
        options: ["Red", "1989", "Reputation", "Folklore", "Midnights"],
    },
];

async function main() {
    for (const p of seed) {
        await prisma.poll.upsert({
            where: { id: p.id },
            update: {},
            create: {
                id: p.id,
                artistName: p.artistName,
                question: p.question,
                options: {
                    create: p.options.map((text) => ({ text })),
                },
            },
        });
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
