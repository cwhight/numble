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

const WordGrid: React.FC = () => {
    const [grid, setGrid] = useState<string[][]>([]);
    const [timer, setTimer] = useState<number>(180); // 3 minutes
    const [words, setWords] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem("wordleWords") || "[]");
    });
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentWord, setCurrentWord] = useState<string>('');
    const [selectedCells, setSelectedCells] = useState<Position[]>([]);

    useEffect(() => {
        // Initialize a 4x4 grid with random letters
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const newGrid = Array.from({ length: 4 }, () =>
            Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)])
        );
        setGrid(newGrid);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isPlaying && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, timer]);

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
        if (!isPlaying || timer <= 0) return;

        const newPosition: Position = { letter, rowIndex, colIndex };

        // Check if the cell is already selected
        if (selectedCells.some(cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex)) {
            return;
        }

        // Check if the new cell is adjacent to the last selected cell
        if (selectedCells.length > 0 && !isAdjacent(selectedCells[selectedCells.length - 1], newPosition)) {
            return;
        }

        setSelectedCells(prev => [...prev, newPosition]);
        setCurrentWord(prev => prev + letter);
    };

    const isValidWord = (word: string): boolean => {
        return word.length >= 3;
    };

    const handleWordSubmit = () => {
        if (!isPlaying || timer <= 0) return;

        if (currentWord && isValidWord(currentWord) && !words.includes(currentWord)) {
            const newWords = [...words, currentWord];
            setWords(newWords);
            localStorage.setItem("wordleWords", JSON.stringify(newWords));
        }
        
        // Reset current word and selected cells
        setCurrentWord('');
        setSelectedCells([]);
    };

    const resetSelection = () => {
        setCurrentWord('');
        setSelectedCells([]);
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
                            {formatTime(timer)}
                        </div>
                        <div>
                            {isPlaying ? (
                                <Pause onPlayerClick={() => setIsPlaying(false)} />
                            ) : (
                                <Play onPlayerClick={() => setIsPlaying(true)} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="current-word">
                {currentWord}
            </div>
            <div className="grid">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((letter, colIndex) => (
                            <div 
                                key={colIndex} 
                                className={`grid-cell ${
                                    selectedCells.some(
                                        cell => cell.rowIndex === rowIndex && cell.colIndex === colIndex
                                    ) ? 'selected' : ''
                                }`}
                                onClick={() => handleCellClick(letter, rowIndex, colIndex)}
                            >
                                {isPlaying || timer <= 0 ? letter : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="word-actions">
                <button 
                    onClick={handleWordSubmit}
                    disabled={!isPlaying || timer <= 0 || currentWord.length < 3}
                >
                    Submit Word
                </button>
                <button 
                    onClick={resetSelection}
                    disabled={!isPlaying || timer <= 0 || !currentWord}
                >
                    Reset Selection
                </button>
            </div>
            {words.length > 0 && (
                <div className="words-found">
                    <h2>Words Found: {words.length}</h2>
                    <ul>
                        {words.map((word, index) => (
                            <li key={index}>{word}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WordGrid; 