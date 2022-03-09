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
    let minutes = Math.floor(todaysScore / 60)
    let seconds = todaysScore % 60
    let timeMessage = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`

    const streak = localStorage.getItem("currentStreak")
    const maxStreak = localStorage.getItem("maxStreak")

    const [showCopyMsg, setShowCopyMsg] = useState(false);
    const [msg, setMsg] = useState("");

    async function copyToClipboard() {

        const shareString = `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
${
            todaysScore != 0 ? `Today's Time: 🎉 ${timeMessage} 🎉` : ""
        }
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
    const copyMessage = showCopyMsg ? <span>{msg}</span> : null

    const buttons = <div className={"w-100 mt-3 d-flex flex-column"}>
        <div className={"d-flex justify-content-around w-100"}>

            <button onClick={() => reset()} className={"mr-3 btn btn-tertiary"}>Close</button>
            <button onClick={() => copyToClipboard()} className={"btn btn-primary"}>Share</button>
        </div>
        <div>{copyMessage}</div>

    </div>

    const className = show ? "modal-cont display-block" : "modal-cont display-none"

    return <div className={className}>
        <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around"}>

            <h2 className={"text-center"}>Welcome to Numble</h2>
            <p className={"text-center"}>A daily number puzzle</p>
            { todaysScore != 0 ? <h4><em>Today's Time:</em> {todaysScore + " Seconds"} </h4> : null}

            <h4 className={"text-left"}><em>Games played:</em> {scores.gamesPlayed}</h4>
            <h4 className={"text-left"}><em>Games won:</em> {scores.gamesWon}</h4>
            <h4 className={"text-left"}><em>Average Time:</em> {scores.gamesWon > 0 ? Math.round(scores.averageTime) + " Seconds" : "N/A"}</h4>
            <h4 className={"text-left"}><em>Best Score:</em> {scores.gamesWon > 0 ? scores.bestTime + " Seconds": "N/A"}</h4>
            <h4 className={"text-left"}><em>Streak:</em> {streak}</h4>
            <h4 className={"text-left"}><em>Max Streak:</em> {maxStreak}</h4>
            {buttons}

            <span className={"mt-3"}>Enjoying Numble? Why not try our sister game <a href={"https://www.jumble-game.co.uk"}>Jumble</a></span>
        </div>
    </div>
}
