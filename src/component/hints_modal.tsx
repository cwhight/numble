import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

export interface HintsModalProps {
    show: boolean;
    close: () => void;
    hints: string[];
    refresh: boolean;
}

export const HintsModal: React.FC<HintsModalProps> = ({ show, close, hints }) => {
    const reset = () => {
        close();
    };

    const [hintsUsed, setHintsUsed] = useState<number>(() => 
        parseInt(localStorage.getItem("hintsUsed") || "0")
    );
    const [displayedHints, setDisplayedHints] = useState<string[]>(() => 
        JSON.parse(localStorage.getItem("displayedHints") || "[]")
    );
    const [hasBeenResetToday, setHasBeenResetToday] = useState<boolean>(false);

    useEffect(() => {
        const lastPlayed = localStorage.getItem("lastPlayed");
        const today = new Date().setHours(0, 0, 0, 0);
        const lastPlayedInt = parseInt(lastPlayed || "0");

        if (lastPlayedInt < today && !hasBeenResetToday) {
            setHintsUsed(0);
            setDisplayedHints([]);
            localStorage.setItem("hintsUsed", "0");
            localStorage.setItem("displayedHints", JSON.stringify([]));
            setHasBeenResetToday(true);
        }
    }, [hasBeenResetToday]);

    const showHint = () => {
        if (hintsUsed < hints.length - 1) {
            const newHintsUsed = hintsUsed + 1;
            setHintsUsed(newHintsUsed);
            localStorage.setItem("hintsUsed", newHintsUsed.toString());
            const newDisplayedHints = [...displayedHints, hints[newHintsUsed - 1]];
            setDisplayedHints(newDisplayedHints);
            localStorage.setItem("displayedHints", JSON.stringify(newDisplayedHints));
        }
    };

    const hintBanner = displayedHints.map((hint: string, index: number) => (
        <p key={index}>{hint}</p>
    ));

    const buttons = (
        <div className={"w-100 mt-3 d-flex justify-content-around"}>
            <Button onClick={reset} className={"btn btn-primary"}>PLAY</Button>
            <button className={"btn btn-tertiary"} onClick={showHint}>HINT</button>
        </div>
    );

    const className = show ? "modal-cont display-block" : "modal-cont display-none";

    return (
        <div className={className}>
            <div className={"p-3 modal-main-cont d-flex flex-column justify-content-around align-items-center"}>
                <h2>Welcome to Numble!</h2>
                <p>If you're stuck you can get a hint, but it will end your streak</p>
                {hintBanner}
                {buttons}
            </div>
        </div>
    );
};
