import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {faChartBar, faInfo} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
    showScores: any
    showRules: any
}


const Header: React.FC<HeaderProps> = (props: HeaderProps) => {

    const {showScores, showRules} = props

    return (
        <div className={`header mb-3`}>
            <div className={"w-90 d-flex justify-content-between align-items-end"}>
                <FontAwesomeIcon className={"header-links "} icon={faChartBar}/>
                <h1 className={"header-content mb-0 page-title"}>Numble</h1>
                <FontAwesomeIcon className={"header-links "} icon={faInfo}/>
            </div>
        </div>
    )
}

export default Header;