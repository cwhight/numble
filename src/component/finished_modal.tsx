import React, { useState } from "react";
import { Score } from "./keypad";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faShare, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

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
    const hintsUsedToday = parseInt(localStorage.getItem("hintsUsed") || "0");

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            clear();
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
    };

    const getShareText = () => {
        return `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
${success ? `Time: 🎉 ${formatTime(timeTaken)} 🎉
Hints Used: ${hintsUsedToday} 🤔` : ""}
https://www.numble-game.co.uk`;
    };

    const copyToClipboard = async () => {
        const shareString = getShareText();

        setMsg("Copied to clipboard!");
        setShowCopyMsg(true);
        setTimeout(() => setShowCopyMsg(false), 2000);

        if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(shareString);
        } else {
            document.execCommand("copy", true, shareString);
        }
    };

    const shareToWhatsApp = () => {
        const shareString = encodeURIComponent(getShareText());
        window.open(`https://wa.me/?text=${shareString}`, '_blank');
    };

    const className = show ? "modal-cont display-block" : "modal-cont display-none";

    return (
        <div className={className} onClick={handleBackdropClick}>
            <div id="score-display" className="modal-main-cont">
                <div className="modal-header">
                    <button className="modal-close-button" onClick={clear}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    {success && (
                        <div className="success-icon small">
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                    )}
                    <h4 className="modal-title">{success ? "Great Work!" : "Time's Up!"}</h4>
                </div>

                <div className="modal-content">
                    {success && (
                        <div className="todays-score">
                            <div className="time-display highlight">
                                {formatTime(timeTaken)}
                            </div>
                            <div className="hints-used">
                                Hints Used Today: {hintsUsedToday}
                            </div>
                        </div>
                    )}

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
                        <div className="stat-box historic">
                            <div className="stat-label">All Time Stats</div>
                            <div className="stat-value">
                                <p>Games Won: {score.gamesWon}</p>
                                <p>Games Played: {score.gamesPlayed}</p>
                                <p>Average Time: {formatTime(Math.floor(score.averageTime))}</p>
                                <p>Best Time: {formatTime(score.bestTime)}</p>
                                <p>Total Hints Used: {score.hintsUsed || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {success && (
                        <div className="share-buttons">
                            <button className="modal-button primary" onClick={copyToClipboard}>
                                <FontAwesomeIcon icon={faShare} /> Copy
                            </button>
                            <button className="modal-button whatsapp" onClick={shareToWhatsApp}>
                                <FontAwesomeIcon icon={faWhatsapp} /> Share
                            </button>
                        </div>
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
