import React from "react";
import {
    FolderOpen, FolderClosed, Folder,
} from "lucide-react";
import { toTitleCase } from '../common/StringUtils';

export default function ToggleField({label, children, defaultOpen = true}) {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="mb-3 border rounded dark:bg-zinc-900 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 dark:bg-zinc-800 ">
                <div className="flex items-center gap-2 text-yellow-600">
                    <Folder/><span>{toTitleCase(label)}</span>
                </div>

                <button onClick={() => setOpen(s => !s)}
                        className="text-sm text-yellow-700 px-2 py-1 rounded hover:bg-gray-200"
                        aria-expanded={open}> {open ? <FolderClosed/> : <FolderOpen/>} </button>
            </div>
            {open && <div className="p-3">{children}</div>}
        </div>
    );
}
