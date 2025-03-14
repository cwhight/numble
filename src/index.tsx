import React from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from './page/home';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <Home />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
