import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

interface PlayProps {
    onPlayerClick: () => void;
}

export const Play: React.FC<PlayProps> = ({ onPlayerClick }) => {
    return (
        <div onClick={onPlayerClick} className="clickable">
            <FontAwesomeIcon icon={faPlay} />
        </div>
    );
}; 