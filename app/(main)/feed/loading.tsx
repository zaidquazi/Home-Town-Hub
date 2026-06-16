export default function FeedLoading() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm animate-pulse border border-neutral-100 dark:border-neutral-800">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6"></div>
          </div>
        </div>
      </div>
      
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-sm animate-pulse border border-neutral-100 dark:border-neutral-800">
          <div className="flex gap-3 items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="space-y-2">
              <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-32"></div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-20"></div>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-4/5"></div>
          </div>
          <div className="w-full h-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-4"></div>
          <div className="flex justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
