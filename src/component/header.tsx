import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {faChartBar} from "@fortawesome/free-solid-svg-icons";

interface HeaderProps {
    onClick: any
}


const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentScrollPos, setCurrentScrollPos] = useState(window.pageYOffset);

    const {onClick} = props
    // // Hide or show the menu.
    // const handleScroll = () => {
    //     const newScrollPos = window.pageYOffset;
    //     const visible = newScrollPos < currentScrollPos || newScrollPos < 350;
    //
    //     setIsVisible(visible);
    //     setCurrentScrollPos(newScrollPos);
    // };
    //
    // window.addEventListener("scroll", handleScroll);

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