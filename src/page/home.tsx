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

    const [scores] = useState<Score>(() => {
        const savedState = localStorage.getItem("sumbleState");
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            return parsedState.score;
        }
        return {};
    });

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

    useEffect(() => {
        // Check if we need to generate new numbers (day changed)
        const savedState = localStorage.getItem("sumbleState");
        const today = new Date().setHours(0, 0, 0, 0);
        let lastGenerated = today;

        if (savedState) {
            const parsedState = JSON.parse(savedState);
            lastGenerated = parsedState.lastGenerated || 0;
        }
        
        if (!lastGenerated || lastGenerated < today) {
            const gameNumbers = generateNumbers();
            setNumbers({
                ...gameNumbers,
                hints: ""
            });
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
            />
            <FirstModal 
                close={() => setShowModal(false)} 
                show={showModal} 
            />
            <FinishedModal 
                show={showStatsModal}
                clear={() => setShowStatsModal(false)}
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
