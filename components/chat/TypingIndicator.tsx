'use client';

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-800">
        <span className="text-xs text-slate-500 mr-1">{name} is typing</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
