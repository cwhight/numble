import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faLightbulb } from "@fortawesome/free-solid-svg-icons";

export interface HintsModalProps {
    show: boolean;
    close: () => void;
    refresh: boolean;
}

export const HintsModal: React.FC<HintsModalProps> = ({ show, close, refresh }) => {
    const [displayedHints, setDisplayedHints] = useState<string[]>(() => {
        const storedHints = localStorage.getItem("displayedHints");
        if (!storedHints) return [];
        try {
            const hints = JSON.parse(storedHints);
            // Handle potential old format
            if (Array.isArray(hints)) {
                return hints.map(hint => typeof hint === 'string' ? hint : hint.text);
            }
            return [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        // Update hints when refresh prop changes
        const storedHints = localStorage.getItem("displayedHints");
        if (!storedHints) {
            setDisplayedHints([]);
            return;
        }
        try {
            const hints = JSON.parse(storedHints);
            // Handle potential old format
            if (Array.isArray(hints)) {
                setDisplayedHints(hints.map(hint => typeof hint === 'string' ? hint : hint.text));
            } else {
                setDisplayedHints([]);
            }
        } catch {
            setDisplayedHints([]);
        }
    }, [refresh]);

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
                                    <div key={index} className="hint-item">
                                        <span className="hint-text">{hint}</span>
                                    </div>
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
