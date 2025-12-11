import { exec } from "child_process";

export function runYtDlp(url) {
  return new Promise((resolve, reject) => {
    exec(`yt-dlp -J "${url}"`, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
}
