import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {faChartBar} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
    onClick: any
}


const Header: React.FC<HeaderProps> = (props: HeaderProps) => {

    const {onClick} = props

    return (
        <div className={`header`}>
            <div className={"w-90 d-flex justify-content-between align-items-center"}>
                <h2 className={"mb-0"} onClick={() => onClick}>
                    <FontAwesomeIcon icon={faChartBar} />
                </h2>
            </div>
        </div>
    )
}

export default Header;