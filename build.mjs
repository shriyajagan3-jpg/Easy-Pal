// Bundles the extension into dist/.
// Chrome extensions can't load code from the internet (Manifest V3 rule),
// so Firebase has to be packed into our own files. esbuild does that.
import * as esbuild from "esbuild";
import { cpSync, mkdirSync } from "node:fs";

const watch = process.argv.includes("--watch");

mkdirSync("dist", { recursive: true });
// Copy the non-JS files as-is
cpSync("manifest.json", "dist/manifest.json");
cpSync("src/popup.html", "dist/popup.html");
cpSync("src/popup.css", "dist/popup.css");

const ctx = await esbuild.context({
  entryPoints: ["src/popup.js"],
  bundle: true,
  format: "esm",
  target: "chrome139",
  outdir: "dist",
  logLevel: "info",
});

if (watch) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
