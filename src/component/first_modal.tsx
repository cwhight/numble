import React from "react";
import { faLightbulb, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface FirstModalProps {
    show: boolean;
    close: () => void;
}

export const FirstModal: React.FC<FirstModalProps> = ({ show, close }) => {
    const className = show ? "modal-cont display-block" : "modal-cont display-none";

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            close();
        }
    };

    return (
        <div className={className} onClick={handleBackdropClick}>
            <div className="modal-main-cont">
                <div className="modal-header">
                    <button className="modal-close-button" onClick={close}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <h2>Welcome to Numble!</h2>
                    <p className="modal-subtitle">A daily number puzzle</p>
                </div>

                <div className="modal-content">
                    <div className="rules-container">
                        <div className="rule-item">
                            <div className="rule-title">Starting Numbers</div>
                            <p>You begin with 2 large numbers, 4 small numbers and 1 target number</p>
                        </div>
                        
                        <div className="rule-item">
                            <div className="rule-title">Game Rules</div>
                            <p>Perform operations (+, -, ×, ÷) between two numbers to reach the target</p>
                            <p>Each number can only be used once</p>
                            <p>After each operation, the result becomes available for the next calculation</p>
                        </div>

                        <div className="rule-item">
                            <div className="rule-title">Need Help?</div>
                            <p>
                                Click the <FontAwesomeIcon icon={faLightbulb} /> button for a hint, but be careful - 
                                using hints will end your streak!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-button primary" onClick={close}>
                        Let's Play!
                    </button>
                </div>
            </div>
        </div>
    );
};
