import React, {useEffect, useRef, useState} from "react"
import {Row} from "react-bootstrap";
import {Number} from "./number";
import {Action} from "./action";
import {Working} from "./working";
import calculate from "../utils/calculate";
import {FinishedModal} from "./finished_modal";
import {CountdownCircleTimer} from 'react-countdown-circle-timer'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faDivide, faEquals, faMinus, faMultiply, faPlus, faRefresh, faUndo} from '@fortawesome/free-solid-svg-icons'
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
    saveScores: (success: boolean, timeRemaining: number) => void
    bigNums: number[]
    smallNums: number[]
    target: number
}

export const KeyPad: React.FC<KeyPadProps> = (props: KeyPadProps) => {

    const {bigNums, smallNums, target, saveScores, userId} = props

    // const data = store().getState()
    // const [input, setIsInput] = useState("");

    const [isPlaying, setIsPlaying] = useState<boolean>(false)

    const [numbers, setNewNumbers] = useState<number[]>(JSON.parse(localStorage.getItem("newNumbers")) as number[] || [])

    const [usedKeys, setUsedKeys] = useState<number[]>(JSON.parse(localStorage.getItem("usedKeys")) as number[] || [] )

    const [timeRemaining, setTimeRemaining] = useState<number>(60)
    const [elapsedTime, setElapsedTime] = useState<number>(0)

    const [finished, setIsFinished] = useState<finished>({finished: false, success: false})

    let scores = JSON.parse(localStorage.getItem("scores")) as score
    if (scores == undefined) {
        localStorage.setItem("scores", JSON.stringify({averageTime: 0, gamesPlayed: 0, gamesWon: 0 , bestTime: undefined}))
    }

    let lastPlayed = localStorage.getItem("lastPlayed")

    let today = new Date().setHours(0,0,0,0)
    console.log(today)
    console.log(new Date())
    console.log(localStorage.getItem("lastPlayed"))
    let gameInProgress = !JSON.parse(localStorage.getItem("finished")) as boolean || false
    // const target = getRandomArbitrary(101, 999)

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
        localStorage.setItem("finished", "true")
        setIsFinished({
            finished: true,
            success: true
        })
        setIsPlaying(false)
        saveScore(success, timeRemaining)
    }

    const timeUp = () => {
        localStorage.setItem("finished", "true")
        setIsPlaying(false)
        setIsFinished({finished: true, success: false})
        saveScore(false, 0)
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

    const clear = () => {
        setTotals({
            equals: false,
            total: null,
            next: null,
            operation: null,
        })


        cacheNewNumbers([])
        cacheUsedKeys([])
        setIsFinished({
            finished: false,
            success: false
        })
    }

    const saveScore = async (success: boolean, timeRemaining: number): Promise<void>  => {
        const timeTaken = 60 - timeRemaining
        if (success) {
            scores.gamesWon += 1
            scores.averageTime = (scores.averageTime*scores.gamesPlayed + timeTaken) / (scores.gamesPlayed + 1)
        }
        if (timeTaken < scores.bestTime || scores.bestTime == undefined) { scores.bestTime = timeTaken }
        scores.gamesPlayed += 1

        localStorage.setItem("scores", JSON.stringify(scores))
        localStorage.setItem("lastPlayed", JSON.stringify(Date.now()))
    }

    const handleClick = (value: string, key?: number) => {
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
                usedKeys.pop()
            } else if (totals.operation) {
                setTotals(
                    {
                        equals: false,
                        total: totals.total,
                        next: totals.next,
                        operation: null
                    }
                )
            }
            return
        }

        if (isNumber(value) && totals.next != null) {
            usedKeys.pop()
            cacheUsedKeys(usedKeys)
        }

        const newTotals = calculate(totals, value)

        setTotals(newTotals);
        if (newTotals.equals) {
            if (newTotals.total == target) {

                gameOver(true)
                return
            }

            numbers.push(newTotals.total)
            cacheNewNumbers(numbers)
            setTotals({
                equals: false,
                total: null,
                next: null,
                operation: null,
            })
        }
        if (key != null) {
            usedKeys.push(key)
            cacheUsedKeys(usedKeys)
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

        return (
            <div className="time-wrapper">
                <div key={remainingTime} className={`time ${isTimeUp ? "up" : ""}`}>
                    {remainingTime}
                </div>
                {prevTime.current !== null && (
                    <div
                        key={prevTime.current}
                        className={`time ${!isTimeUp ? "down" : ""}`}
                    >
                        {prevTime.current}
                    </div>
                )}
            </div>
        );
    };

    let newNums = numbers.map((num, i) => {
        return <Number newNum={true} big={false} isPlaying={isPlaying} onClick={() => handleClick(num.toString(), 7 + i)} value={num} used={usedKeys.includes(7 + i)}/>
    })

    const [hasBeenPaused, setHasBeenPaused] = useState<boolean>(false)
    let parsedStorageTime = JSON.parse(localStorage.getItem("timeRemaining")) as number;
    let parsedElapsedTime = JSON.parse(localStorage.getItem("elapsedTime")) as number;
    let duration = hasBeenPaused ? parsedStorageTime + parsedElapsedTime : parsedStorageTime || 60


    const play = () => {
        if (isPlaying) {
            cacheTimeRemaining(timeRemaining, elapsedTime)
            setHasBeenPaused(true)
        } else {
        }

        setIsPlaying(!isPlaying)
    }

    // var modal = finished.finished ? <FinishedModal success={finished.success}/> : null
    const form =
        <div className={"full-height d-flex flex-column justify-content-around"}>
            <Row className={"justify-content-center align-items-center"}>
                <h1 className={"page-title"}>Numble</h1>
            </Row>
            <Row className={"justify-content-center align-items-center"}>
                <FinishedModal timeTaken={60-timeRemaining} score={scores} clear={() => clear()} show={finished.finished} success={finished.success}/>
                <div className="timer-wrapper mb-3">
                    <CountdownCircleTimer
                        isPlaying={isPlaying}
                        duration={duration}
                        colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                        colorsTime={[45, 30, 10, 0]}
                        onComplete={(time:number) => timeUp()}
                    >
                        {renderTime}
                    </CountdownCircleTimer>
                </div>
                    <div className="player d-flex justify-content-around ml-2 my-3"
                         style={{
                             border: "none",
                             cursor: "pointer",
                             height: 100,
                             outline: "none",
                             borderRadius: "100%",
                             width: 100
                         }}>
                        {isPlaying ? <Pause onPlayerClick={() => play()} /> : <Play onPlayerClick={() => play()} />}
                    </div>
            </Row>
            <Row className={"justify-content-center align-items-center"}>
                <div className={"d-flex justify-content-between h-100 align-items-center"}>
                    <div className="p-3 calculator-container">
                        <div className={"p-3 text-center my-1 mx-2"}>
                            <h1 className={"target"}>{isPlaying ? target : "?"}</h1>
                        </div>
                        <Working totals={totals}/>
                        <div className={"w-100 keypad d-flex flex-column justify-content-around"}>
                            <div>
                                <div className={"d-flex justify-content-end"}>
                                    {newNums}
                                </div>
                                <div className={"d-flex justify-content-between"}>
                                    <Number newNum={false} big={true} isPlaying={isPlaying} onClick={() => handleClick(big1.toString(), 1)} value={big1} used={usedKeys.includes(1)}/>
                                    <Number newNum={false} big={true} isPlaying={isPlaying} onClick={() => handleClick(big2.toString(), 2)} value={big2} used={usedKeys.includes(2)}/>
                                    <Number newNum={false} big={false} isPlaying={isPlaying} onClick={() => handleClick(small1.toString(), 3)} value={small1} used={usedKeys.includes(3)}/>
                                    <Number newNum={false} big={false} isPlaying={isPlaying} onClick={() => handleClick(small2.toString(), 4)} value={small2} used={usedKeys.includes(4)}/>
                                    <Number newNum={false} big={false} isPlaying={isPlaying} onClick={() => handleClick(small3.toString(), 5)} value={small3} used={usedKeys.includes(5)}/>
                                    <Number newNum={false} big={false} isPlaying={isPlaying} onClick={() => handleClick(small4.toString(), 6)} value={small4} used={usedKeys.includes(6)}/>
                                </div>
                            </div>

                                <div className={"mb-3 d-flex flex-column justify-content-around"}>
                                    <div className={"d-flex justify-content-between"}>
                                        <button className={"round-clickable"} onClick={() => handleClick("+")}><FontAwesomeIcon icon={faPlus} /></button>
                                        <button className={"round-clickable"} onClick={() => handleClick("-")}><FontAwesomeIcon icon={faMinus} /></button>
                                        <button className={"round-clickable"} onClick={() => handleClick("x")}><FontAwesomeIcon icon={faMultiply} /></button>
                                        <button className={"round-clickable"} onClick={() => handleClick("÷")}><FontAwesomeIcon icon={faDivide} /></button>
                                    </div>
                                    <div className={"d-flex mt-3 justify-content-around"}>
                                        <button className={"round-clickable w-100"} onClick={() => handleClick("=")}><FontAwesomeIcon icon={faEquals} /></button>
                                    </div>
                                </div>
                                <div className={"d-flex justify-content-stretch align-items-stretch"}>
                                        <button className={"round-clickable"} onClick={() => handleClick("<-")}><FontAwesomeIcon icon={faUndo} /></button>
                                        <button className={"round-clickable mx-3"} onClick={() => handleClick("AC")}><FontAwesomeIcon icon={faRefresh} /></button>
                                </div>
                        </div>
                    </div>

                </div>
            </Row>
        </div>

    return form
}

