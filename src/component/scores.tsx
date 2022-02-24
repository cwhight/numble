import React from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";
import {faCross} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ScoresModalProps {
    show: boolean
    close: any
    scores: score
}

export const ScoresModal: React.FC<ScoresModalProps> = (props: ScoresModalProps) => {
    let {show, close, scores} = props
    const reset = () => {
        show = false
        close()
    }


    const buttons = <div className={"mt-3"}>
        <Button onClick={() => reset()} className={"btn"}>Close</Button>
    </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
        <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>

            <h2>Welcome to Numble</h2>
            <p>A daily number puzzle</p>
            <h4><em>Games played:</em> {scores.gamesPlayed}</h4>
            <h4><em>Games won:</em> {scores.gamesWon}</h4>
            <h4><em>Average Time:</em> {scores.averageTime}</h4>
            <h4><em>Best Score:</em> {scores.bestTime}</h4>
            {buttons}
        </div>
    </div>
}
