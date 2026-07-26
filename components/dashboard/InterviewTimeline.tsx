'use client';

import { formatDate } from '@/lib/utils';
import { CheckCircle, Circle, MessageSquare, Briefcase, Award } from 'lucide-react';

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'REVIEWING': return <Briefcase className="w-5 h-5" />;
        case 'INTERVIEWING': return <MessageSquare className="w-5 h-5" />;
        case 'ACCEPTED': return <Award className="w-5 h-5" />;
        default: return <Circle className="w-5 h-5" />;
    }
};

export function InterviewTimeline({ history }: { history: any[] }) {
    if (history.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Application History</h3>
            <ol className="relative border-l border-slate-200 dark:border-slate-700">
                {history.map((item, index) => (
                    <li key={item.id} className="mb-10 ml-6">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                            {getStatusIcon(item.status)}
                        </span>
                        <h4 className="flex items-center mb-1 text-base font-semibold text-gray-900 dark:text-white">
                            {item.status}
                        </h4>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                            {formatDate(item.created_at)}
                        </time>
                        {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
                    </li>
                ))}
            </ol>
        </div>
    );
}
