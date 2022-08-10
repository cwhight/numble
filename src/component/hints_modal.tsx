import React, {useState} from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";
import {faCross} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export interface HintsModalProps {
    show: boolean
    close: any
    hints: string[]
    refresh: boolean
}

export const HintsModal: React.FC<HintsModalProps> = (props: HintsModalProps) => {
    let {show, close, hints, refresh} = props
    const reset = () => {
        show = false
        close()
    }

    const [hintsUsed, setHintsUsed] = useState(JSON.parse(localStorage.getItem("hintsUsed")) as number || 0)
    const [displayedHints, setDisplayedHints] = useState(JSON.parse(localStorage.getItem("displayedHints")) as string[] || [])
    const [hasBeenResetToday, setHasBeenResetToday] = useState<boolean>(false)

    let lastPlayed = localStorage.getItem("lastPlayed")
    let today = new Date().setHours(0, 0, 0, 0)
    const lastPlayedInt = parseInt(lastPlayed)

    if (lastPlayedInt < today && !hasBeenResetToday) {
        setHintsUsed(0)
        setDisplayedHints([])
        localStorage.setItem("hintsUsed", "0")
        localStorage.setItem("displayedHints", JSON.stringify([]))
        setHasBeenResetToday(true)
    }

    const showHint = () => {
        if (hintsUsed < hints.length - 1) {
            const newHintsUsed = hintsUsed + 1
            setHintsUsed(newHintsUsed)
            localStorage.setItem("hintsUsed", newHintsUsed.toString())
            displayedHints.push(hints[newHintsUsed - 1])
            setDisplayedHints(displayedHints)
            localStorage.setItem("displayedHints", JSON.stringify(displayedHints))
        }
    }

    let hintBanner = displayedHints.map((hint: string) => {
        return <p>{hint}</p>
    })

    const buttons = <div className={"w-100 mt-3 d-flex justify-content-around"}>
        <Button onClick={() => reset()} className={"btn btn-primary"}>PLAY</Button>
        <button className={"btn btn-tertiary"} onClick={() => showHint()}>HINT</button>
    </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
        <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>
            <h2>Welcome to Numble!</h2>
            <p>If you're stuck you can get a hint, but it will end your streak</p>
            {hintBanner}
            {buttons}
        </div>
    </div>
}
