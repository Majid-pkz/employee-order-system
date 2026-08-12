import Link from "next/link";

export function PublicHeader({ title }: { title?: string }) {
  return (
    <header className="bg-white border-b mb-6">
      <div className="max-w-3xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="font-semibold text-lg text-slate-800">
            Employee Orders
          </Link>
          {title && (
            <p className="text-sm text-gray-500">{title}</p>
          )}
        </div>

        <nav className="flex gap-4 text-sm">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            Place order
          </Link>
          <Link
            href="/edit"
            className="text-blue-600 hover:underline"
          >
            Edit my order
          </Link>
        </nav>
      </div>
    </header>
  );
}