import React from "react";
import dayjs from 'dayjs';

import 'dayjs/locale/ko.js';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import {
    ListPlus
} from "lucide-react";

// Day.js 플러그인 및 로캘 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('ko'); // 글로벌 로캘을 한국어로 변경

export default function ProfileList({ selected, profiles, onSelect, addProfile }) {
    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <h2 className="font-semibold">Profiles</h2>
                <button
                    type="button"
                    onClick={addProfile}
                    className="
                        px-3 py-1 text-xs rounded
                        bg-mauve-700 text-white
                        hover:bg-mauve-900
                    "
                >
                    <ListPlus/>
                </button>
            </div>
            <div className="overflow-auto p-2">
                {profiles.length === 0 && (
                    <div className="text-gray-500">No profiles</div>
                )}
                <ul>
                    {Object.entries(profiles).map(([title, profile]) => (
                        <li
                            key={title}
                            onClick={() => onSelect(title)}
                            className={`cursor-pointer px-3 py-2 rounded mb-1 ${
                                title === selected ? "dark:bg-gray-800" : "hover:dark:bg-zinc-800"
                            }`}
                        >
                            <div className="text-lg text-mist-300">{title}</div>
                            <div className="text-xs text-emerald-500">{profile.description || "-"}</div>
                            <div className="text-xs text-fuchsia-300">{dayjs(profile.editedAt).tz("Asia/Seoul").fromNow()}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}