import React, {useEffect, useState} from "react"
import {Number} from "./number";
import {Working} from "./working";
import calculate from "../utils/calculate";
import {FinishedModal} from "./finished_modal";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import ReactGA from 'react-ga4';
import {
    faBackspace,
    faDivide,
    faMinus,
    faMultiply,
    faPlus,
    faQuestion,
    faRefresh,
    faUndo,
    faLightbulb
} from '@fortawesome/free-solid-svg-icons'
import { Pause } from "./pause";
import { Play } from "./play";
import { getHint } from '../utils/solver';
import Confetti from 'react-confetti';

const TRACKING_ID = "UA-221463714-1";
ReactGA.initialize(TRACKING_ID);

function isNumber(item: string): boolean {
    return /[0-9]+/.test(item);
}

export interface Score {
    gamesWon: number;
    gamesPlayed: number;
    averageTime: number;
    bestTime: number;
    hintsUsed: number;
}

export interface KeyPadProps {
    bigNums: number[];
    smallNums: number[];
    target: number;
    refreshState: () => void;
}

interface Totals {
    equals: boolean;
    total: number | null;
    next: number | null;
    operation: string | null;
}

interface SumbleState {
    newNumbers: number[];
    usedKeys: number[];
    timer: number;
    isPlaying: boolean;
    totals: Totals;
    score: {
        gamesWon: number;
        gamesPlayed: number;
        averageTime: number;
        bestTime: number;
        hintsUsed: number;
    };
    currentStreak: number;
    maxStreak: number;
    finished: boolean;
    typedKeys: number[];
    previousCalc: number;
    showingHint: boolean;
    hintNumbers: [number, number] | null;
    hintOperation: string | null;
    hintMessage: string;
    highlightedIndices: number[];
    isModalOpen: boolean;
    showConfetti: boolean;
    lastPlayed: number;
    winningTime: number;
    todaysTime: number;
    todaysHintsUsed: number;
    lastWon: number;
    displayedHints: string[];
    lastGenerated: number;
}

const initialState: SumbleState = {
    newNumbers: [],
    usedKeys: [],
    timer: 0,
    isPlaying: false,
    totals: {
        equals: false,
        total: null,
        next: null,
        operation: null
    },
    score: {
        gamesWon: 0,
        gamesPlayed: 0,
        averageTime: 0,
        bestTime: 0,
        hintsUsed: 0
    },
    currentStreak: 0,
    maxStreak: 0,
    finished: false,
    typedKeys: [],
    previousCalc: 0,
    showingHint: false,
    hintNumbers: null,
    hintOperation: null,
    hintMessage: "",
    highlightedIndices: [],
    isModalOpen: false,
    showConfetti: false,
    lastPlayed: 0,
    winningTime: 0,
    todaysTime: 0,
    todaysHintsUsed: 0,
    lastWon: 0,
    displayedHints: [],
    lastGenerated: 0
};

