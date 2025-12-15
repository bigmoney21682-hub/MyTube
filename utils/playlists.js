export function getPlaylists() {
  return JSON.parse(localStorage.getItem("playlists") || "[]");
}

export function savePlaylists(pl) {
  localStorage.setItem("playlists", JSON.stringify(pl));
}

export function addToPlaylist(name, videoId) {
  const playlists = getPlaylists();
  let pl = playlists.find(p => p.name === name);

  if (!pl) {
    pl = { name, videos: [] };
    playlists.push(pl);
  }

  if (!pl.videos.includes(videoId)) {
    pl.videos.push(videoId);
  }

  savePlaylists(playlists);
}
