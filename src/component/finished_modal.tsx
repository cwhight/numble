import React from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";

export interface FinishedModalProps {
    timeTaken: number
    score: score
    clear: any
    success: boolean
    show: boolean
}

export const FinishedModal: React.FC<FinishedModalProps> = (props: FinishedModalProps) => {
    const {success, clear, score, timeTaken} = props
    let show = props.show
    const reset = () => {
        clear()
        show = false
    }

    const message = success ? `Great Work - you solved it in ${timeTaken} seconds` : "Unlucky this time"

    const buttons = success ? null : <div className={"mt-3"}>
        <Button onClick={reset} className={"btn"}>Try Again</Button>
    </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
                <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>

                        <h2>{message}</h2>
                        <h4><em>Games played:</em> {score.gamesPlayed}</h4>
                        <h4><em>Games won:</em> {score.gamesWon}</h4>
                        <h4><em>Average Time:</em> {score.averageTime}</h4>
                        <h4><em>Best Score:</em> {score.bestTime}</h4>
                    {buttons}
                </div>
            </div>
}
