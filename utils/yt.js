// ... (top unchanged)

/* ===================== SEARCH ===================== */
export async function searchVideos(query) {
  console.time(`searchVideos: "${query}"-${Date.now()}`); // Unique label

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `ytsearch20:${query}`
  ]);

  console.timeEnd(`searchVideos: "${query}"-${Date.now()}`);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== TRENDING ===================== */
export async function getTrending() {
  console.time(`getTrending-${Date.now()}`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    "https://www.youtube.com/playlist?list=PLFcGX84jKOu7fnNxRpajpvs-Zk3Za41ul"
  ]);

  console.timeEnd(`getTrending-${Date.now()}`);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== RELATED ===================== */
export async function getRelated(id) {
  console.time(`getRelated: ${id}-${Date.now()}`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  console.timeEnd(`getRelated: ${id}-${Date.now()}`);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

// getChannel similar if used
// getVideoInfo unchanged (keeps isSafariPlayable for Player preemptive skip)
