import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navigation.css';

const Navigation: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="game-wrapper navigation-container">
            <h1>Choose Your Game</h1>
            <button onClick={() => navigate('/number-game')}>Number Puzzle</button>
            <button onClick={() => navigate('/word-grid')}>Word Grid</button>
        </div>
    );
};

export default Navigation; 