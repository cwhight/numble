import React from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";
import {faCross} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface FirstModalProps {
    show: boolean
    close: any
}

export const FirstModal: React.FC<FirstModalProps> = (props: FirstModalProps) => {
    let {show, close} = props
    const reset = () => {
        show = false
        close()
    }


    const buttons = <div className={"mt-3"}>
        <Button onClick={() => reset()} className={"btn"}>PLAY</Button>
    </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
        <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>

            <h2>Welcome to Numble!</h2>
            <p>A daily number puzzle</p>
            <p>You begin with 2 large numbers, 4 small numbers and 1 target number</p>
            <p>Perform a series of operations (+, -, x, ÷) between two numbers to get to the total</p>
            <p>Each number can only be used once. Once you've performed one operation the result will be available to use in the next operation.</p>
            <p>You have 2 minutes to solve the puzzle, try to beat your best time!</p>
            <p>You can retry the puzzle if you don't succeed but we won't count it towards your scores.</p>
            {buttons}
        </div>
    </div>
}
