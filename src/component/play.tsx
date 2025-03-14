import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from "@fortawesome/free-solid-svg-icons";

interface PlayProps {
    onPlayerClick: () => void;
}

export const Play: React.FC<PlayProps> = ({ onPlayerClick }) => {
    return (
        <button 
            className="play-button"
            onClick={onPlayerClick}
            aria-label="Start game"
        >
            <FontAwesomeIcon icon={faPlay} />
        </button>
    );
}; 