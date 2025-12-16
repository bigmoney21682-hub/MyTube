// ... (top unchanged)

/* ===================== SAFARI COMPAT CHECK HELPER ===================== */
async function isVideoSafariPlayable(id) {
  try {
    const data = await runYtDlp([
      "-J",
      "--cookies", COOKIES_PATH,
      `https://www.youtube.com/watch?v=${id}`
    ]);

    return Array.isArray(data.formats)
      ? data.formats.some(f =>
          f.url &&
          f.vcodec !== "none" &&
          f.acodec !== "none" &&
          f.ext === "mp4" &&
          f.vcodec && f.vcodec.startsWith("avc1")
        )
      : false;
  } catch {
    return false;
  }
}

/* ===================== SEARCH ===================== */
export async function searchVideos(query) {
  console.time(`searchVideos: "${query}"`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `ytsearch20:${query}`
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await isVideoSafariPlayable(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  console.timeEnd(`searchVideos: "${query}"`);

  return filtered;
}

/* ===================== TRENDING ===================== */
// Keep current active playlist (works great now!)
export async function getTrending() {
  console.time("getTrending");

  const data = await runYtDlp([
    ...COMMON_ARGS,
    "https://www.youtube.com/playlist?list=PLFcGX84jKOu7fnNxRpajpvs-Zk3Za41ul"
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await isVideoSafariPlayable(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  console.timeEnd("getTrending");

  return filtered;
}

/* ===================== RELATED ===================== */
export async function getRelated(id) {
  console.time(`getRelated: ${id}`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await isVideoSafariPlayable(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  console.timeEnd(`getRelated: ${id}`);

  return filtered;
}

// getVideoInfo unchanged (already has isSafariPlayable)

// ... channel similar if needed
