import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {faChartBar, faInfo} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
    showScores: any
    showRules: any
}


const Header: React.FC<HeaderProps> = (props: HeaderProps) => {

    const {showScores, showRules} = props

    return (
        <div className={`header`}>
            <div className={"w-90 d-flex justify-content-between align-items-center"}>
                <h2 className={"header-links mb-0"} onClick={() => showScores()}>
                    <FontAwesomeIcon icon={faChartBar} />
                </h2>
                <h2 className={"header-links mb-0"} onClick={() => showRules()}>
                    <FontAwesomeIcon icon={faInfo} />
                </h2>
            </div>
        </div>
    )
}

export default Header;