export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
