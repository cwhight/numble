interface Operation {
    symbol: string;
    apply: (a: number, b: number) => number;
}

const operations: Operation[] = [
    { symbol: '+', apply: (a, b) => a + b },
    { symbol: '-', apply: (a, b) => a - b },
    { symbol: 'x', apply: (a, b) => a * b },
    { symbol: '÷', apply: (a, b) => b !== 0 && a % b === 0 ? a / b : NaN },
];

interface Step {
    num1: number;
    num2: number;
    operation: string;
    result: number;
}

export interface Solution {
    steps: Step[];
    numbers: number[];
}

function findShortestSolution(numbers: number[], target: number): Solution | null {
    let shortestSolution: Solution | null = null;
    
    function solve(currentNumbers: number[], usedIndices: number[], steps: Step[]) {
        // If we already found a solution and current path is longer, stop exploring
        if (shortestSolution && steps.length >= shortestSolution.steps.length) {
            return;
        }

        // Check if we've found the target
        if (currentNumbers.includes(target)) {
            const solution = {
                steps: [...steps],
                numbers: usedIndices.map(i => numbers[i])
            };
            
            // Update shortest solution if this is shorter or first solution
            if (!shortestSolution || solution.steps.length < shortestSolution.steps.length) {
                shortestSolution = solution;
            }
            return;
        }

        // Try all pairs of numbers
        for (let i = 0; i < currentNumbers.length; i++) {
            for (let j = i + 1; j < currentNumbers.length; j++) {
                const num1 = currentNumbers[i];
                const num2 = currentNumbers[j];

                // Try all operations
                for (const op of operations) {
                    const result = op.apply(num1, num2);
                    
                    // Skip if operation resulted in invalid number
                    if (isNaN(result) || result < 0 || !Number.isInteger(result)) continue;

                    // Create new array without used numbers
                    const newNumbers = [...currentNumbers];
                    newNumbers.splice(j, 1);
                    newNumbers.splice(i, 1);
                    newNumbers.push(result);

                    // Add step and continue solving
                    const step: Step = {
                        num1,
                        num2,
                        operation: op.symbol,
                        result
                    };
                    
                    solve(newNumbers, [...usedIndices], [...steps, step]);
                }
            }
        }
    }

    solve(numbers, [], []);
    return shortestSolution;
}

export function getHint(numbers: number[], target: number): Step | null {
    const solution = findShortestSolution(numbers, target);
    if (!solution) return null;

    // Return the first step of the shortest solution
    return solution.steps[0];
} 