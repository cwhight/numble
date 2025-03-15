import React, {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-solid-svg-icons";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons";

export interface FinishedModalProps {
    show: boolean;
    clear: () => void;
}

export const FinishedModal: React.FC<FinishedModalProps> = ({
    show,
    clear
}) => {
    const [showCopyMsg, setShowCopyMsg] = useState(false);
    const [msg, setMsg] = useState("");
    const [state, setState] = useState(() => {
        const savedState = localStorage.getItem("sumbleState");
        if (savedState) {
            return JSON.parse(savedState);
        }
        return null;
    });

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
        if (!state) return "";
        const formattedTime = formatTime(state.winningTime);
        return `🔢 ${new Date(Date.now()).toLocaleString().split(',')[0]} 🔢
${state.finished ? `Time: 🎉 ${formattedTime} 🎉
Hints Used: ${state.todaysHintsUsed} 🤔` : ""}
https://sumble.onrender.com`;
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

    // Update state when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const savedState = localStorage.getItem("sumbleState");
            if (savedState) {
                setState(JSON.parse(savedState));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (!state) return null;

    return (
        <div className={className} onClick={handleBackdropClick}>
            <div className="modal-main-cont">
                <div className="modal-header">
                    <h2>{state.finished ? "Congratulations!" : "Statistics"}</h2>
                    {showCopyMsg && <div className="copy-message">{msg}</div>}
                </div>

                <div className="modal-stats">
                    <div className="stat-box">
                        <div className="stat-label">Games Won</div>
                        <div className="stat-value">{state.score.gamesWon}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Games Played</div>
                        <div className="stat-value">{state.score.gamesPlayed}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Average Time</div>
                        <div className="stat-value">{formatTime(Math.floor(state.score.averageTime))}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Best Time</div>
                        <div className="stat-value">{formatTime(state.score.bestTime)}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Current Streak</div>
                        <div className="stat-value">{state.currentStreak || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Max Streak</div>
                        <div className="stat-value">{state.maxStreak || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Today's Hints Used</div>
                        <div className="stat-value">{state.todaysHintsUsed || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Total Hints Used</div>
                        <div className="stat-value">{state.score.hintsUsed}</div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="share-buttons" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '10px', width: '100%' }}>
                        <button className="modal-button primary" style={{ padding: '5px', width: '45%' }} onClick={copyToClipboard}>
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                        <button className="modal-button whatsapp" style={{ padding: '5px', width: '45%' }} onClick={shareToWhatsApp}>
                            <FontAwesomeIcon icon={faWhatsapp} />
                        </button>
                    </div>
                </div>

                {showCopyMsg && (
                    <div className="copy-message">
                        {msg}
                    </div>
                )}

                <div className="modal-footer-text">
                    Enjoying Sumble? Try our sister game{" "}
                    <a href="https://www.jumble-game.co.uk" target="_blank" rel="noopener noreferrer">
                        Jumble
                    </a>
                </div>
            </div>
        </div>
    );
};
