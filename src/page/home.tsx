import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { KeyPad, Score } from "../component/keypad";
import { v4 as uuidv4 } from 'uuid';
import Header from "../component/header";
import { FirstModal } from "../component/first_modal";
import { FinishedModal } from "../component/finished_modal";
import { HintsModal } from "../component/hints_modal";
import { generateNumbers, GameNumbers } from "../utils/generateNumbers";

interface Numbers extends GameNumbers {
    hints: string;
}

export const Home: React.FC = () => {
    const cookieName = "sumbleId";
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
            hints: ""
        };
    });
    const [showModal, setShowModal] = useState<boolean>(scores.gamesPlayed === 0);
    const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
    const [showHintsModal, setShowHintsModal] = useState<boolean>(false);
    const [refresh, setRefresh] = useState<boolean>(false);
    const [currentStreak] = useState<number>(() => 
        parseInt(localStorage.getItem("currentStreak") || "0")
    );
    const [maxStreak] = useState<number>(() => 
        parseInt(localStorage.getItem("maxStreak") || "0")
    );

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
    const toggleStatsModal = () => setShowStatsModal(prev => !prev);
    
    const handleHintRequest = () => {
        refreshState();
    };

    const refreshState = () => setRefresh(prev => !prev);

    return (
        <div>
            <Header 
                showScores={toggleStatsModal} 
                showHints={() => setShowHintsModal(true)} 
                showRules={toggleModal}
                currentGame="number"
            />
            <FirstModal 
                close={() => setShowModal(false)} 
                show={showModal} 
            />
            <FinishedModal 
                show={showStatsModal}
                clear={() => setShowStatsModal(false)}
                timeTaken={parseInt(localStorage.getItem("todaysTime") || "0")}
                score={scores}
                success={localStorage.getItem("finished") === "true"}
                currentStreak={currentStreak}
                maxStreak={maxStreak}
            />
            <HintsModal 
                refresh={refresh} 
                close={() => setShowHintsModal(false)} 
                show={showHintsModal} 
            />
            <KeyPad
                refreshState={handleHintRequest}
                bigNums={numbers.bigNums}
                smallNums={numbers.smallNums}
                target={numbers.target}
            />
        </div>
    );
};
