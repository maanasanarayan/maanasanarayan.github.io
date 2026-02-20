import React from 'react';
import { createPortal } from 'react-dom';

function Toast({ message, isVisible }) {
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div
            className={`toast ${isVisible ? 'toast-visible' : ''}`}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>,
        document.body
    );
}

export default Toast;
