import { FC } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./page/home";
import './App.scss'
import ReactGA from 'react-ga4';

const TRACKING_ID = "UA-221463714-1"; // YOUR_OWN_TRACKING_ID

ReactGA.initialize(TRACKING_ID);

const App: FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </Router>
);

export default App;