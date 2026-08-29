import React from 'react';
import dayjs from 'dayjs';

import 'dayjs/locale/ko.js';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import {toTitleCase} from "../common/StringUtils.js";

// Day.js 플러그인 및 로캘 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale('ko'); // 글로벌 로캘을 한국어로 변경

export default function DayjsTimeDisplay({ label, value}) {
    const date = dayjs(value).tz("Asia/Seoul");

    return (
        <div className="mb-3">
            <div className="border-l-4 border-indigo-600 pl-4 mb-2">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            {/* Date-Time Text */}
            <div className="flex flex-col
                    w-full border rounded px-3 py-2
                    bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-400 text-sm">
                        {date.format('MMM D, YYYY')}
                    </span>
                    <span className="text-xs font-medium text-slate-400">•</span>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50/60 px-2 py-0.5 rounded-md">
                        {date.format('h:mm A')}
                    </span>
                </div>
            </div>
        </div>
    );
}
