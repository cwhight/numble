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

const TRACKING_ID = "UA-221463714-1";
ReactGA.initialize(TRACKING_ID);

function isNumber(item: string): boolean {
    return /[0-9]+/.test(item);
}

interface Finished {
    finished: boolean;
    success: boolean;
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

export const KeyPad: React.FC<KeyPadProps> = ({
    bigNums,
    smallNums,
    target,
    refreshState
}) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [newNumbers, setNewNumbers] = useState<number[]>(() => 
        JSON.parse(localStorage.getItem("newNumbers") || "[]") as number[]
    )
    const [totals, setTotals] = useState<Totals>({
        equals: false,
        total: null,
        next: null,
        operation: null
    })

    const [typedKeys, setTypedKeys] = useState<number[]>([])
    const [previousCalc, setPreviousCalc] = useState<number>(0)

    const [usedKeys, setUsedKeys] = useState<number[]>(() => 
        JSON.parse(localStorage.getItem("usedKeys") || "[]") as number[]
    )

    const [elapsedTime, setElapsedTime] = useState<number>(() => {
        const storedTime = localStorage.getItem("elapsedTime");
        const todaysTime = localStorage.getItem("todaysTime");
        // If game was won today, use that time instead
        if (todaysTime && localStorage.getItem("finished") === "true") {
            return parseInt(todaysTime);
        }
        if (storedTime) {
            return parseInt(storedTime);
        }
        return 0;
    });
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

    const [finished, setIsFinished] = useState<Finished>(() => {
        const finished = localStorage.getItem("finished") === "true";
        const solved = localStorage.getItem("solved") === "true";
        return {
            finished,
            success: solved
        };
    });

    const [hasPlayedToday, setHasPlayedToday] = useState<boolean>(false)
    const [hasBeenResetToday, setHasBeenResetToday] = useState<boolean>(false)

    const [scores, setScores] = useState<Score>(() => {
        const storedScores = localStorage.getItem("scores");
        if (!storedScores) {
            const defaultScores = {
                averageTime: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                bestTime: 0,
                hintsUsed: 0
            };
            localStorage.setItem("scores", JSON.stringify(defaultScores));
            return defaultScores;
        }
        return JSON.parse(storedScores) as Score;
    });

    const [currentStreak, setCurrentStreak] = useState<number>(() => 
        JSON.parse(localStorage.getItem("currentStreak") || "0") as number
    );
    const [maxStreak, setMaxStreak] = useState<number>(() => 
        JSON.parse(localStorage.getItem("maxStreak") || "0") as number
    );

    const lastPlayed = localStorage.getItem("lastPlayed");
    const lastWon = parseInt(localStorage.getItem("lastWon") || "0");
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    const lastPlayedInt = parseInt(lastPlayed || "0");

    const [showingHint, setShowingHint] = useState<boolean>(false);
    const [hintNumbers, setHintNumbers] = useState<[number, number] | null>(null);
    const [hintOperation, setHintOperation] = useState<string | null>(null);
    const [hintMessage, setHintMessage] = useState<string>("");

    const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

    const cacheNewNumbers = (numbers: number[]) => {
        setNewNumbers(numbers);
        localStorage.setItem("newNumbers", JSON.stringify(numbers));
    };

    const cacheUsedKeys = (keys: number[]) => {
        setUsedKeys(keys);
        localStorage.setItem("usedKeys", JSON.stringify(keys));
    };

    const cacheTimeRemaining = (elapsed: number) => {
        localStorage.setItem("elapsedTime", JSON.stringify(elapsed));
    };

    function clearTotals() {
        setTotals({
            equals: false,
            total: null,
            next: null,
            operation: null,
        })
    }

    const clear = () => {
        // Prevent clearing if game is finished
        if (localStorage.getItem("finished") === "true") return;
        
        clearTotals();
        setTypedKeys([]);
        cacheNewNumbers([]);
        cacheUsedKeys([]);
        setIsFinished({
            finished: false,
            success: false
        });
        localStorage.setItem("finished", "false");
        localStorage.setItem("displayedHints", JSON.stringify([]));
        setElapsedTime(0);
        localStorage.setItem("elapsedTime", "0");
    };

