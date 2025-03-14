import React from "react";
import { ButtonProps } from "react-bootstrap";

export interface NumberProps extends ButtonProps {
    isPlaying: boolean;
    onClick?: () => void;
    value: number;
    used: boolean;
    big: boolean;
    newNum: boolean;
    solved: boolean;
    highlighted?: boolean;
}

export const Number: React.FC<NumberProps> = ({ value, used, onClick, isPlaying, big, newNum, solved, highlighted }) => {
    const click = () => {
        if (!used && onClick) {
            onClick();
        }
    };

    const className = `number-button ${used ? "used" : ""} ${big ? "big" : newNum ? "new" : "small"} ${highlighted ? "highlighted" : ""}`;

    return (
        <button 
            onClick={click} 
            className={className}
            disabled={used || !isPlaying}
        >
            {isPlaying || solved ? value : ""}
        </button>
    );
};