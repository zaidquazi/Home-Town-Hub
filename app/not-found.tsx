import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-8xl font-extrabold text-neutral-200 dark:text-neutral-700 mb-4">404</h1>
        <p className="text-h3 text-neutral-900 dark:text-white mb-2">Page not found</p>
        <p className="text-body text-neutral-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-button hover:bg-primary-700 transition-colors">
          ← Go Home
        </Link>
      </div>
    </div>
  );
}
