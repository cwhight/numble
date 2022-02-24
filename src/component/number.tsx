import React from "react";
import {ButtonProps} from "react-bootstrap";

export interface NumberProps extends ButtonProps {
    isPlaying: boolean
    onClick?: any
    value: number
    used: boolean
    big: boolean
    newNum: boolean
}

export const Number: React.FC<NumberProps> = (props: NumberProps) => {
    var {value, used, onClick, isPlaying, big, newNum} = props

    const click = () => {
        if (!used) {
            onClick()
        }
    }

    return <button onClick={click} className={`btn clickable p-2 mb-2 ${used ? "used" : ""} ${big ? "bigNum" : newNum ? "newNum" : "smallNum"}`}>{ isPlaying ? value : ""}</button>
}