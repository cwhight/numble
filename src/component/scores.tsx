import React, { useMemo, useState } from "react";
import { Score } from "./keypad";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShare, faTimes } from "@fortawesome/free-solid-svg-icons";

export interface ScoresModalProps {
    show: boolean;
    close: () => void;
    scores: Score;
}

export const ScoresModal: React.FC<ScoresModalProps> = ({ show, close, scores }) => {
    const todaysScore = useMemo(() => 
        parseInt(localStorage.getItem("todaysTime") || "0"), 
        []
    );

    const minutes = Math.floor(todaysScore / 60);
    const seconds = todaysScore % 60;
    const timeMessage = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

    const streak = localStorage.getItem("currentStreak") || "0";
    const maxStreak = localStorage.getItem("maxStreak") || "0";

    const [showCopyMsg, setShowCopyMsg] = useState(false);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            close();
        }
    };

    const copyToClipboard = async () => {
        const shareString = `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
${todaysScore !== 0 ? `Today's Time: 🎉 ${timeMessage} 🎉` : ""}
https://sumble.onrender.com`;

        setShowCopyMsg(true);
        setTimeout(() => setShowCopyMsg(false), 2000);

        if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(shareString);
        } else {
            document.execCommand("copy", true, shareString);
        }
    };

    const className = show ? "modal-cont display-block" : "modal-cont display-none";

    return (
        <div className={className} onClick={handleBackdropClick}>
            <div className="modal-main-cont">
                <div className="modal-header">
                    <button className="modal-close-button" onClick={close}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h2>Statistics</h2>
                </div>

                <div className="modal-content">
                    {todaysScore !== 0 && (
                        <div className="time-display">
                            {timeMessage}
                        </div>
                    )}

                    <div className="streak-container">
                        <div className="streak-box">
                            <div className="streak-value">{streak}</div>
                            <div className="streak-label">Current Streak</div>
                        </div>
                        <div className="streak-box">
                            <div className="streak-value">{maxStreak}</div>
                            <div className="streak-label">Max Streak</div>
                        </div>
                    </div>

                    <div className="modal-stats">
                        <div className="stat-box">
                            <div className="stat-label">Games Played</div>
                            <div className="stat-value">{scores.gamesPlayed}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Games Won</div>
                            <div className="stat-value">{scores.gamesWon}</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Average Time</div>
                            <div className="stat-value">
                                {scores.gamesWon > 0 ? Math.round(scores.averageTime) + "s" : "N/A"}
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-label">Best Time</div>
                            <div className="stat-value">
                                {scores.gamesWon > 0 ? scores.bestTime + "s" : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-button primary" onClick={copyToClipboard}>
                        <FontAwesomeIcon icon={faShare} /> Share
                    </button>
                </div>

                {showCopyMsg && (
                    <div className="copy-message">
                        Copied to clipboard!
                    </div>
                )}

                <div className="modal-footer-text">
                    Enjoying Sumble? Try our sister game <a href="https://www.jumble-game.co.uk">Jumble</a>
                </div>
            </div>
        </div>
    );
};
