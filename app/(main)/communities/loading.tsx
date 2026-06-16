export default function CommunitiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-48 h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
        <div className="w-32 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm animate-pulse border border-neutral-100 dark:border-neutral-800">
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 w-full relative">
              <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-xl bg-neutral-300 dark:bg-neutral-700 border-4 border-white dark:border-neutral-900"></div>
            </div>
            <div className="p-5 pt-10">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-1"></div>
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6 mb-4"></div>
              
              <div className="flex justify-between items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="w-20 h-4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                <div className="w-20 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
