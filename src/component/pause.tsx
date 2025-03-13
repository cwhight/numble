import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause } from "@fortawesome/free-solid-svg-icons";

interface PauseProps {
    onPlayerClick: () => void;
}

export const Pause: React.FC<PauseProps> = ({ onPlayerClick }) => {
    return (
        <div onClick={onPlayerClick} className="clickable">
            <FontAwesomeIcon icon={faPause} />
        </div>
    );
};