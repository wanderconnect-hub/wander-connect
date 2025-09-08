import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Monkey patch MutationObserver to avoid "parameter 1 is not of type 'Node'" error
const originalObserve = MutationObserver.prototype.observe;
MutationObserver.prototype.observe = function (target, options) {
  if (!(target instanceof Node)) {
    console.warn("⚠️ Skipping invalid MutationObserver target:", target);
    return;
  }
  return originalObserve.call(this, target, options);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
