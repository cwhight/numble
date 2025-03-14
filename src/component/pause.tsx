import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause } from "@fortawesome/free-solid-svg-icons";

interface PauseProps {
    onPlayerClick: () => void;
}

export const Pause: React.FC<PauseProps> = ({ onPlayerClick }) => {
    return (
        <button 
            className="pause-button"
            onClick={onPlayerClick}
            aria-label="Pause game"
        >
            <FontAwesomeIcon icon={faPause} />
        </button>
    );
};