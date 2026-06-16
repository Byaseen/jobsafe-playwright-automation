import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const APK_URL =
  'https://github.com/appium/android-apidemos/releases/download/v3.1.0/ApiDemos-debug.apk';
const OUT_DIR = path.join(process.cwd(), 'apps');
const OUT_FILE = path.join(OUT_DIR, 'ApiDemos-debug.apk');

if (fs.existsSync(OUT_FILE)) {
  console.log(`Sample APK already exists: ${OUT_FILE}`);
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
console.log(`Downloading sample APK...\n${APK_URL}`);

const res = await fetch(APK_URL);
if (!res.ok) {
  throw new Error(`Download failed: ${res.status} ${res.statusText}`);
}

await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(OUT_FILE));
console.log(`Saved: ${OUT_FILE}`);
