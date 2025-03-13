import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faChartBar, faCircleQuestion, faInfo } from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
    showScores: () => void;
    showRules: () => void;
    showHints: () => void;
}

const Header: React.FC<HeaderProps> = ({ showScores, showRules, showHints }) => {
    return (
        <div className={`header mb-3`}>
            <div className={"w-90 d-flex justify-content-between align-items-center"}>
                <h2 className={"header-content header-links mb-0"} onClick={showScores}>
                    <FontAwesomeIcon icon={faChartBar} />
                </h2>
                <h1 className={"header-content mb-0 page-title"}>Numble</h1>
                <div className={"d-flex align-items-end"}>
                    <h2 className={"header-content header-links mx-3 mb-0"} onClick={showRules}>
                        <FontAwesomeIcon className={"header-links"} icon={faInfo} />
                    </h2>
                    <h2 className={"header-content header-links mb-0"} onClick={showHints}>
                        <FontAwesomeIcon className={"header-links"} icon={faCircleQuestion} />
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default Header;