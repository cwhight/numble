import React, {useEffect, useRef, useState} from "react"
import {Col, Container, Row} from "react-bootstrap";
import {Number} from "./number";
import {Action} from "./action";
import {Working} from "./working";
import calculate from "../utils/calculate";
import {FinishedModal} from "./finished_modal";
import {getRandomArbitrary} from "../utils/number";
import store from "../redux/store";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import axios from "axios";

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
    scores: score
    saveScores: (success: boolean, timeRemaining: number) => void
    bigNums: number[]
    smallNums: number[]
    target: number
}

export const KeyPad: React.FC<KeyPadProps> = (props: KeyPadProps) => {

    const {bigNums, smallNums, target, saveScores} = props
    let scores = props.scores
    // const data = store().getState()
    // const [input, setIsInput] = useState("");

    const [numbers, setNewNumbers] = useState<number[]>([])

    const [usedKeys, setUsedKeys] = useState<number[]>([])

    const [timeRemaining, setTimeRemaining] = useState<number>(60)

    const [finished, setIsFinished] = useState<finished>({finished: false, success: false})

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


    const gameOver = () => {
        saveScore(finished.success, timeRemaining)
    }

    const timeUp = () => {
        setIsFinished({finished: true, success: false})
        saveScores(finished.success, timeRemaining)
    }

    const clear = () => {
        setTotals({
            equals: false,
            total: null,
            next: null,
            operation: null,
        })
        setNewNumbers([])
        setUsedKeys([])
        setIsFinished({
            finished: false,
            success: false
        })
    }
    const saveScore = async (success: boolean, timeRemaining: number): Promise<void>  => {
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        console.log("HELLLOOOOO")
        try {
            const timeTaken = success ? 60 - timeRemaining : 61
            const body = {user_id: "", time_taken: timeTaken}
            const response = await axios.post("https://numble-game.herokuapp.com/scores", body)
            // this.setState({scores: setScores(response.data.scores), hasUpToDateScores: true});
        } catch (e) {
            console.log(e)
            // this.setState({...this.state, isFetching: false});
        }
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
        }

        const newTotals = calculate(totals, value)

        setTotals(newTotals);
        if (newTotals.equals) {
            if (newTotals.total == target) {
                setIsFinished({
                    finished: true,
                    success: true
                })
                gameOver()
                return
            }

            numbers.push(newTotals.total)
            // setNewNumbers(numbers.push(totals.total))
            setTotals({
                equals: false,
                total: null,
                next: null,
                operation: null,
            })
            // if (usedKeys.length >= (6 + newNums.length)) {
            //     setIsFinished({
            //         finished: true,
            //         success: false
            //     })
            // }
        }
        if (key != null) {
            usedKeys.push(key)
            // setUsedKeys(usedKeys)
        }
    };

    const renderTime = ({remainingTime}: any) => {
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

    var newNums = numbers.map((num, i) => {
        return <Number onClick={() => handleClick(num.toString(), 7 + i)} value={num} used={usedKeys.includes(7 + i)}/>
    })

    // var modal = finished.finished ? <FinishedModal success={finished.success}/> : null
    const form =
        <Container className={"full-height d-flex flex-column justify-content-around"}>
            <Row className={"justify-content-center align-items-center"}>
                <h1 className={"page-title"}>Numble</h1>
            </Row>
            <Row className={"justify-content-center align-items-center"}>
                <FinishedModal timeTaken={60-timeRemaining} score={scores} clear={() => clear()} show={finished.finished} success={finished.success}/>
                <div className="timer-wrapper">
                    <CountdownCircleTimer
                        isPlaying={!finished.finished}
                        duration={60}
                        colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                        colorsTime={[45, 30, 10, 0]}
                        onComplete={(time:number) => timeUp()}
                    >
                        {renderTime}
                    </CountdownCircleTimer>
                </div>
            </Row>
            <Row className={"justify-content-center align-items-center"}>
                <Col sm={12} lg={6} className={"d-flex h-100 align-items-center"}>
                    <div className="p-3 calculator-container">
                        <div className={"p-3 text-center my-1 mx-2"}>
                            <h1>{target}</h1>
                        </div>
                        <Working totals={totals}/>
                        <div className={"d-flex justify-content-around"}>
                            {newNums}
                        </div>
                        <div className={"d-flex justify-content-around"}>
                            <Number onClick={() => handleClick(big1.toString(), 1)} value={big1} used={usedKeys.includes(1)}/>
                            <Number onClick={() => handleClick(big2.toString(), 2)} value={big2} used={usedKeys.includes(2)}/>
                            <Number onClick={() => handleClick(small1.toString(), 3)} value={small1} used={usedKeys.includes(3)}/>
                        </div>
                        <div className={"mb-3 d-flex justify-content-around"}>
                            <Number onClick={() => handleClick(small2.toString(), 4)} value={small2} used={usedKeys.includes(4)}/>
                            <Number onClick={() => handleClick(small3.toString(), 5)} value={small3} used={usedKeys.includes(5)}/>
                            <Number onClick={() => handleClick(small4.toString(), 6)} value={small4} used={usedKeys.includes(6)}/>
                        </div>
                        <div className={"d-flex justify-content-around"}>
                            <Action onClick={() => handleClick("x")} method={"x"}/>
                            <Action onClick={() => handleClick("÷")} method={"÷"}/>
                        </div>
                        <div className={"d-flex justify-content-around"}>
                            <Action onClick={() => handleClick("+")} method={"+"}/>
                            <Action onClick={() => handleClick("-")} method={"-"}/>
                        </div>
                        <div className={"d-flex justify-content-stretch align-items-stretch"}>
                            <Action onClick={() => handleClick("=")} method={"="}/>
                            <Action onClick={() => handleClick("AC")} method={"AC"}/>
                            <Action onClick={() => handleClick("<-")} method={"<-"}/>
                        </div>
                    </div>

                </Col>
            </Row>
        </Container>

    return form
}