    useEffect(() => {
        if (lastPlayedInt < today && !hasBeenResetToday) {
            cacheNewNumbers([])
            cacheUsedKeys([])
            setTypedKeys([])
            setIsFinished({
                finished: false,
                success: false
            })
            localStorage.setItem("todaysTime", "0")
            setElapsedTime(0)
            localStorage.setItem("elapsedTime", "0")
            setHasBeenResetToday(true)
            // Reset both hints list and count at the start of a new day
            localStorage.setItem("hintsUsed", "0")
            localStorage.setItem("displayedHints", JSON.stringify([]))
            refreshState()
        }
    }, [lastPlayedInt, today, hasBeenResetToday, refreshState])

    useEffect(() => {
        if (!hasPlayedToday && lastPlayedInt >= today) {
            setHasPlayedToday(true)
        }
    }, [hasPlayedToday, lastPlayedInt, today])

    useEffect(() => {
        if (!hasPlayedToday && finished.success) {
            setIsFinished({
                finished: false,
                success: false
            })
            localStorage.setItem("todaysTime", "0")
        }
    }, [hasPlayedToday, finished.success])

    useEffect(() => {
        // Only start timer if game hasn't been won
        if (isPlaying && !finished.success && localStorage.getItem("finished") !== "true") {
            const interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);
        } else if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [isPlaying, finished.success]);

    useEffect(() => {
        // Only update elapsed time in storage if game hasn't been won
        if (localStorage.getItem("finished") !== "true") {
            localStorage.setItem("elapsedTime", elapsedTime.toString());
        }
    }, [elapsedTime]);

    const big1 = bigNums[0]
    const big2 = bigNums[1]

    const small1 = smallNums[0]
    const small2 = smallNums[1]
    const small3 = smallNums[2]
    const small4 = smallNums[3]

