import React from "react";
import {Button, Modal} from "react-bootstrap";
import { score } from "./keypad";

export interface FinishedModalProps {
    timeTaken: number
    score: score
    clear: any
    success: boolean
    show: boolean
}

export const FinishedModal: React.FC<FinishedModalProps> = (props: FinishedModalProps) => {
    const {success, show, clear, score, timeTaken} = props

    const reset = () => {
        clear()
    }

    const message = success ? `Great Work - you solved it in ${timeTaken} seconds` : "Unlucky this time"

    const buttons = success ? null : <div className={"mt-3"}>
        <Button onClick={clear} className={"btn"}>Try Again</Button>
    </div>

    return <Modal
                  show={show}
                  aria-labelledby="contained-modal-title-vcenter"
                  contentLabel="Example Modal">
                <div className={"p-3 h-75 d-flex flex-column align-items-center justify-content-around"}>
                    <h1 className={"grey-text"}>You have finished</h1>
                    <div>
                        {message}
                    </div>
                    <div>
                        <p>Games played: {score.gamesPlayed}</p>
                        <p>Games won: {score.gamesWon}</p>
                        <p>Average Time: {score.averageTime}</p>
                        <p>Best Score: {score.bestTime}</p>
                    </div>
                    {buttons}
                </div>
            </Modal>
}
