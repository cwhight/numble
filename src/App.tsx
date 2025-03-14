import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './component/navigation';
import { KeyPad } from './component/keypad';
import WordGrid from './component/word_grid';
import './App.scss'
import ReactGA from 'react-ga4';

const TRACKING_ID = "UA-221463714-1"; // YOUR_OWN_TRACKING_ID

ReactGA.initialize(TRACKING_ID);

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigation />} />
                <Route path="/number-game" element={<KeyPad bigNums={[25, 50]} smallNums={[1, 2, 3, 4]} target={100} refreshState={() => {}} />} />
                <Route path="/word-grid" element={<WordGrid />} />
            </Routes>
        </Router>
    );
};

export default App;