    useEffect(() => {
        setTotals({
            equals: false,
            total: null,
            next: null,
            operation: null,
        });
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const gameOver = (success: boolean) => {
        ReactGA.event({
            category: 'Game',
            action: 'Won',
            value: elapsedTime
        });

        localStorage.setItem("todaysTime", elapsedTime.toString());
        saveScore(success, elapsedTime);
        const hintsUsed = parseInt(localStorage.getItem("hintsUsed") || "0");
        let newStreak: number;
        if (hintsUsed > 0) {
            newStreak = 0;
        } else if (lastWon > yesterday) {
            newStreak = currentStreak + 1;
        } else {
            newStreak = 1;
        }

        localStorage.setItem("lastWon", JSON.stringify(Date.now()));
        localStorage.setItem("currentStreak", newStreak.toString());
        setCurrentStreak(newStreak);

        if (newStreak > maxStreak) {
            localStorage.setItem("maxStreak", newStreak.toString());
            setMaxStreak(newStreak);
        }

        localStorage.setItem("finished", "true");
        setIsFinished({
            finished: true,
            success: true
        });
        setIsPlaying(false);
    };

    const saveScore = (success: boolean, timeTaken: number) => {
        const newScores = { ...scores };
        const hintsUsedInGame = parseInt(localStorage.getItem("hintsUsed") || "0");
        
        if (success) {
            if (newScores.gamesWon === 0) {
                newScores.averageTime = timeTaken;
            } else {
                newScores.averageTime = (newScores.averageTime * newScores.gamesWon + timeTaken) / (newScores.gamesWon + 1);
            }
            newScores.gamesWon += 1;
        }

        if ((timeTaken < newScores.bestTime || newScores.bestTime === 0) && success) {
            newScores.bestTime = timeTaken;
        }
        newScores.gamesPlayed += 1;
        newScores.hintsUsed = (newScores.hintsUsed || 0) + hintsUsedInGame;

        localStorage.setItem("scores", JSON.stringify(newScores));
        localStorage.setItem("lastPlayed", JSON.stringify(Date.now()));
        setScores(newScores);
        setHasPlayedToday(true);
    }

    const handleClick = (value: string, key?: number) => {
        // Prevent any moves if game is finished
        if (finished.success || localStorage.getItem("finished") === "true") {
            return;
        }

        if (!isPlaying) {
            return;
        }

        if (value == "AC") {
            clear()
        }

        if (value == "<-") {
            if (totals.next) {
                setTotals(
                    {
                        equals: false,
                        total: totals.total,
                        next: null,
                        operation: totals.operation
                    }
                )
                if (typedKeys.length > 0) {
                    typedKeys.pop()
                    setTypedKeys(typedKeys)
                } else {
                    setPreviousCalc(0)
                }
            } else if (totals.operation) {
                setTotals(
                    {
                        equals: false,
                        total: totals.total,
                        next: totals.next,
                        operation: null
                    }
                )
            } else if (totals.total) {
                setTotals(
                    {
                        equals: false,
                        total: null,
                        next: null,
                        operation: null
                    }
                )
                if (typedKeys.length > 0) {
                    typedKeys.pop()
                    setTypedKeys(typedKeys)
                } else {
                    setPreviousCalc(0)
                }
            }
            return
        }

        if (value == "Undo") {
            setTypedKeys([])
            usedKeys.pop()
            usedKeys.pop()
            cacheUsedKeys(usedKeys)
            newNumbers.pop()
            cacheNewNumbers(newNumbers)
            clearTotals()
            return
        }

        if (isNumber(value)) {
            if (typedKeys[0] == key || previousCalc == key) {
                if (totals.operation) {
                    return
                } else {
                    if (previousCalc == key) {
                        typedKeys.push(previousCalc)
                        setPreviousCalc(0)
                        setTypedKeys(typedKeys)
                    } else {
                        typedKeys.pop()
                        setTypedKeys(typedKeys)
                        setTotals(
                            {
                                equals: false,
                                total: totals.total,
                                next: null,
                                operation: totals.operation
                            }
                        )
                    }
                }
                return
            } else {
                if (!totals.operation) {
                    typedKeys.pop()
                }
                setPreviousCalc(0)
                typedKeys.push(key || 0)
                setTypedKeys(typedKeys)
            }
        }

        const newTotals = calculate(totals, value)

        setTotals(newTotals);

        if (newTotals.equals) {
            if (newTotals.total == target) {
                gameOver(true)
                return
            }

            usedKeys.push(typedKeys[0])
            typedKeys.length > 1 ? usedKeys.push(typedKeys[1]) : usedKeys.push(newNumbers.length + 6)
            setPreviousCalc(newNumbers.length + 7)
            setTypedKeys([])
            cacheUsedKeys(usedKeys)
            newNumbers.push(newTotals.total || 0)
            cacheNewNumbers(newNumbers)
            setTotals({
                equals: false,
                total: null,
                next: newTotals.total,
                operation: null,
            })
        }
    };

    const showHint = () => {
        // Prevent hints if game is finished
        if (!isPlaying || finished.success || localStorage.getItem("finished") === "true") return;

        // Increment hints used counter
        const currentHintsUsed = parseInt(localStorage.getItem("hintsUsed") || "0");
        localStorage.setItem("hintsUsed", (currentHintsUsed + 1).toString());

        const availableNumbers = [
            ...bigNums,
            ...smallNums,
            ...newNumbers
        ].filter((_, index) => !usedKeys.includes(index + 1));

        const hint = getHint(availableNumbers, target);
        
        if (hint) {
            const hintText = `${hint.num1} ${hint.operation} ${hint.num2} = ${hint.result}`;
            setHintNumbers([hint.num1, hint.num2]);
            setHintOperation(hint.operation);
            setShowingHint(true);
            setHintMessage(`Try: ${hintText}`);
            
            // Store unique hints only
            const displayedHints = JSON.parse(localStorage.getItem("displayedHints") || "[]");
            if (!displayedHints.includes(hintText)) {
                displayedHints.push(hintText);
                localStorage.setItem("displayedHints", JSON.stringify(displayedHints));
            }
            
            // Find indices to highlight
            const allNumbers = [...bigNums, ...smallNums, ...newNumbers];
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
            
            setHighlightedIndices(indices);
            
            // Hide hint after 3 seconds
            setTimeout(() => {
                setShowingHint(false);
                setHintNumbers(null);
                setHintOperation(null);
                setHintMessage("");
                setHighlightedIndices([]);
            }, 3000);

            // Refresh state to update modal
            refreshState();
        } else {
            setHintMessage("No solution found with current numbers");
            setTimeout(() => {
                setHintMessage("");
            }, 3000);
        }
    };

    const isNumberHinted = (value: number) => {
        if (!showingHint || !hintNumbers) return false;
        
        // Get all numbers in the game
        const allNumbers = [
            ...bigNums,
            ...smallNums,
            ...newNumbers
        ];
        
        // Get the index of the current number in the full array
        const currentIndex = allNumbers.indexOf(value);
        
        // Only highlight if this index is in our highlighted indices
        return highlightedIndices.includes(currentIndex);
    };

    const isOperationHinted = (operation: string) => {
        return showingHint && hintOperation === operation;
    };

    let newNums = newNumbers.map((num, i) => {
        return <Number solved={finished.success} newNum={true} big={false} isPlaying={isPlaying}
                       onClick={() => handleClick(num.toString(), 7 + i)} value={num}
                       used={usedKeys.includes(7 + i)}
                       highlighted={isNumberHinted(num)}/>
    })

    let timerRef = React.createRef<HTMLDivElement>()
    const form =
        <div className={"game-wrapper h-100 d-flex flex-column justify-content-around align-items-center"}>
            <div>
                <FinishedModal 
                    currentStreak={currentStreak} 
                    maxStreak={maxStreak}
                    timeTaken={elapsedTime} 
                    score={scores}
                    clear={clear} 
                    show={finished.finished} 
                    success={finished.success}
                />

                <div ref={timerRef} className={`timer-wrapper mb-3`}>
                    <div className="timer-circle">
                        <div className="timer-content">
                            <div className="timer-display">
                                {formatTime(elapsedTime)}
                            </div>
                            <div>
                                {isPlaying && !finished.success && localStorage.getItem("finished") !== "true" ? (
                                    <Pause onPlayerClick={() => {
                                        setIsPlaying(false);
                                        cacheTimeRemaining(elapsedTime);
                                        setElapsedTime(elapsedTime);
                                    }}/>
                                ) : (
                                    <Play onPlayerClick={() => {
                                        if (localStorage.getItem("finished") !== "true") {
                                            setIsPlaying(true);
                                        }
                                    }}/>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>

                <div className={"p-3 text-center my-1 mx-2"}>
                    <h1 className={"target"}>{isPlaying || finished.success ? target :
                        <FontAwesomeIcon icon={faQuestion}/>}</h1>
                </div>
            </div>
            <div className="game-board">
                <Working totals={totals}/>
                {hintMessage && (
                    <div className="hint-message">
                        {hintMessage}
                    </div>
                )}
            </div>
            <div className="game-board">
                <div className="number-container">
                    {newNums}
                </div>
                <div className="number-container">
                    <Number solved={finished.success} newNum={false} big={true} isPlaying={isPlaying}
                            onClick={() => handleClick(big1.toString(), 1)} value={big1}
                            used={usedKeys.includes(1)}
                            highlighted={isNumberHinted(big1)}/>
                    <Number solved={finished.success} newNum={false} big={true} isPlaying={isPlaying}
                            onClick={() => handleClick(big2.toString(), 2)} value={big2}
                            used={usedKeys.includes(2)}
                            highlighted={isNumberHinted(big2)}/>
                    <Number solved={finished.success} newNum={false} big={false} isPlaying={isPlaying}
                            onClick={() => handleClick(small1.toString(), 3)} value={small1}
                            used={usedKeys.includes(3)}
                            highlighted={isNumberHinted(small1)}/>
                    <Number solved={finished.success} newNum={false} big={false} isPlaying={isPlaying}
                            onClick={() => handleClick(small2.toString(), 4)} value={small2}
                            used={usedKeys.includes(4)}
                            highlighted={isNumberHinted(small2)}/>
                    <Number solved={finished.success} newNum={false} big={false} isPlaying={isPlaying}
                            onClick={() => handleClick(small3.toString(), 5)} value={small3}
                            used={usedKeys.includes(5)}
                            highlighted={isNumberHinted(small3)}/>
                    <Number solved={finished.success} newNum={false} big={false} isPlaying={isPlaying}
                            onClick={() => handleClick(small4.toString(), 6)} value={small4}
                            used={usedKeys.includes(6)}
                            highlighted={isNumberHinted(small4)}/>
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

    return form
}


