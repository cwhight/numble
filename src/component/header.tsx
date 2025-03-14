import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { 
    faChartBar, 
    faLightbulb, 
    faInfo, 
    faBars,
    faXmark
} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
    showScores: () => void;
    showRules: () => void;
    showHints: () => void;
}

const Header: React.FC<HeaderProps> = ({ showScores, showRules, showHints }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMenuClick = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="burger-menu">
                <button 
                    className="burger-button"
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
                </button>
                
                <div className={`menu-dropdown ${isMenuOpen ? 'show' : ''}`}>
                    <button 
                        className="menu-item"
                        onClick={() => handleMenuClick(showScores)}
                        aria-label="Show scores"
                    >
                        <FontAwesomeIcon icon={faChartBar} />
                        Statistics
                    </button>
                    <button 
                        className="menu-item"
                        onClick={() => handleMenuClick(showRules)}
                        aria-label="Show rules"
                    >
                        <FontAwesomeIcon icon={faInfo} />
                        Rules
                    </button>
                    <button 
                        className="menu-item"
                        onClick={() => handleMenuClick(showHints)}
                        aria-label="Show hints"
                    >
                        <FontAwesomeIcon icon={faLightbulb} />
                        Hint
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;