export const KeyPad: React.FC<KeyPadProps> = ({
    bigNums,
    smallNums,
    target,
    refreshState
}) => {
    const [state, setState] = useState<SumbleState>(() => {
        const savedState = localStorage.getItem("sumbleState");
        const today = new Date().setHours(0, 0, 0, 0);

        // Initialize with default state
        let initializedState = initialState;

        if (savedState) {
            const parsedState = JSON.parse(savedState);
            
            // If it's a new day, reset game state but keep historical data
            if (parsedState.lastPlayed < today) {
                initializedState = {
                    ...initialState,
                    score: parsedState.score,
                    currentStreak: parsedState.currentStreak,
                    maxStreak: parsedState.maxStreak,
                    lastPlayed: today,
                    lastGenerated: today
                };
            } else {
                // Use saved state and show modal if game is finished
                initializedState = {
                    ...parsedState,
                    isModalOpen: parsedState.finished
                };
            }
        }

        return {
            ...initializedState,
            timer: initializedState.timer,
            displayedHints: initializedState.displayedHints,
            hintsUsed: initializedState.score.hintsUsed,
            lastGenerated: today,
            lastPlayed: today,
            isModalOpen: initializedState.finished // Ensure modal is shown if game is finished
        };
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("sumbleState", JSON.stringify(state));
    }, [state]);

    // Timer effect
    useEffect(() => {
        let timerInterval: NodeJS.Timeout | null = null;
        if (state.isPlaying && !state.finished) {
            timerInterval = setInterval(() => {
                setState(prev => ({
                    ...prev,
                    timer: prev.timer + 1
                }));
            }, 1000);
        }
        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [state.isPlaying, state.finished]);

    const [hasPlayedToday, setHasPlayedToday] = useState<boolean>(state.lastPlayed >= new Date().setHours(0, 0, 0, 0));

    const cacheNewNumbers = (numbers: number[]) => {
        setState(prev => ({
            ...prev,
            newNumbers: numbers
        }));
    };

    const cacheUsedKeys = (keys: number[]) => {
        setState(prev => ({
            ...prev,
            usedKeys: keys
        }));
    };

    function clearTotals() {
    
        setState(prev => ({
            ...prev,
            totals: {
                equals: false,
                total: null,
                next: null,
                operation: null,
            }
        }));
    }

    const clear = () => {
        // Prevent clearing if game is finished
        if (state.finished) return;
        
        clearTotals();
        cacheNewNumbers([]);
        cacheUsedKeys([]);
    
        setState(prev => ({
            ...prev,
            finished: false,
            displayedHints: [],
            typedKeys: [],
        }));
    };

    useEffect(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        
        // If it's a new day or lastGenerated isn't set
        if (state.lastGenerated < today) {
            // Reset all state for a new day
            setState(prev => ({
                ...prev,
                finished: false,
                displayedHints: [],
                hintsUsed: 0,
                timer: 0,
                isPlaying: false,
                todaysTime: 0,
                winningTime: 0,
                lastPlayed: today,
                lastGenerated: today
            }));
            refreshState();
        }
    }, [state.lastPlayed, state.lastGenerated, refreshState]);

    useEffect(() => {
        if (!hasPlayedToday && state.lastPlayed >= new Date().setHours(0, 0, 0, 0)) {
            setHasPlayedToday(true);
        }
    }, [hasPlayedToday, state.lastPlayed]);

    useEffect(() => {
        if (!hasPlayedToday && state.finished) {
            setState(prev => ({
                ...prev,
                todaysTime: 0
            }));
        }
    }, [hasPlayedToday, state.finished]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    useEffect(() => {
        console.log('useEffect triggered: showConfetti:', state.showConfetti, 'finished:', state.finished);
        // When confetti ends (showConfetti becomes false) and game is finished, show the modal
        if (!state.showConfetti && state.finished) {
            console.log('Opening modal');
            setState(prev => ({
                ...prev,
                isModalOpen: true
            }));
        }
    }, [state.showConfetti, state.finished]);

    const gameOver = () => {
        console.log('Game over triggered');
        ReactGA.event({
            category: 'Game',
            action: 'Won',
            value: state.timer
        });

        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = today - 86400000;
        
        let newStreak = state.todaysHintsUsed > 0 ? 0 :
            state.lastWon > yesterday ? state.currentStreak + 1 : 1;

        // Set initial game over state
        setState(prev => ({
            ...prev,
            finished: true,
            isPlaying: false,
            currentStreak: newStreak,
            maxStreak: Math.max(newStreak, prev.maxStreak),
            winningTime: state.timer,
            todaysTime: state.timer,
            lastWon: Date.now(),
            score: {
                ...prev.score,
                gamesWon: prev.score.gamesWon + 1,
                gamesPlayed: prev.score.gamesPlayed + 1,
                averageTime: prev.score.gamesWon === 0 ? 
                    state.timer : 
                    (prev.score.averageTime * prev.score.gamesWon + state.timer) / (prev.score.gamesWon + 1),
                bestTime: prev.score.bestTime === 0 ? 
                    state.timer : 
                    Math.min(state.timer, prev.score.bestTime),
                hintsUsed: state.todaysHintsUsed + state.score.hintsUsed
            },
            showConfetti: true
        }));

        // Set a timeout to show modal after confetti
        setTimeout(() => {
            console.log('Timeout reached, hiding confetti and opening modal');
            setState(prev => ({
                ...prev,
                showConfetti: false,
                isModalOpen: true
            }));
        }, 3000);
    };

    const handleClick = (value: string, key?: number) => {
        // Prevent any moves if game is finished
        if (state.finished) return;

        if (!state.isPlaying) return;

        if (value === "AC") {
            clear();
            return;
        }

        if (value == "<-") {
            if (state.totals.next) {
                setState(prev => ({
                    ...prev,
                    totals: {
                        equals: false,
                        total: prev.totals.total,
                        next: null,
                        operation: prev.totals.operation
                    },
                    typedKeys: prev.typedKeys.length > 0 ? prev.typedKeys.slice(0, -1) : [],
                    previousCalc: prev.typedKeys.length > 0 ? prev.previousCalc : 0
                }));
            } else if (state.totals.operation) {
                setState(prev => ({
                    ...prev,
                    totals: {
                        equals: false,
                        total: prev.totals.total,
                        next: prev.totals.next,
                        operation: null
                    }
                }));
            } else if (state.totals.total) {
                setState(prev => ({
                    ...prev,
                    totals: {
                        equals: false,
                        total: null,
                        next: null,
                        operation: null
                    },
                    typedKeys: prev.typedKeys.length > 0 ? prev.typedKeys.slice(0, -1) : [],
                    previousCalc: prev.typedKeys.length > 0 ? prev.previousCalc : 0
                }));
            }
            return;
        }

        if (value == "Undo") {
            setState(prev => ({
                ...prev,
                typedKeys: [],
                usedKeys: prev.usedKeys.slice(0, -2),
                newNumbers: prev.newNumbers.slice(0, -1),
                totals: {
                    equals: false,
                    total: null,
                    next: null,
                    operation: null
                }
            }));
            return;
        }

        if (isNumber(value)) {
            if (state.typedKeys[0] == key || state.previousCalc == key) {
                if (state.totals.operation) {
                    return;
                } else {
                    if (state.previousCalc == key) {
                        setState(prev => ({
                            ...prev,
                            typedKeys: [...prev.typedKeys, prev.previousCalc],
                            previousCalc: 0
                        }));
                    } else {
                        setState(prev => ({
                            ...prev,
                            typedKeys: prev.typedKeys.slice(0, -1),
                            totals: {
                                equals: false,
                                total: prev.totals.total,
                                next: null,
                                operation: prev.totals.operation
                            }
                        }));
                    }
                }
                return;
            } else {
                setState(prev => ({
                    ...prev,
                    typedKeys: !prev.totals.operation ? 
                        [key || 0] : 
                        [...prev.typedKeys, key || 0],
                    previousCalc: 0
                }));
            }
        }

        const newTotals = calculate(state.totals, value);

        setState(prev => ({
            ...prev,
            totals: newTotals
        }));

        if (newTotals.equals) {
            if (newTotals.total == target) {
                gameOver();
                return;
            }

            setState(prev => ({
                ...prev,
                usedKeys: [
                    ...prev.usedKeys,
                    prev.typedKeys[0],
                    prev.typedKeys.length > 1 ? prev.typedKeys[1] : prev.newNumbers.length + 6
                ],
                previousCalc: prev.newNumbers.length + 7,
                typedKeys: [],
                newNumbers: [...prev.newNumbers, newTotals.total || 0],
                totals: {
                    equals: false,
                    total: null,
                    next: newTotals.total,
                    operation: null
                }
            }));
        }
    };

    const showHint = () => {
        // Prevent hints if game is finished
        if (!state.isPlaying || state.finished) return;

        setState(prev => ({
            ...prev,
            todaysHintsUsed: prev.todaysHintsUsed + 1
        }));

        const availableNumbers = [
            ...bigNums,
            ...smallNums,
            ...state.newNumbers
        ].filter((_, index) => !state.usedKeys.includes(index + 1));

        const hint = getHint(availableNumbers, target);
        
        if (hint) {
            const hintText = `${hint.num1} ${hint.operation} ${hint.num2} = ${hint.result}`;
            
            // Find indices to highlight
            const allNumbers = [...bigNums, ...smallNums, ...state.newNumbers];
            const indices: number[] = [];
            
            // Find first occurrence of first hint number
            const firstNumIndex = allNumbers.findIndex(num => num === hint.num1);
            if (firstNumIndex !== -1) indices.push(firstNumIndex);
            
            // Find first occurrence of second hint number after the first number
            // (unless it's the same number, then find first occurrence)
            const secondNumIndex = hint.num1 === hint.num2 
                ? firstNumIndex 
                : allNumbers.findIndex(num => num === hint.num2);
            if (secondNumIndex !== -1) indices.push(secondNumIndex);
            
            setState(prev => ({
                ...prev,
                showingHint: true,
                hintNumbers: [hint.num1, hint.num2],
                hintOperation: hint.operation,
                hintMessage: `Try: ${hintText}`,
                highlightedIndices: indices,
                displayedHints: prev.displayedHints.includes(hintText) 
                    ? prev.displayedHints 
                    : [...prev.displayedHints, hintText]
            }));
            
            // Hide hint after 3 seconds
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    showingHint: false,
                    hintNumbers: null,
                    hintOperation: null,
                    hintMessage: "",
                    highlightedIndices: []
                }));
            }, 3000);

            // Refresh state to update modal
            refreshState();
        } else {
            setState(prev => ({
                ...prev,
                hintMessage: "No solution found with current numbers"
            }));
            setTimeout(() => {
                setState(prev => ({
                    ...prev,
                    hintMessage: ""
                }));
            }, 3000);
        }
    };

    const isNumberHinted = (value: number) => {
        if (!state.showingHint || !state.hintNumbers) return false;
        
        // Get all numbers in the game
        const allNumbers = [
            ...bigNums,
            ...smallNums,
            ...state.newNumbers
        ];
        
        // Get the index of the current number in the full array
        const currentIndex = allNumbers.indexOf(value);
        
        // Only highlight if this index is in our highlighted indices
        return state.highlightedIndices.includes(currentIndex);
    };

    const isOperationHinted = (operation: string) => {
        return state.showingHint && state.hintOperation === operation;
    };

    let newNums = state.newNumbers.map((num, i) => (
        <Number 
            key={`newNum-${i}`}
            solved={state.finished} 
            newNum={true} 
            big={false} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(num.toString(), 7 + i)} 
            value={num}
            used={state.usedKeys.includes(7 + i)}
            highlighted={isNumberHinted(num)}
        />
    ));

    // Add unique keys to Number components
    const big1 = (
        <Number 
            key="big1"
            solved={state.finished} 
            newNum={false} 
            big={true} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(bigNums[0].toString(), 1)} 
            value={bigNums[0]}
            used={state.usedKeys.includes(1)}
            highlighted={isNumberHinted(bigNums[0])}
        />
    );

    const big2 = (
        <Number 
            key="big2"
            solved={state.finished} 
            newNum={false} 
            big={true} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(bigNums[1].toString(), 2)} 
            value={bigNums[1]}
            used={state.usedKeys.includes(2)}
            highlighted={isNumberHinted(bigNums[1])}
        />
    );

    const small1 = (
        <Number 
            key="small1"
            solved={state.finished} 
            newNum={false} 
            big={false} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(smallNums[0].toString(), 3)} 
            value={smallNums[0]}
            used={state.usedKeys.includes(3)}
            highlighted={isNumberHinted(smallNums[0])}
        />
    );

    const small2 = (
        <Number 
            key="small2"
            solved={state.finished} 
            newNum={false} 
            big={false} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(smallNums[1].toString(), 4)} 
            value={smallNums[1]}
            used={state.usedKeys.includes(4)}
            highlighted={isNumberHinted(smallNums[1])}
        />
    );

    const small3 = (
        <Number 
            key="small3"
            solved={state.finished} 
            newNum={false} 
            big={false} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(smallNums[2].toString(), 5)} 
            value={smallNums[2]}
            used={state.usedKeys.includes(5)}
            highlighted={isNumberHinted(smallNums[2])}
        />
    );

    const small4 = (
        <Number 
            key="small4"
            solved={state.finished} 
            newNum={false} 
            big={false} 
            isPlaying={state.isPlaying && !state.finished}
            onClick={() => handleClick(smallNums[3].toString(), 6)} 
            value={smallNums[3]}
            used={state.usedKeys.includes(6)}
            highlighted={isNumberHinted(smallNums[3])}
        />
    );

    return (
        <div className="game-container">
            {state.showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}
            <div className={"game-wrapper h-100 d-flex flex-column justify-content-around align-items-center"}>
                <div>
                    <div className={`timer-wrapper mb-3`}>
                        <div className="timer-circle">
                            <div className="timer-content">
                                <div className="timer-display">
                                    {formatTime(state.finished ? state.winningTime : state.timer)}
                                </div>
                                <div>
                                    {state.isPlaying && !state.finished ? (
                                        <Pause onPlayerClick={() => {
                                            setState(prev => ({
                                                ...prev,
                                                isPlaying: false
                                            }));
                                        }}/>
                                    ) : !state.finished ? (
                                        <Play onPlayerClick={() => {
                                            setState(prev => ({
                                                ...prev,
                                                isPlaying: true
                                            }));
                                        }}/>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div className={"p-3 text-center my-1 mx-2"}>
                        <h1 className={"target"}>{state.isPlaying || state.finished ? target : <FontAwesomeIcon icon={faQuestion}/>}</h1>
                    </div>
                </div>
                <div className="game-board">
                    <Working totals={state.totals}/>
                    {state.hintMessage && (
                        <div className="hint-message">
                            {state.hintMessage}
                        </div>
                    )}
                </div>
                <div className="game-board">
                    <div className="number-container">
                        {newNums}
                    </div>
                    <div className="number-container">
                        {big1}
                        {big2}
                        {small1}
                        {small2}
                        {small3}
                        {small4}
                    </div>
                </div>
                <div className="game-board">
                    <div className="operation-container">
                        <button className={`operation-button ${isOperationHinted("+") ? "highlighted" : ""}`} 
                                onClick={() => handleClick("+")}><FontAwesomeIcon icon={faPlus}/></button>
                        <button className={`operation-button ${isOperationHinted("-") ? "highlighted" : ""}`} 
                                onClick={() => handleClick("-")}><FontAwesomeIcon icon={faMinus}/></button>
                        <button className={`operation-button ${isOperationHinted("x") ? "highlighted" : ""}`} 
                                onClick={() => handleClick("x")}><FontAwesomeIcon icon={faMultiply}/></button>
                        <button className={`operation-button ${isOperationHinted("÷") ? "highlighted" : ""}`} 
                                onClick={() => handleClick("÷")}><FontAwesomeIcon icon={faDivide}/></button>
                    </div>
                </div>
                <div className="game-board">
                    <div className="operation-container">
                        <button className="operation-button" onClick={() => handleClick("Undo")}>
                            <FontAwesomeIcon icon={faUndo}/>
                        </button>
                        <button className="operation-button" onClick={() => handleClick("<-")}>
                            <FontAwesomeIcon icon={faBackspace}/>
                        </button>
                        <button className="operation-button" onClick={() => handleClick("AC")}>
                            <FontAwesomeIcon icon={faRefresh}/>
                        </button>
                        <button className="operation-button" onClick={showHint}>
                            <FontAwesomeIcon icon={faLightbulb}/>
                        </button>
                    </div>
                </div>
            </div>
            
            <FinishedModal
                show={state.isModalOpen}
                clear={() => setState(prev => ({
                    ...prev,
                    isModalOpen: false,
                }))}
            />
            {state.finished && !state.isModalOpen && (
                <button 
                    className="reopen-modal-button" 
                    onClick={() => setState(prev => ({
                        ...prev,
                        isModalOpen: true
                    }))}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: 1000
                    }}
                >
                    Show Results
                </button>
            )}
        </div>
    );
}


