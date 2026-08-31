import { useEffect } from 'react';

export default function ToastAlert({ isOpen, message, onClose }) {
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    return (
        <div
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
                isOpen
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-10 opacity-0 pointer-events-none'
            }`}
        >
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 font-bold text-slate-400 hover:text-white">
                &times;
            </button>
        </div>
    );
}