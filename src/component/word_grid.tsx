import React, { useState, useEffect } from 'react';
import './word_grid.css';
import Header from './header';
import { Play } from './play';
import { Pause } from './pause';

interface Position {
    letter: string;
    rowIndex: number;
    colIndex: number;
}

interface GameScore {
    points: number;
    totalWords: number;
}

interface WordGridState {
    words: string[];
    timer: number;
    isPlaying: boolean;
    currentWord: string;
    selectedCells: Position[];
    grid: string[][];
    score: GameScore | null;
}

const LETTER_SETS = [
    'AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM',
    'AEEGMU', 'AEGMNN', 'AFIRSY', 'BJKQXZ', 'CCNSTW',
    'CEIILT', 'CEILPT', 'CEIPST', 'DHHNOT', 'DHHLOR',
    'DHLNOR', 'DDLNOR', 'EIIITT', 'EMOTTT', 'ENSSSU',
    'FIPRSY', 'GORRVW', 'HIPRRY', 'NOOTUW', 'OOOTTU'
];

const initialState: WordGridState = {
    words: [],
    timer: 180,
    isPlaying: false,
    currentWord: '',
    selectedCells: [],
    grid: [],
    score: null
};

const calculateScore = (words: string[]): GameScore => {
    const points = words.reduce((total, word) => {
        // 1 point for words of length 3, +1 for each additional letter
        return total + Math.max(1, word.length - 2);
    }, 0);

    return {
        points,
        totalWords: words.length
    };
};

const WordGrid: React.FC = () => {
    const [state, setState] = useState<WordGridState>(() => {
        const savedState = localStorage.getItem("stumbleState");
        return savedState ? JSON.parse(savedState) : initialState;
    });

    useEffect(() => {
        // Initialize a 5x5 grid using the letter sets
        if (state.grid.length === 0) {
            // Create array of indices 0-24 and shuffle it
            const positions = Array.from({ length: 25 }, (_, i) => i);
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }

            // Create array of unused letter sets (all of them initially)
            const unusedSets = [...LETTER_SETS];
            
            // Create 5x5 grid
            const newGrid = Array.from({ length: 5 }, () =>
                Array.from({ length: 5 }, () => ''));
            
            // Fill grid with random letters from random sets
            positions.forEach((pos) => {
                const row = Math.floor(pos / 5);
                const col = pos % 5;
                
                // Pick a random unused letter set
                const setIndex = Math.floor(Math.random() * unusedSets.length);
                const letterSet = unusedSets[setIndex];
                
                // Remove the used set
                unusedSets.splice(setIndex, 1);
                
                // Pick a random letter from the set
                const letter = letterSet[Math.floor(Math.random() * letterSet.length)];
                
                // Place the letter in the grid
                newGrid[row][col] = letter;
            });
            
            setState(prev => ({
                ...prev,
                grid: newGrid
            }));
        }
    }, [state.grid.length]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (state.isPlaying && state.timer > 0) {
            interval = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    timer: prev.timer - 1
                }));
            }, 1000);
        } else if (state.timer === 0 && !state.score) {
            // Calculate score when timer reaches 0
            const score = calculateScore(state.words);
            setState(prev => ({
                ...prev,
                score,
                isPlaying: false
            }));
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [state.isPlaying, state.timer]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("stumbleState", JSON.stringify(state));
    }, [state]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const isAdjacent = (pos1: Position, pos2: Position): boolean => {
        return Math.abs(pos1.rowIndex - pos2.rowIndex) <= 1 && 
               Math.abs(pos1.colIndex - pos2.colIndex) <= 1;
    };

    const handleCellClick = (letter: string, rowIndex: number, colIndex: number) => {
        if (!state.isPlaying || state.timer <= 0) return;

        const newPosition: Position = { letter, rowIndex, colIndex };

        // Check if the cell is already selected
        if (state.selectedCells.some(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex)) {
            return;
        }

        // Check if the new cell is adjacent to the last selected cell
        if (state.selectedCells.length > 0 && !isAdjacent(state.selectedCells[state.selectedCells.length - 1], newPosition)) {
            return;
        }

        setState(prev => ({
            ...prev,
            selectedCells: [...prev.selectedCells, newPosition],
            currentWord: prev.currentWord + letter
        }));
    };

    const isValidWord = (word: string): boolean => {
        return word.length >= 3;
    };

    const handleWordSubmit = () => {
        if (!state.isPlaying || state.timer <= 0) return;

        if (state.currentWord && isValidWord(state.currentWord) && !state.words.includes(state.currentWord)) {
            setState(prev => ({
                ...prev,
                words: [...prev.words, state.currentWord],
                currentWord: '',
                selectedCells: []
            }));
        } else {
            setState(prev => ({
                ...prev,
                currentWord: '',
                selectedCells: []
            }));
        }
    };

    const resetSelection = () => {
        setState(prev => ({
            ...prev,
            currentWord: '',
            selectedCells: []
        }));
    };

    const togglePlay = (playing: boolean) => {
        if (playing && state.timer === 0) {
            // Reset the game if starting a new one
            setState({
                ...initialState,
                isPlaying: true,
                grid: state.grid
            });
        } else {
            setState(prev => ({
                ...prev,
                isPlaying: playing,
                currentWord: '',
                selectedCells: []
            }));
        }
    };

    return (
        <div className="game-wrapper word-grid-container">
            <Header 
                showScores={() => {}}
                showRules={() => {}}
                showHints={() => {}}
                currentGame="word"
            />
            <h1>Word Grid Game</h1>
            <div className="timer-wrapper">
                <div className="timer-circle">
                    <div className="timer-content">
                        <div className="timer-display">
                            {formatTime(state.timer)}
                        </div>
                        <div>
                            {state.isPlaying ? (
                                <Pause onPlayerClick={() => togglePlay(false)} />
                            ) : (
                                <Play onPlayerClick={() => togglePlay(true)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {state.score && (
                <div className="final-score">
                    <h2>Game Over!</h2>
                    <p>Final Score: {state.score.points} points</p>
                    <p>Words Found: {state.score.totalWords}</p>
                    <button onClick={() => togglePlay(true)}>Play Again</button>
                </div>
            )}
            <div className="current-word">
                {state.currentWord}
            </div>
            <div className="grid">
                {state.grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((letter, colIndex) => (
                            <div 
                                key={colIndex} 
                                className={`grid-cell ${
                                    state.selectedCells.some(
                                        cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex
                                    ) ? 'selected' : ''
                                }`}
                                onClick={() => handleCellClick(letter, rowIndex, colIndex)}
                            >
                                {state.isPlaying || state.timer <= 0 ? letter : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="word-actions">
                <button 
                    onClick={handleWordSubmit}
                    disabled={!state.isPlaying || state.timer <= 0 || state.currentWord.length < 3}
                >
                    Submit Word
                </button>
                <button 
                    onClick={resetSelection}
                    disabled={!state.isPlaying || state.timer <= 0 || !state.currentWord}
                >
                    Reset Selection
                </button>
            </div>
            {state.words.length > 0 && (
                <div className="words-found">
                    <h2>Words Found: {state.words.length}</h2>
                    <ul>
                        {state.words.map((word, index) => (
                            <li key={index}>{word}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WordGrid; 