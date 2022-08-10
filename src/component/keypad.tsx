import React, {useEffect, useState} from "react"
import {Number} from "./number";
import {Working} from "./working";
import calculate from "../utils/calculate";
import {FinishedModal} from "./finished_modal";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import ReactGA from 'react-ga';
import {
    faBackspace,
    faDivide,
    faMinus,
    faMultiply,
    faPlus,
    faQuestion,
    faRefresh,
    faUndo
} from '@fortawesome/free-solid-svg-icons'
import Pause from "./pause";
import Play from "./plat";
import Timer from "react-compound-timerv2";

const TRACKING_ID = "UA-221463714-1"; // YOUR_OWN_TRACKING_ID

ReactGA.initialize(TRACKING_ID);

function isNumber(item: any) {
    return !!item.match(/[0-9]+/);
}

interface finished {
    finished: boolean,
    success: boolean
}

export interface score {
    gamesWon: number
    gamesPlayed: number
    averageTime: number
    bestTime: number
}

interface KeyPadProps {
    userId: string
    bigNums: number[]
    smallNums: number[]
    target: number
    hints: string[]
    showClock: boolean
    refreshState: any
}

export const KeyPad: React.FC<KeyPadProps> = (props: KeyPadProps) => {

    const {bigNums, smallNums, target, userId, hints, refreshState} = props

    const [showClock, setShowClock] = useState<boolean>(props.showClock)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [newNumbers, setNewNumbers] = useState<number[]>(JSON.parse(localStorage.getItem("newNumbers")) as number[] || [])
    const [totals, setTotals] = useState({equals: false, total: null, next: null, operation: null});

    const [typedKeys, setTypedKeys] = useState<number[]>([])
    const [previousCalc, setPreviousCalc] = useState<number>(0)

    const [usedKeys, setUsedKeys] = useState<number[]>(JSON.parse(localStorage.getItem("usedKeys")) as number[] || [])

    const parsedElapsedTime = JSON.parse(localStorage.getItem("elapsedTime")) as number || 0
    const [elapsedTimeState, setElapsedTimeState] = useState<number>(parsedElapsedTime)

    const [finished, setIsFinished] = useState<finished>({finished: false, success: false})
    const [hasPlayedToday, setHasPlayedToday] = useState<boolean>(false)
    const [solved, setSolved] = useState(JSON.parse(localStorage.getItem("solved")) as boolean || false)

    const [hasBeenResetToday, setHasBeenResetToday] = useState<boolean>(false)

    let scores = JSON.parse(localStorage.getItem("scores")) as score
    if (scores == undefined) {
        let scoresSet = {
            averageTime: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            bestTime: 0
        };
        localStorage.setItem("scores", JSON.stringify(scoresSet))
        scores = scoresSet
    }

    const [currentStreak, setCurrentStreak] = useState<number>(JSON.parse(localStorage.getItem("currentStreak")) as number || 0)
    const [maxStreak, setMaxStreak] = useState<number>(JSON.parse(localStorage.getItem("maxStreak")) as number || 0)

    let lastPlayed = localStorage.getItem("lastPlayed")
    const lastWon = parseInt(localStorage.getItem("lastWon"))
    let today = new Date().setHours(0, 0, 0, 0)
    let yesterday = today - 86400000
    const lastPlayedInt = parseInt(lastPlayed)

    const cacheNewNumbers = (numbers: number[]) => {
        setNewNumbers(numbers)
        localStorage.setItem("newNumbers", JSON.stringify(numbers))
    }

    const cacheUsedKeys = (keys: number[]) => {
        setUsedKeys(keys)
        localStorage.setItem("usedKeys", JSON.stringify(keys))
    }

    const cacheTimeRemaining = (elapsed: number) => {
        localStorage.setItem("elapsedTime", JSON.stringify(elapsed))
    }

    function clearTotals() {
        setTotals({
            equals: false,
            total: null,
            next: null,
            operation: null,
        })
    }

    const clear = () => {
        clearTotals();
        setTypedKeys([])
        cacheNewNumbers([])
        cacheUsedKeys([])
        setIsFinished({
            finished: false,
            success: false
        })
    }

    if (lastPlayedInt < today && !hasBeenResetToday) {
        cacheNewNumbers([])
        cacheUsedKeys([])
        setTypedKeys([])
        setSolved(false)
        localStorage.setItem("solved", "false")
        localStorage.setItem("todaysTime", "0")
        setElapsedTimeState(0)
        cacheTimeRemaining( 0)
        setHasBeenResetToday(true)
        localStorage.setItem("hintsUsed", "0")
        localStorage.setItem("displayedHints", JSON.stringify([]))
        refreshState()
    }

    let played: boolean
    if (lastPlayedInt >= today && !hasPlayedToday) {
        setHasPlayedToday(true)
        played = true
    }

    if (!hasPlayedToday && !played) {
        if (solved) {
            setSolved(false)
            localStorage.setItem("solved", "false")
            localStorage.setItem("todaysTime", "0")
        }
    }

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


    const gameOver = (success: boolean) => {
        ReactGA.event({
            category: 'Game',
            action: 'Won',
            value: elapsedTimeState
        })

        localStorage.setItem("todaysTime", elapsedTimeState.toString())
        saveScore(success, elapsedTimeState)
        const hintsUsed = JSON.parse(localStorage.getItem("hintsUsed")) as number || 0
        let newStreak: number
        if (hintsUsed > 0) {
            newStreak = 0
        } else if (lastWon > yesterday) {
            newStreak = currentStreak + 1;
        } else {
            newStreak = 1
        }

        localStorage.setItem("lastWon", JSON.stringify(Date.now()))

        localStorage.setItem("currentStreak", newStreak.toString())
        setCurrentStreak(newStreak)

        if (newStreak > maxStreak) {
            localStorage.setItem("maxStreak", newStreak.toString())
            setMaxStreak(newStreak)
        }

        localStorage.setItem("finished", "true")

        setIsFinished({
            finished: true,
            success: true
        })

        setSolved(true)
        localStorage.setItem("solved", "true")

        setIsPlaying(false)
    }

    const saveScore = (success: boolean, timeTaken: number) => {
        if (success) {
            if (scores.gamesWon == 0 || scores.gamesWon == null) {
                scores.averageTime = timeTaken
            } else {
                scores.averageTime = (scores.averageTime * scores.gamesWon + timeTaken) / (scores.gamesWon + 1)
            }
            scores.gamesWon += 1
        }

        if ((timeTaken < scores.bestTime || scores.bestTime == undefined || scores.bestTime == 0) && success) {
            scores.bestTime = timeTaken
        }
        scores.gamesPlayed += 1

        localStorage.setItem("scores", JSON.stringify(scores))
        localStorage.setItem("lastPlayed", JSON.stringify(Date.now()))

        setHasPlayedToday(true)
    }

    const handleClick = (value: string, key?: number) => {
        if (solved) {
            return
        }

        if (!isPlaying) {
            return
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
                typedKeys.push(key)
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
            newNumbers.push(newTotals.total)
            cacheNewNumbers(newNumbers)
            setTotals({
                equals: false,
                total: null,
                next: newTotals.total,
                operation: null,
            })
        }
    };

    let newNums = newNumbers.map((num, i) => {
        return <Number solved={solved} newNum={true} big={false} isPlaying={isPlaying}
                       onClick={() => handleClick(num.toString(), 7 + i)} value={num}
                       used={usedKeys.includes(7 + i)}/>
    })

    const play = () => {
        localStorage.setItem("lastPlayed", JSON.stringify(Date.now()))
        if (solved) {
            return
        }

        setShowClock(true)
        if (isPlaying) {
            setShowClock(false)
        }

        setIsPlaying(!isPlaying)
    }

    let timerRef = React.createRef<HTMLDivElement>()
    const form =
        <div className={"game-wrapper h-100 d-flex flex-column justify-content-around align-items-center"}>
            <div>
                <FinishedModal currentStreak={currentStreak} maxStreak={maxStreak}
                               timerRef={timerRef} timeTaken={elapsedTimeState} score={scores}
                               clear={() => {}}
                               show={finished.finished} success={finished.success}/>

                <div ref={timerRef} className={`timer-wrapper mb-3`}>
                    <Timer
                        onStart={() => play()}
                        onPause={() => play()}
                        initialTime={parsedElapsedTime * 1000} startImmediately={false}
                    >
                        {({start, pause, getTime, stop}: any) => {
                            const elapsedTime = Math.floor(getTime()/1000)
                            setElapsedTimeState(elapsedTime)
                            if (solved) {
                                pause()
                            }
                            return (
                                    <React.Fragment>
                                        <div className={"d-flex flex-column"}>
                                            <div className={"stopwatch d-flex"}>
                                                <h1>{elapsedTime < 600 ? "0" :"" }<Timer.Minutes />:</h1><h1>{elapsedTime % 60 < 10 ? "0" : ""}<Timer.Seconds/></h1>
                                            </div>
                                            <br/>
                                            <div className={"mb-3"}>
                                                {isPlaying ? <Pause onPlayerClick={() => {
                                                    pause()
                                                    cacheTimeRemaining(elapsedTime)
                                                    setElapsedTimeState(elapsedTime)
                                                }}/> : <Play onPlayerClick={start}/>}
                                            </div>
                                        </div>
                                    </React.Fragment>
                                )
                            }
                        }

                    </Timer>
                </div>
            </div>
            <div>

                <div className={"p-3 text-center my-1 mx-2"}>
                    <h1 className={"target"}>{isPlaying || solved ? target :
                        <FontAwesomeIcon icon={faQuestion}/>}</h1>
                </div>
            </div>
            <div className="game-board">
                <Working totals={totals}/>
            </div>
            <div className="game-board d-flex flex-column justify-content-around">
                <div className={"d-flex flex-column justify-content-around"}>
                    <div className={"d-flex justify-content-end"}>
                        {newNums}
                    </div>
                    <div className={"d-flex justify-content-between"}>
                        <Number solved={solved} newNum={false} big={true} isPlaying={isPlaying}
                                onClick={() => handleClick(big1.toString(), 1)} value={big1}
                                used={usedKeys.includes(1)}/>
                        <Number solved={solved} newNum={false} big={true} isPlaying={isPlaying}
                                onClick={() => handleClick(big2.toString(), 2)} value={big2}
                                used={usedKeys.includes(2)}/>
                        <Number solved={solved} newNum={false} big={false} isPlaying={isPlaying}
                                onClick={() => handleClick(small1.toString(), 3)} value={small1}
                                used={usedKeys.includes(3)}/>
                        <Number solved={solved} newNum={false} big={false} isPlaying={isPlaying}
                                onClick={() => handleClick(small2.toString(), 4)} value={small2}
                                used={usedKeys.includes(4)}/>
                        <Number solved={solved} newNum={false} big={false} isPlaying={isPlaying}
                                onClick={() => handleClick(small3.toString(), 5)} value={small3}
                                used={usedKeys.includes(5)}/>
                        <Number solved={solved} newNum={false} big={false} isPlaying={isPlaying}
                                onClick={() => handleClick(small4.toString(), 6)} value={small4}
                                used={usedKeys.includes(6)}/>
                    </div>
                </div>
            </div>
            <div className="game-board d-flex flex-column justify-content-around">
                <div className={"mb-3 d-flex flex-column justify-content-around"}>
                    <div className={"d-flex justify-content-between"}>
                        <button className={"round-clickable"} onClick={() => handleClick("+")}><FontAwesomeIcon
                            icon={faPlus}/></button>
                        <button className={"round-clickable"} onClick={() => handleClick("-")}><FontAwesomeIcon
                            icon={faMinus}/></button>
                        <button className={"round-clickable"} onClick={() => handleClick("x")}><FontAwesomeIcon
                            icon={faMultiply}/></button>
                        <button className={"round-clickable"} onClick={() => handleClick("÷")}><FontAwesomeIcon
                            icon={faDivide}/></button>
                    </div>

                </div>
            </div>
            <div className={"game-board d-flex justify-content-between"}>
                <div>

                    <button className={"round-clickable"} onClick={() => handleClick("Undo")}><FontAwesomeIcon
                        icon={faUndo}/></button>
                    <button className={"round-clickable"} onClick={() => handleClick("<-")}><FontAwesomeIcon
                        icon={faBackspace}/></button>
                </div>
                <button className={"round-clickable"} onClick={() => handleClick("AC")}><FontAwesomeIcon
                    icon={faRefresh}/></button>
            </div>
        </div>

    return form
}


