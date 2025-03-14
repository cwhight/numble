/**
 * Check if a word is valid (currently just checks length)
 * @param word The word to check (case insensitive)
 * @returns boolean indicating if the word is valid
 */
export function isValidWord(word: string): boolean {
    return word.length >= 3;
} 