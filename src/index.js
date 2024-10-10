import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import App from './components/App';
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// pass console.log to report vitals to console.log the performance metrics
reportWebVitals();