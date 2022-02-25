import React, {useEffect, useRef, useState} from "react"
import {Number} from "./number";
import {Working} from "./working";
import calculate from "../utils/calculate";
import {FinishedModal} from "./finished_modal";
import {CountdownCircleTimer} from 'react-countdown-circle-timer'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import ReactGA from 'react-ga';
const TRACKING_ID = "UA-221463714-1"; // YOUR_OWN_TRACKING_ID

ReactGA.initialize(TRACKING_ID);
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
    showClock: boolean
}


export const KeyPad: React.FC<KeyPadProps> = (props: KeyPadProps) => {

    const {bigNums, smallNums, target, userId} = props

    const [showClock, setShowClock] = useState<boolean>(props.showClock)
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [attempts, setAttempts] = useState<number>(JSON.parse(localStorage.getItem("attempts")) as number || 0)
    const [numbers, setNewNumbers] = useState<number[]>(JSON.parse(localStorage.getItem("newNumbers")) as number[] || [])

    const [typedKeys, setTypedKeys] = useState<number[]>([])
    const [usedKeys, setUsedKeys] = useState<number[]>(JSON.parse(localStorage.getItem("usedKeys")) as number[] || [])

    const [timeRemaining, setTimeRemaining] = useState<number>(120)
    const [elapsedTime, setElapsedTime] = useState<number>(0)

    const [finished, setIsFinished] = useState<finished>({finished: false, success: false})
    const [hasPlayedToday, setHasPlayedToday] = useState<boolean>(false)

    let scores = JSON.parse(localStorage.getItem("scores")) as score
    if (scores == undefined) {
        let scoresSet = {
            averageTime: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            bestTime: 120
        };
        localStorage.setItem("scores", JSON.stringify(scoresSet))
        scores = scoresSet
    }
    let lastPlayed = localStorage.getItem("lastPlayed")

    let today = new Date().setHours(0, 0, 0, 0)
    const lastPlayedInt = parseInt(lastPlayed)
    const [solved, setSolved] = useState(JSON.parse(localStorage.getItem("solved")) as boolean || false)

    let played: boolean
    if (lastPlayedInt >= today && !hasPlayedToday) {
        setHasPlayedToday(true)
        played = true
    }

    if (!hasPlayedToday && !played && attempts != 0) {
        if (solved) {
            setSolved(false)
            localStorage.setItem("solved", "false")
            localStorage.setItem("todaysTime", "0")
        }
        setAttempts(0)
        localStorage.setItem("attempts", "0")
    }

    const big1 = bigNums[0]
    const big2 = bigNums[1]

    const small1 = smallNums[0]
    const small2 = smallNums[1]
    const small3 = smallNums[2]
    const small4 = smallNums[3]

    const [totals, setTotals] = useState({equals: false, total: null, next: null, operation: null});
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
            action: 'Won'
        })
        if (attempts == 0) {
            localStorage.setItem("todaysTime", (120 - timeRemaining).toString())
        }

        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem("attempts", (newAttempts).toString())
        localStorage.setItem("finished", "true")
        setIsFinished({
            finished: true,
            success: true
        })
        setSolved(true)
        localStorage.setItem("solved", "true")
        setIsPlaying(false)
        saveScore(success, timeRemaining)
    }

    const timeUp = () => {
        ReactGA.event({
            category: 'Game',
            action: 'Lost'
        })

        localStorage.setItem("finished", "true")
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem("attempts", (newAttempts).toString())

        setIsPlaying(false)
        setIsFinished({finished: true, success: false})
        saveScore(false, 0)
        setTimeRemaining(120)
        setElapsedTime(0)
        setHasBeenPaused(false)
        cacheTimeRemaining(120, 0)
    }

    const cacheTimeRemaining = (time: number, elapsed: number) => {
        localStorage.setItem("timeRemaining", JSON.stringify(time))
        localStorage.setItem("elapsedTime", JSON.stringify(elapsed))
    }

    const cacheNewNumbers = (numbers: number[]) => {
        setNewNumbers(numbers)
        localStorage.setItem("newNumbers", JSON.stringify(numbers))
    }

    const cacheUsedKeys = (keys: number[]) => {
        setUsedKeys(keys)
        localStorage.setItem("usedKeys", JSON.stringify(keys))
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

    const [hasRetried, setHasRetried] = useState<boolean>(false)

    const retry = () => {
        clear()
        setKey(key + 1)
        // setTimeRemaining(120)
        // setElapsedTime(0)
        // setHasBeenPaused(false)
        // cacheTimeRemaining(120, 0)
        setDuration(120)
        setHasRetried(true)
    }

    const saveScore = async (success: boolean, timeRemaining: number): Promise<void> => {
        if (!hasPlayedToday) {
            const timeTaken = 120 - timeRemaining
            if (success) {
                if (scores.gamesWon == 0 || scores.gamesWon == null) {
                    scores.averageTime = timeTaken
                } else {
                    scores.averageTime = (scores.averageTime * scores.gamesWon + timeTaken) / (scores.gamesWon + 1)
                }
                scores.gamesWon += 1
            }
            if ((timeTaken < scores.bestTime || scores.bestTime == undefined) && success) {
                scores.bestTime = timeTaken
            }
            scores.gamesPlayed += 1

            localStorage.setItem("scores", JSON.stringify(scores))
            localStorage.setItem("lastPlayed", JSON.stringify(Date.now()))
        }

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
                typedKeys.pop()
                setTypedKeys(typedKeys)
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
                typedKeys.pop()
                setTypedKeys(typedKeys)
            }
            return
        }

        if (value == "Undo") {
            setTypedKeys([])
            usedKeys.pop()
            usedKeys.pop()
            cacheUsedKeys(usedKeys)
            numbers.pop()
            cacheNewNumbers(numbers)
            clearTotals()
            return
        }

        if (isNumber(value)) {
            if (typedKeys[0] == key) {
                if (totals.operation) {
                    return
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
                return
            } else {
                if (!totals.operation) {
                    typedKeys.pop()
                }
                typedKeys.push(key)
                setTypedKeys(typedKeys)
            }
        }

        const newTotals = calculate(totals, value)

        setTotals(newTotals);
        // if (key != null) {
        //     typedKeys.push(key)
        //     setTypedKeys(typedKeys)
        // }

        if (newTotals.equals) {
            if (newTotals.total == target) {
                gameOver(true)
                return
            }

            usedKeys.push(typedKeys[0])
            usedKeys.push(typedKeys[1])
            setTypedKeys([])
            cacheUsedKeys(usedKeys)
            numbers.push(newTotals.total)
            cacheNewNumbers(numbers)
            setTotals({
                equals: false,
                total: null,
                next: null,
                operation: null,
            })
        }
    };

    const renderTime = ({remainingTime, elapsedTime}: any) => {
        setElapsedTime(elapsedTime)
        setTimeRemaining(remainingTime)
        const currentTime = useRef(remainingTime);
        const prevTime = useRef(null);
        const isNewTimeFirstTick = useRef(false);
        const [, setOneLastRerender] = useState(0);

        if (currentTime.current !== remainingTime) {
            isNewTimeFirstTick.current = true;
            prevTime.current = currentTime.current;
            currentTime.current = remainingTime;
        } else {
            isNewTimeFirstTick.current = false;
        }

        // force one last re-render when the time is over to tirgger the last animation
        if (remainingTime === 0) {
            setTimeout(() => {
                setOneLastRerender((val) => val + 1);
            }, 20);
        }

        const isTimeUp = isNewTimeFirstTick.current;

        if (isTimeUp) {
            setElapsedTime(0)
            setTimeRemaining(120)
        }
        return (
            <div className="time-wrapper">
                <div key={remainingTime} className={`time ${isTimeUp ? "up" : ""}`}>
                    {remainingTime}
                </div>
            </div>
        );
    };

    let newNums = numbers.map((num, i) => {
        return <Number solved={solved} newNum={true} big={false} isPlaying={isPlaying}
                       onClick={() => handleClick(num.toString(), 7 + i)} value={num}
                       used={usedKeys.includes(7 + i)}/>
    })

    const [hasBeenPaused, setHasBeenPaused] = useState<boolean>(false)
    let parsedStorageTime = JSON.parse(localStorage.getItem("timeRemaining")) as number;
    let parsedElapsedTime = JSON.parse(localStorage.getItem("elapsedTime")) as number;
    let durationCalc = hasBeenPaused ? parsedStorageTime + parsedElapsedTime : hasRetried ? 120 : parsedStorageTime || 120
    const [duration, setDuration] = useState<number>(durationCalc)

    const [key, setKey] = useState(0)

    const play = () => {
        if (solved) {
            return
        }

        setShowClock(true)
        if (isPlaying) {
            cacheTimeRemaining(timeRemaining, elapsedTime)
            setShowClock(false)
            setHasBeenPaused(true)
        } else {
            setDuration(durationCalc)
            setHasRetried(false)
        }

        setIsPlaying(!isPlaying)
    }


    let timerRef = React.createRef<HTMLDivElement>()
    const form =
        <div className={"game-wrapper h-100 d-flex flex-column justify-content-around align-items-center"}>
            <div>
                <FinishedModal attempts={attempts} timerRef={timerRef} timeTaken={120 - timeRemaining} score={scores}
                               clear={() => retry()}
                               show={finished.finished} success={finished.success}/>

                <div ref={timerRef} className={`timer-wrapper mb-3 ${!showClock ? "display-none" : ""}`}>
                    <CountdownCircleTimer
                        size={120}
                        key={key}
                        isPlaying={isPlaying && !solved}
                        duration={duration}
                        colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                        colorsTime={[45, 30, 10, 0]}
                        onComplete={(time: number) => timeUp()}
                    >
                        {renderTime}
                    </CountdownCircleTimer>
                </div>
            </div>
            <div>
                <div className={"mb-3"}>
                    {isPlaying ? <Pause onPlayerClick={() => play()}/> : <Play onPlayerClick={() => play()}/>}
                </div>
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


