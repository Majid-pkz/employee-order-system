import Link from "next/link";
export default function NotFound() { return <main className="site-container page-error"><h1>This page isn’t in the pantry.</h1><p>The link may have changed.</p><Link href="/" className="button button-primary">Back to the pantry</Link></main>; }
