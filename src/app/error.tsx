"use client";
import { RefreshCw } from "lucide-react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="site-container page-error"><h1>We couldn’t load the pantry.</h1><p>Please try again in a moment. Your confirmed orders remain saved.</p><button className="button button-primary" onClick={reset}><RefreshCw size={16} /> Try again</button></main>;
}
