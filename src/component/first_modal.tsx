import React from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";
import {faCircleQuestion, faCross} from "@fortawesome/free-solid-svg-icons";
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
            <p>If you're stuck you can get a hint if you click the <FontAwesomeIcon className={"header-links "} icon={faCircleQuestion} />, but it will end your streak</p>
            <p>Try to beat your best time!</p>
            {buttons}
        </div>
    </div>
}
