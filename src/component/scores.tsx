import React, {useState} from "react";
import {Button} from "react-bootstrap";
import {score} from "./keypad";

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

    let todaysScore = JSON.parse(localStorage.getItem("todaysTime")) as number || 0

    const attempts = JSON.parse(localStorage.getItem("attempts")) as number || 0
    const [showCopyMsg, setShowCopyMsg] = useState(false);
    const [msg, setMsg] = useState("");

    async function copyToClipboard() {
        const attemptString = attempts == 1 ? "attempt" : "attempts"

        const shareString = `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
Today's Time: ${
            todaysScore != 0 ? attempts + " " + attemptString + ": " + todaysScore + " Seconds" : ""
        }
Average Time: ${scores.gamesWon > 0 ? scores.averageTime + " Seconds" : "N/A"}
Best Time: ${scores.gamesWon > 0 ? scores.bestTime + " Seconds" : "N/A"}
https://numble-app.herokuapp.com`;

        setMsg("Copied to clipboard!");
        setShowCopyMsg(true);
        setTimeout(() => setShowCopyMsg(false), 2000);
        if ("clipboard" in navigator) {
            return await navigator.clipboard.writeText(shareString);
        } else {
            return document.execCommand("copy", true, shareString);
        }
    }
    const copyMessage = showCopyMsg ? <span>{msg}</span> : null

    const buttons = <div className={"mt-3 d-flex flex-column"}>
        <div>

            <Button onClick={() => reset()} className={"mr-3 btn"}>Close</Button>
            <Button onClick={() => copyToClipboard()} className={"btn"}>Share</Button>
        </div>
        <div>{copyMessage}</div>

    </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
        <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>

            <h2>Welcome to Numble</h2>
            <p>A daily number puzzle</p>
            { todaysScore != 0 ? <h4><em>Today's Time:</em> {todaysScore + " Seconds"} </h4> : null}

            <h4><em>Games played:</em> {scores.gamesPlayed}</h4>
            <h4><em>Games won:</em> {scores.gamesWon}</h4>
            <h4><em>Average Time:</em> {scores.averageTime + " Seconds"}</h4>
            <h4><em>Best Score:</em> {scores.bestTime + " Seconds"}</h4>
            {buttons}
        </div>
    </div>
}
