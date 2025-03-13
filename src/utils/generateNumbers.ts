// Seed function to generate consistent random numbers for a given date
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Get today's date in GMT/UTC
function getTodayGMT(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Generate a random number between min and max (inclusive) using seeded random
function getRandomNumber(min: number, max: number, seed: number): number {
    return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}

export interface GameNumbers {
    bigNums: number[];
    smallNums: number[];
    target: number;
}

export function generateNumbers(): GameNumbers {
    // Use the current GMT date as seed
    const today = getTodayGMT();
    let seed = today.getTime();

    // Generate 2 big numbers (10, 25, 50, 75, 100)
    const bigNumbers = [10, 25, 50, 75, 100];
    const bigNums: number[] = [];
    for (let i = 0; i < 2; i++) {
        const index = Math.floor(seededRandom(seed++) * bigNumbers.length);
        bigNums.push(bigNumbers[index]);
        bigNumbers.splice(index, 1);
    }

    // Generate 4 small numbers (1-9)
    const smallNums: number[] = [];
    for (let i = 0; i < 4; i++) {
        smallNums.push(getRandomNumber(1, 9, seed++));
    }

    // Generate target number (100-999)
    const target = getRandomNumber(100, 999, seed);

    return {
        bigNums,
        smallNums,
        target
    };
} 