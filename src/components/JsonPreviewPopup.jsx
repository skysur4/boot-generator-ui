import React from "react";

export default function JsonPreviewPopup({
                                             open,
                                             profile,
                                             title = "JSON Preview",
                                             onClose,
                                         }) {
    if (!open) {
        return null;
    }

    const json = JSON.stringify(profile ?? {}, null, 2);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    w-full max-w-5xl
                    max-h-[90vh]
                    flex flex-col
                    rounded-lg shadow-xl
                    bg-white dark:bg-zinc-900
                "
            >
                {/* Header */}
                <div
                    className="
                        flex items-center justify-between
                        px-4 py-3
                        border-b
                        dark:border-zinc-700
                    "
                >
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            px-2 py-1
                            rounded
                            text-gray-500
                            hover:bg-gray-200
                            dark:hover:bg-zinc-700
                        "
                    >
                        ✕
                    </button>
                </div>

                {/* JSON */}
                <div className="flex-1 overflow-auto p-4">
                    <pre
                        className="
                            p-4
                            rounded
                            bg-slate-100
                            dark:bg-zinc-950
                            text-sm
                            leading-6
                            overflow-auto
                            whitespace-pre
                        "
                    >
                        {json}
                    </pre>
                </div>

                {/* Footer */}
                <div
                    className="
                        flex justify-end
                        px-4 py-3
                        border-t
                        dark:border-zinc-700
                    "
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            px-4 py-2
                            rounded
                            bg-blue-600
                            text-white
                            hover:bg-blue-700
                        "
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}