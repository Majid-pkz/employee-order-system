import { rm } from "node:fs/promises";
import path from "node:path";
async function main() {
  await rm(path.join(process.cwd(), "public", "uploads", "products"), { recursive: true, force: true });
  console.log("Retired former uploaded product images. The curated catalogue photos are served from the repository.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Image cleanup failed."); process.exitCode = 1; });
