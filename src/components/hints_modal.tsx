import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faLightbulb } from "@fortawesome/free-solid-svg-icons";

export interface HintsModalProps {
    show: boolean;
    close: () => void;
    refresh: boolean;
}

export const HintsModal: React.FC<HintsModalProps> = ({ show, close }) => {
    const [displayedHints, setDisplayedHints] = useState<string[]>(() => 
        JSON.parse(localStorage.getItem("displayedHints") || "[]")
    );
    const [hasBeenResetToday, setHasBeenResetToday] = useState<boolean>(false);

    useEffect(() => {
        const lastPlayed = localStorage.getItem("lastPlayed");
        const today = new Date().setHours(0, 0, 0, 0);
        const lastPlayedInt = parseInt(lastPlayed || "0");

        if (lastPlayedInt < today && !hasBeenResetToday) {
            setDisplayedHints([]);
            localStorage.setItem("displayedHints", JSON.stringify([]));
            setHasBeenResetToday(true);
        }
    }, [hasBeenResetToday]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            close();
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
                    <h2>Hints</h2>
                </div>

                <div className="modal-content">
                    <div className="rules-container">
                        <div className="rule-item">
                            <div className="rule-title">
                                <FontAwesomeIcon icon={faLightbulb} /> How Hints Work
                            </div>
                            <p>When you use the hint button, you'll be shown:</p>
                            <ul>
                                <li>Two numbers you should use</li>
                                <li>The operation to perform between them</li>
                                <li>The result you'll get</li>
                            </ul>
                            <p className="warning-text">Remember: Using hints will reset your streak!</p>
                        </div>
                        <div className="rule-item">
                            <div className="rule-title">Previous Hints</div>
                            {displayedHints.length > 0 ? (
                                displayedHints.map((hint, index) => (
                                    <p key={index}>{hint}</p>
                                ))
                            ) : (
                                <p>No hints used yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-button secondary" onClick={close}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}; 