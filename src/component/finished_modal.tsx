import React, { useState } from "react";
import { Score } from "./keypad";
import { exportAsImage } from "../utils/exportImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faShare, faDownload } from "@fortawesome/free-solid-svg-icons";

export interface FinishedModalProps {
    timeTaken: number;
    score: Score;
    clear: () => void;
    success: boolean;
    show: boolean;
    currentStreak: number;
    maxStreak: number;
}

export const FinishedModal: React.FC<FinishedModalProps> = ({
    success,
    clear,
    score,
    timeTaken,
    currentStreak,
    maxStreak,
    show
}) => {
    const [showCopyMsg, setShowCopyMsg] = useState(false);
    const [msg, setMsg] = useState("");
    const hintsUsed = parseInt(localStorage.getItem("hintsUsed") || "0");

    const reset = () => {
        clear();
    };

    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeMessage = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

    const copyToClipboard = async () => {
        const shareString = `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
${success ? `Time: 🎉 ${timeMessage} 🎉
Hints Used: ${hintsUsed} 🤔` : ""}
https://www.numble-game.co.uk`;

        setMsg("Copied to clipboard!");
        setShowCopyMsg(true);
        setTimeout(() => setShowCopyMsg(false), 2000);

        if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(shareString);
        } else {
            document.execCommand("copy", true, shareString);
        }
    };

    const exportScore = async () => {
        const element = document.getElementById('score-display');
        if (element) {
            await exportAsImage(element, {
                filename: 'numble-score',
                backgroundColor: '#ffffff',
                scale: 2
            });
        }
    };

    const className = show ? "modal-cont display-block" : "modal-cont display-none";

    return (
        <div className={className}>
            <div id="score-display" className="modal-main-cont">
                <div className="modal-header">
                    {success && (
                        <div className="success-icon">
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                    )}
                    <h2>{success ? "Great Work!" : "Time's Up!"}</h2>
                    {success && (
                        <div className="time-display">
                            {timeMessage}
                        </div>
                    )}
                </div>

                <div className="modal-content">
                    <div className="streak-container">
                        <div className="streak-box">
                            <div className="streak-value">{currentStreak}</div>
                            <div className="streak-label">Current Streak</div>
                        </div>
                        <div className="streak-box">
                            <div className="streak-value">{maxStreak}</div>
                            <div className="streak-label">Max Streak</div>
                        </div>
                    </div>

                    <div className="modal-stats">
                        <div className="stat-box">
                            <div className="stat-label">Time</div>
                            <div className="stat-value">{timeMessage}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Hints Used</div>
                            <div className="stat-value">{hintsUsed}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Games Played</div>
                            <div className="stat-value">{score.gamesPlayed}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Games Won</div>
                            <div className="stat-value">{score.gamesWon}</div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {success ? (
                        <>
                            <button className="modal-button primary" onClick={copyToClipboard}>
                                <FontAwesomeIcon icon={faShare} /> Share
                            </button>
                            <button className="modal-button secondary" onClick={exportScore}>
                                <FontAwesomeIcon icon={faDownload} /> Export
                            </button>
                        </>
                    ) : (
                        <button className="modal-button primary" onClick={reset}>
                            Try Again
                        </button>
                    )}
                </div>

                {showCopyMsg && (
                    <div className="copy-message">
                        {msg}
                    </div>
                )}

                <div className="modal-footer-text">
                    Enjoying Numble? Try our sister game{" "}
                    <a href="https://www.jumble-game.co.uk" target="_blank" rel="noopener noreferrer">
                        Jumble
                    </a>
                </div>
            </div>
        </div>
    );
};
