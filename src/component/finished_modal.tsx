import React, {useState} from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";
import {exportComponentAsJPEG} from "react-component-export-image";

export interface FinishedModalProps {
    timeTaken: number
    score: score
    clear: any
    success: boolean
    show: boolean
    timerRef: any
    currentStreak: number
    maxStreak: number
}

export const FinishedModal: React.FC<FinishedModalProps> = (props: FinishedModalProps) => {
    const {success, clear, score, timeTaken, timerRef, currentStreak, maxStreak} = props
    let show = props.show
    const reset = () => {
        clear()
        show = false
    }

    const [showCopyMsg, setShowCopyMsg] = useState(false);
    const [msg, setMsg] = useState("");

    async function copyToClipboard() {

        const shareString = `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
${success ? `Today's Time: 🎉 ${timeTaken} Seconds 🎉` : ""}
Average Time: ${score.gamesWon > 0 ?  Math.round(score.averageTime) + " Seconds" : "N/A"}
Best Time: ${score.gamesWon > 0 ? score.bestTime + " Seconds" : "N/A"}
https://www.numble-game.co.uk`;

        setMsg("Copied to clipboard!");
        setShowCopyMsg(true);
        setTimeout(() => setShowCopyMsg(false), 2000);
        if ("clipboard" in navigator) {
            return await navigator.clipboard.writeText(shareString);
        } else {
            return document.execCommand("copy", true, shareString);
        }
    }

    const message = success ? `Great Work - you solved it in ${timeTaken} seconds` : "Unlucky this time"

    const copyMessage = showCopyMsg ? <span>{msg}</span> : null

    const buttons = success ?
        <div className={"mt-3"}>
            <Button onClick={() => copyToClipboard()} className={"btn"}>Share</Button>
            <div>{copyMessage}</div>
        </div>
        : <div className={"mt-3"}>
            <Button onClick={reset} className={"btn"}>Try Again</Button>
        </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
        <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>

            <h2>{message}</h2>
            <h4><em>Games played:</em> {score.gamesPlayed}</h4>
            <h4><em>Games won:</em> {score.gamesWon}</h4>
            <h4><em>Average Time:</em> {score.gamesWon > 0 ? Math.round(score.averageTime) + " Seconds" : "N/A"}</h4>
            <h4><em>Best Score:</em> {score.gamesWon > 0 ? score.bestTime + " Seconds" : "N/A"}</h4>
            {buttons}
        </div>
    </div>
}
