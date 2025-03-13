import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { KeyPad, Score } from "../component/keypad";
import { v4 as uuidv4 } from 'uuid';
import Header from "../component/header";
import { FirstModal } from "../component/first_modal";
import { ScoresModal } from "../component/scores";
import { HintsModal } from "../component/hints_modal";
import { generateNumbers, GameNumbers } from "../utils/generateNumbers";

interface Numbers extends GameNumbers {
    hints: string;
}

export const Home: React.FC = () => {
    const cookieName = "numbleId";
    // Set cookie if it doesn't exist
    if (!Cookies.get(cookieName)) {
        Cookies.set(cookieName, uuidv4());
    }

    const [scores] = useState<Score>(() => 
        JSON.parse(localStorage.getItem("scores") || "{}") as Score
    );
    const [numbers, setNumbers] = useState<Numbers>(() => {
        const gameNumbers = generateNumbers();
        return {
            ...gameNumbers,
            hints: "" // We're not using hints anymore
        };
    });
    const [showModal, setShowModal] = useState<boolean>(scores.gamesPlayed === 0);
    const [showScoresModal, setShowScoresModal] = useState<boolean>(false);
    const [showHintsModal, setShowHintsModal] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {
        // Check if we need to generate new numbers (day changed)
        const lastGenerated = localStorage.getItem("lastGenerated");
        const today = new Date().setHours(0, 0, 0, 0);
        
        if (!lastGenerated || parseInt(lastGenerated) < today) {
            const gameNumbers = generateNumbers();
            setNumbers({
                ...gameNumbers,
                hints: ""
            });
            localStorage.setItem("lastGenerated", today.toString());
        }
    }, []);

    const toggleModal = () => setShowModal(prev => !prev);
    const toggleScoresModal = () => setShowScoresModal(prev => !prev);
    const toggleHintsModal = () => setShowHintsModal(prev => !prev);
    const refreshState = () => setRefresh(prev => !prev);

    return (
        <div>
            <Header 
                showScores={toggleScoresModal} 
                showHints={toggleHintsModal} 
                showRules={toggleModal}
            />
            <FirstModal 
                close={() => setShowModal(false)} 
                show={showModal} 
            />
            <ScoresModal 
                scores={scores} 
                close={() => setShowScoresModal(false)} 
                show={showScoresModal} 
            />
            <HintsModal 
                refresh={refresh} 
                close={() => setShowHintsModal(false)} 
                show={showHintsModal} 
                hints={[]} 
            />
            <KeyPad
                refreshState={refreshState}
                bigNums={numbers.bigNums}
                smallNums={numbers.smallNums}
                target={numbers.target}
            />
        </div>
    );
};
