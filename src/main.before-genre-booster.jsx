import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Star,
  Plus,
  Check,
  Film,
  Shield,
  Trash2,
  Home,
  ListVideo,
  Heart,
  Settings,
  Eye,
  Upload,
  ExternalLink,
  PlayCircle,
  Cloud,
  Database,
  Tv,
  Dumbbell,
  Globe2,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Wand2
} from "lucide-react";
import { API_URL, apiDelete, apiGet, apiPost, apiPut } from "./api";
import "./style.css";
import AdminMetadataSearch from "./AdminMetadataSearch.jsx";
import UploadMetadataSearch from "./UploadMetadataSearch.jsx";
import EditUploadModal from "./EditUploadModal.jsx";

const PAGE_SIZE = 20;

function safeJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function mapMovieFromApi(movie) {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.year,
    genre: movie.genre,
    rating: movie.rating,
    duration: movie.duration,
    description: movie.description,
    poster: movie.poster_url,
    metadata: safeJson(movie.metadata)
  };
}

function mapUploadFromApi(upload) {
  return {
    id: upload.id,
    title: upload.title,
    inputType: upload.input_type,
    sourceType: upload.source_type,
    value: upload.value,
    posterUrl: upload.poster_url,
    metadata: safeJson(upload.metadata),
    createdAt: upload.created_at
  };
}


function getWatchHistory() {
  try {
    return JSON.parse(localStorage.getItem("cineverse_watch_history") || "[]");
  } catch {
    return [];
  }
}

function saveWatchHistoryItem(upload) {
  const current = getWatchHistory();
  const item = {
    id: upload.id,
    title: upload.title,
    posterUrl: upload.posterUrl,
    sourceType: upload.sourceType,
    inputType: upload.inputType,
    value: upload.value,
    metadata: upload.metadata || {},
    watchedAt: new Date().toISOString()
  };

  const next = [item, ...current.filter((x) => x.id !== upload.id)].slice(0, 20);
  localStorage.setItem("cineverse_watch_history", JSON.stringify(next));
  return next;
}

function clearWatchHistory() {
  localStorage.removeItem("cineverse_watch_history");
}

function detectSourceType(url) {
  const value = String(url || "").toLowerCase();

  if (value.includes("youtube.com") || value.includes("youtu.be")) return "YouTube";
  if (value.includes("tiktok.com")) return "TikTok";
  if (value.includes("rumble.com")) return "Rumble";
  if (value.includes("terabox.com") || value.includes("1024tera.com") || value.includes("teraboxapp.com")) return "Terabox";
  if (value.includes("google.com") || value.includes("drive.google.com")) return "Google / Website";

  return "Other URL";
}

function getYouTubeEmbed(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }

    if (parsed.pathname.includes("/shorts/")) {
      const id = parsed.pathname.split("/shorts/")[1]?.split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (parsed.pathname.includes("/embed/")) return url;
  } catch {
    return null;
  }

  return null;
}

function getYouTubeThumbnail(url) {
  try {
    const parsed = new URL(url);
    let id = null;

    if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.replace("/", "");
    if (parsed.searchParams.get("v")) id = parsed.searchParams.get("v");
    if (parsed.pathname.includes("/shorts/")) id = parsed.pathname.split("/shorts/")[1]?.split("/")[0];

    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
}

function extractIframeSrc(code) {
  const match = String(code || "").match(/src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function isAllowedIframeSrc(src) {
  try {
    const parsed = new URL(src);
    const host = parsed.hostname.toLowerCase();

    return (
      host.includes("youtube.com") ||
      host.includes("youtube-nocookie.com") ||
      host.includes("tiktok.com") ||
      host.includes("rumble.com") ||
      host.includes("terabox.com") ||
      host.includes("1024tera.com") ||
      host.includes("google.com") ||
      host.includes("drive.google.com")
    );
  } catch {
    return false;
  }
}

function getSafeEmbedSrc(upload) {
  if (upload.inputType === "iframe") {
    const src = extractIframeSrc(upload.value);
    if (src && isAllowedIframeSrc(src)) return src;
    return null;
  }

  if (upload.sourceType === "YouTube") return getYouTubeEmbed(upload.value);

  return null;
}

function getPoster(upload) {
  if (upload.posterUrl) return upload.posterUrl;
  if (upload.sourceType === "YouTube") return getYouTubeThumbnail(upload.value);
  return "";
}

function aiMetadataFromUpload({ title, url, sourceType, posterUrl, notes }) {
  const rawText = `${title || ""} ${url || ""} ${notes || ""}`;
  const text = rawText.toLowerCase();

  function has(...words) {
    return words.some((word) => text.includes(word));
  }

  function parseNotesJson(value) {
    if (!value) return {};
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function detectYearFromText() {
    const match = text.match(/\\b(19|20)\\d{2}\\b/);
    return match ? match[0] : "";
  }

  function detectSeasonEpisode() {
    const seasonMatch =
      text.match(/s(\\d{1,2})e(\\d{1,3})/i) ||
      text.match(/season\\s*(\\d{1,2}).*episode\\s*(\\d{1,3})/i) ||
      text.match(/sezon\\s*(\\d{1,2}).*episod\\s*(\\d{1,3})/i);

    if (seasonMatch) {
      return {
        season: seasonMatch[1] || "",
        episode: seasonMatch[2] || ""
      };
    }

    const episodeOnly = text.match(/episode\\s*(\\d{1,3})|episod\\s*(\\d{1,3})/i);

    return {
      season: "",
      episode: episodeOnly ? (episodeOnly[1] || episodeOnly[2] || "") : ""
    };
  }

  const notesData = parseNotesJson(notes);
  const notesText = JSON.stringify(notesData).toLowerCase();

  let category = "Other";
  let contentType = "Post";
  let genre = "General";
  let language = "Unknown";
  let country = "Unknown";
  let franchise = "";
  let collection = "";
  let confidence = 50;
  const tags = [];

  const year = String(notesData.year || detectYearFromText() || "");
  const seasonEpisode = detectSeasonEpisode();

  if (year) {
    tags.push(year);
    confidence += 8;
  }

  if (sourceType) tags.push(sourceType);

  const source = String(notesData.source || "").toLowerCase();
  const originalTitle = String(notesData.originalTitle || notesData.title || title || "");
  const combinedText = `${text} ${notesText} ${originalTitle.toLowerCase()}`;

  const isTrailer = combinedText.includes("trailer") || combinedText.includes("teaser") || Boolean(notesData.trailerUrl);

  if (isTrailer) {
    contentType = "Trailer";
    tags.push("Trailer");
    confidence += 10;
  }

  if (
    source.includes("tmdb") ||
    source.includes("omdb") ||
    source.includes("imdb") ||
    notesData.tmdbId ||
    notesData.imdbID
  ) {
    category = "Movies";
    contentType = isTrailer ? "Movie Trailer" : "Movie";
    tags.push("Movies");
    confidence += 15;
  }

  if (source.includes("jikan") || source.includes("anilist") || source.includes("kitsu")) {
    category = "Anime";
    contentType = isTrailer ? "Anime Trailer" : "Anime";
    genre = "Anime";
    language = "Japanese";
    country = "Japan";
    tags.push("Anime", "Japan");
    confidence += 20;
  }

  if (has("episode", "episod", "s01", "s02", "season", "sezon")) {
    contentType = isTrailer ? "Series Trailer" : "Episode";
    if (category === "Other") category = "Series";
    tags.push("Episode");
    confidence += 10;
  }

  if (has("anime", "naruto", "one piece", "bleach", "dragon ball", "attack on titan", "jujutsu", "demon slayer", "my hero academia")) {
    category = "Anime";
    contentType = isTrailer ? "Anime Trailer" : "Anime";
    genre = "Anime";
    language = "Japanese";
    country = "Japan";
    tags.push("Anime", "Japan");
    confidence += 25;
  } else if (has("sport", "football", "soccer", "f1", "formula 1", "formula", "ufc", "boxing", "basketball", "tennis")) {
    category = "Sport";
    contentType = "Sport";
    genre = has("f1", "formula") ? "Formula 1" : "Sport";
    tags.push("Sport");
    confidence += 25;
  } else if (has("telenovela", "novela", "soap opera")) {
    category = "Telenovele";
    contentType = "Series";
    genre = "Drama";
    tags.push("Telenovele", "Drama");
    confidence += 20;
  } else if (has("korea", "korean", "k-drama", "kdrama", "squid game")) {
    category = "Korea";
    contentType = isTrailer ? "K-Drama Trailer" : "K-Drama";
    genre = "K-Drama";
    language = "Korean";
    country = "South Korea";
    tags.push("Korea", "K-Drama");
    confidence += 25;
  } else if (has("turkish", "turkey", "dizi", "kara sevda")) {
    category = "Turkey";
    contentType = isTrailer ? "Turkish Trailer" : "Turkish Series";
    genre = "Drama";
    language = "Turkish";
    country = "Turkey";
    tags.push("Turkey", "Dizi", "Drama");
    confidence += 25;
  } else if (has("india", "indian", "bollywood", "hindi", "rrr", "tamil", "telugu")) {
    category = "India";
    contentType = isTrailer ? "Indian Trailer" : "Indian Movie/Series";
    genre = "Bollywood";
    language = has("tamil") ? "Tamil" : has("telugu") ? "Telugu" : "Hindi";
    country = "India";
    tags.push("India", "Bollywood");
    confidence += 25;
  } else if (has("brazil", "brasil", "brazilian", "portuguese")) {
    category = "Brazil";
    contentType = isTrailer ? "Brazilian Trailer" : "Brazilian Movie/Series";
    genre = "Drama";
    language = "Portuguese";
    country = "Brazil";
    tags.push("Brazil", "Portuguese");
    confidence += 25;
  } else if (has("movie", "film", "cinema")) {
    if (category === "Other") category = "Movies";
    contentType = isTrailer ? "Movie Trailer" : "Movie";
    confidence += 15;
  }

  if (has("action", "fight", "war", "battle")) {
    genre = "Action";
    tags.push("Action");
  }
  if (has("horror", "scary", "ghost", "zombie")) {
    genre = "Horror";
    tags.push("Horror");
  }
  if (has("comedy", "funny", "comedie")) {
    genre = "Comedy";
    tags.push("Comedy");
  }
  if (has("romance", "love", "romantic", "dragoste")) {
    genre = "Romance";
    tags.push("Romance");
  }
  if (has("thriller", "crime", "detective", "mystery")) {
    genre = "Thriller";
    tags.push("Thriller");
  }
  if (has("sci-fi", "science fiction", "space", "alien", "avatar")) {
    genre = "Sci-Fi";
    tags.push("Sci-Fi");
  }
  if (has("fantasy", "magic", "dragon")) {
    genre = "Fantasy";
    tags.push("Fantasy");
  }
  if (has("documentary", "documentar")) {
    genre = "Documentary";
    tags.push("Documentary");
  }

  const franchises = [
    ["avatar", "Avatar"],
    ["marvel", "Marvel"],
    ["avengers", "Marvel"],
    ["spider-man", "Spider-Man"],
    ["spiderman", "Spider-Man"],
    ["dc", "DC"],
    ["batman", "Batman"],
    ["superman", "Superman"],
    ["naruto", "Naruto"],
    ["one piece", "One Piece"],
    ["dragon ball", "Dragon Ball"],
    ["fast and furious", "Fast & Furious"],
    ["harry potter", "Harry Potter"],
    ["star wars", "Star Wars"],
    ["lord of the rings", "Lord of the Rings"]
  ];

  for (const [key, value] of franchises) {
    if (combinedText.includes(key)) {
      franchise = value;
      collection = `${value} Collection`;
      tags.push(value);
      confidence += 10;
      break;
    }
  }

  if (sourceType === "YouTube") confidence += 5;
  if (posterUrl) confidence += 5;
  if (notes) confidence += 5;
  if (notesData.rating) confidence += 4;
  if (notesData.description) confidence += 4;
  if (notesData.tmdbId || notesData.imdbID) confidence += 5;

  confidence = Math.max(0, Math.min(100, confidence));

  return {
    aiGenerated: true,
    aiVersion: "local-smart-engine-v3-merger",
    category,
    contentType,
    genre,
    year,
    season: seasonEpisode.season,
    episode: seasonEpisode.episode,
    language,
    country,
    collection,
    franchise,
    sourceType,
    rating: notesData.rating || "",
    description: notesData.description || "",
    originalTitle: notesData.originalTitle || "",
    externalIds: {
      tmdbId: notesData.tmdbId || "",
      imdbID: notesData.imdbID || ""
    },
    tags: [...new Set(tags)],
    aiConfidence: confidence,
    posterDetected: Boolean(posterUrl),
    mergedFromNotes: Object.keys(notesData).length > 0,
    generatedAt: new Date().toISOString()
  };
}


function textFromHtml(value) {
  return String(value || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function App() {
  const [page, setPage] = useState("home");
  const [movies, setMovies] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [apiStatus, setApiStatus] = useState("checking");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [watchHistory, setWatchHistory] = useState(() => getWatchHistory());
  const [editingUpload, setEditingUpload] = useState(null);
  const [infoUpload, setInfoUpload] = useState(null);
  const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem("cineverse_watchlist") || "[]"));

  useEffect(() => {
    loadCloudflareData();
  }, []);

  async function loadCloudflareData() {
    try {
      const [apiMovies, apiUploads] = await Promise.all([apiGet("/movies"), apiGet("/uploads")]);
      const mappedMovies = apiMovies.map(mapMovieFromApi);
      const mappedUploads = apiUploads.map(mapUploadFromApi);

      setMovies(mappedMovies);
      setUploads(mappedUploads);
      setSelectedMovie(mappedMovies[0] || null);
      setApiStatus("connected");
    } catch (error) {
      console.error(error);
      setApiStatus("offline");
    }
  }

  function toggleWatchlist(movie) {
    const exists = watchlist.some((item) => item.id === movie.id);
    const next = exists ? watchlist.filter((item) => item.id !== movie.id) : [...watchlist, movie];

    setWatchlist(next);
    localStorage.setItem("cineverse_watchlist", JSON.stringify(next));
  }

  function isSaved(movie) {
    return watchlist.some((item) => item.id === movie.id);
  }

  async function addMovie(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      title: form.get("title"),
      year: Number(form.get("year")),
      genre: form.get("genre"),
      rating: Number(form.get("rating")),
      duration: form.get("duration"),
      description: form.get("description"),
      posterUrl: form.get("posterUrl") || "",
      metadata: {
        originalTitle: form.get("originalTitle"),
        language: form.get("language"),
        country: form.get("country"),
        director: form.get("director")
      }
    };

    await apiPost("/movies", payload);
    await loadCloudflareData();
    event.currentTarget.reset();
    setPage("movies");
  }

  async function deleteMovie(movieId) {
    await apiDelete(`/movies/${movieId}`);
    await loadCloudflareData();
  }

  async function addUpload(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const inputType = form.get("inputType");
    const value = form.get("value");
    const selectedType = form.get("sourceType");
    const aiEnabled = form.get("aiMetadata") === "on";
    const posterUrl = form.get("posterUrl") || "";
    const title = form.get("title");
    const notes = form.get("notes") || "";

    const sourceType = selectedType === "Auto Detect" && inputType === "url" ? detectSourceType(value) : selectedType;

    const manualMetadata = {
      movieTitle: form.get("movieTitle"),
      season: form.get("season"),
      episode: form.get("episode"),
      quality: form.get("quality"),
      notes
    };

    const aiMetadata = aiEnabled
      ? aiMetadataFromUpload({ title, url: value, sourceType, posterUrl, notes })
      : { aiGenerated: false };

    const payload = {
      title,
      inputType,
      sourceType,
      value,
      posterUrl,
      metadata: {
        ...manualMetadata,
        ...aiMetadata
      }
    };

    await apiPost("/uploads", payload);
    await loadCloudflareData();
    event.currentTarget.reset();
  }

  function playUpload(upload) {
    setActiveVideo(upload);
    setWatchHistory(saveWatchHistoryItem(upload));
  }

  function resetWatchHistory() {
    clearWatchHistory();
    setWatchHistory([]);
  }

  async function updateUpload(uploadId, payload) {
    await apiPut(`/uploads/${uploadId}`, payload);
    await loadCloudflareData();
  }

  async function deleteUpload(uploadId) {
    await apiDelete(`/uploads/${uploadId}`);
    await loadCloudflareData();
  }

  const recommendations = useMemo(() => {
    if (!activeVideo) return [];

    const activeMeta = activeVideo.metadata || {};
    const activeTags = new Set(activeMeta.tags || []);

    function score(item) {
      const meta = item.metadata || {};
      let points = 0;

      if (item.id === activeVideo.id) return -999;

      if (meta.franchise && meta.franchise === activeMeta.franchise) points += 50;
      if (meta.collection && meta.collection === activeMeta.collection) points += 35;
      if (meta.category && meta.category === activeMeta.category) points += 25;
      if (meta.genre && meta.genre === activeMeta.genre) points += 20;
      if (item.sourceType && item.sourceType === activeVideo.sourceType) points += 10;
      if (meta.year && activeMeta.year && String(meta.year) === String(activeMeta.year)) points += 8;

      const tags = meta.tags || [];
      for (const tag of tags) {
        if (activeTags.has(tag)) points += 6;
      }

      return points;
    }

    return uploads
      .map((item) => ({ item, score: score(item) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((entry) => entry.item);
  }, [activeVideo, uploads]);

  return (
    <div className="app">
      <header className="navbar">
        <button className="brandButton" onClick={() => setPage("home")}>
          <Film />
          <span>CineVerse</span>
        </button>

        <nav>
          <button onClick={() => setPage("home")} className={page === "home" ? "active" : ""}><Home size={18} /> Home</button>
          <button onClick={() => setPage("movies")} className={page === "movies" ? "active" : ""}><ListVideo size={18} /> Filme</button>
          <button onClick={() => setPage("upload")} className={page === "upload" ? "active" : ""}><Upload size={18} /> Upload</button>
          <button onClick={() => setPage("library")} className={page === "library" ? "active" : ""}><Play size={18} /> AI Library</button>
          <button onClick={() => setPage("download")} className={page === "download" ? "active" : ""}><Download size={18} /> Download</button>
          <button onClick={() => setPage("admin")} className={page === "admin" ? "active" : ""}><Settings size={18} /> Admin</button>
        </nav>
      </header>

      <CloudStatus apiStatus={apiStatus} reload={loadCloudflareData} />

      {editingUpload && (
        <EditUploadModal
          upload={editingUpload}
          onClose={() => setEditingUpload(null)}
          onSave={async (id, payload) => {
            await updateUpload(id, payload);
            setEditingUpload(null);
          }}
        />
      )}

      {activeVideo && (
        <VideoPlayerModal
          upload={activeVideo}
          onClose={() => setActiveVideo(null)}
          recommendations={recommendations}
          onPlay={playUpload}
        />
      )}

      {page === "home" && (
        <HomePage
          selectedMovie={selectedMovie}
          setPage={setPage}
          toggleWatchlist={toggleWatchlist}
          isSaved={isSaved}
          movies={movies}
          uploads={uploads}
          apiStatus={apiStatus}
          watchHistory={watchHistory}
          resetWatchHistory={resetWatchHistory}
          onPlay={playUpload}
        />
      )}

      {page === "movies" && (
        <MoviesPage movies={movies} selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} toggleWatchlist={toggleWatchlist} isSaved={isSaved} />
      )}

      {page === "upload" && <UploadPage uploads={uploads} addUpload={addUpload} deleteUpload={deleteUpload} updateUpload={updateUpload} onEdit={setEditingUpload} onInfo={setInfoUpload} onPlay={playUpload} />}

      {page === "library" && <AiLibraryPage uploads={uploads} onPlay={playUpload} onEdit={setEditingUpload} onInfo={setInfoUpload} onDelete={deleteUpload} updateUpload={updateUpload} />}

      {page === "download" && <DownloadPage />}

      {page === "admin" && <AdminPage movies={movies} uploads={uploads} addMovie={addMovie} deleteMovie={deleteMovie} />}
    </div>
  );
}

function CloudStatus({ apiStatus, reload }) {
  return (
    <div className={`cloudStatus ${apiStatus}`}>
      <div>
        <Cloud size={18} />
        <span>Cloudflare API: {apiStatus === "connected" ? "conectat" : apiStatus}</span>
        <small>{API_URL}</small>
      </div>
      <button className="secondary" onClick={reload}>Reîncarcă date</button>
    </div>
  );
}

function HomePage({ selectedMovie, setPage, movies, uploads, apiStatus, watchHistory = [], resetWatchHistory, onPlay }) {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">AI Upload + PWA + Cloudflare</p>
          <h1>Platformă dinamică cu upload, metadata AI, pagination și video player.</h1>
          <p className="subtitle">
            Upload-urile URL/iframe sunt salvate în Cloudflare, metadata poate fi creată automat, iar posterele apar în AI Library cu player și recomandări.
          </p>
          <div className="heroActions">
            <button onClick={() => setPage("upload")}><Upload size={18} /> Upload</button>
            <button className="secondary" onClick={() => setPage("library")}><Play size={18} /> AI Library</button>
            <button className="secondary" onClick={() => setPage("download")}><Download size={18} /> Download</button>
          </div>
        </div>

        <div className="featured emptyFeatured">
          <div>
            <h2>Status platformă</h2>
            <p>Filme: {movies.length}</p>
            <p>Upload-uri: {uploads.length}</p>
            <p>API: {apiStatus}</p>
          </div>
        </div>
      </section>

      {watchHistory.length > 0 && (
        <section className="section">
          <div className="sectionHeader">
            <div>
              <h2><PlayCircle size={28} /> Continuă vizionarea</h2>
              <p>Ultimele postări redate pe acest dispozitiv.</p>
            </div>

            <button className="secondary" onClick={resetWatchHistory}>
              Golește istoricul
            </button>
          </div>

          <div className="posterGrid20">
            {watchHistory.map((upload) => (
              <UploadPosterCard key={upload.id} upload={upload} onPlay={onPlay} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function MoviesPage({ movies, selectedMovie, setSelectedMovie, toggleWatchlist, isSaved }) {
  const [query, setQuery] = useState("");
  const filtered = movies.filter((movie) => `${movie.title} ${movie.genre} ${movie.year}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main>
      <section className="section">
        <h2>Catalog filme</h2>
        <div className="toolbar">
          <div className="searchBox compact">
            <Search size={20} />
            <input placeholder="Caută film..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? <p className="empty">Nu există filme salvate încă.</p> : (
          <div className="grid">
            {filtered.map((movie) => (
              <article key={movie.id} className={`card ${selectedMovie?.id === movie.id ? "selected" : ""}`} onClick={() => setSelectedMovie(movie)}>
                {movie.poster ? <img src={movie.poster} alt={movie.title} /> : <div className="posterPlaceholder">Fără poster</div>}
                <div className="cardBody">
                  <h3>{movie.title}</h3>
                  <p>{movie.year} · {movie.genre}</p>
                  <span><Star size={16} /> {movie.rating}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedMovie && (
        <section className="details section">
          <div>
            <span className="pill">{selectedMovie.genre}</span>
            <h2>{selectedMovie.title}</h2>
            <p>{selectedMovie.description}</p>
          </div>
          <button onClick={() => toggleWatchlist(selectedMovie)}>
            {isSaved(selectedMovie) ? <Check size={18} /> : <Plus size={18} />}
            {isSaved(selectedMovie) ? "În watchlist" : "Adaugă în watchlist"}
          </button>
        </section>
      )}
    </main>
  );
}

function UploadPage({ uploads, addUpload, deleteUpload, updateUpload, onEdit, onInfo, onPlay }) {
  return (
    <main>
      <section className="section">
        <UploadMetadataSearch />
        <h2><Upload size={28} /> Upload cu AI metadata</h2>
        <p>AI metadata poate fi ON/OFF. Dacă îl oprești, completezi manual metadata.</p>

        <div className="uploadGrid">
          <form className="movieForm" onSubmit={addUpload}>
            <h2>Adaugă sursă</h2>

            <label className="switchLine">
              <input name="aiMetadata" type="checkbox" defaultChecked />
              <span><Sparkles size={18} /> AI metadata ON/OFF</span>
            </label>

            <label>Titlu postare</label>
            <input name="title" required placeholder="Ex: Avatar trailer 2009 / Naruto episod 1" />

            <label>Titlu film / conținut manual</label>
            <input name="movieTitle" placeholder="Ex: Avatar" />

            <label>Poster URL real</label>
            <input name="posterUrl" placeholder="https://site.com/poster.jpg" />

            <label>Tip sursă</label>
            <select name="sourceType" defaultValue="Auto Detect">
              <option>Auto Detect</option>
              <option>Terabox</option>
              <option>TikTok</option>
              <option>YouTube</option>
              <option>Rumble</option>
              <option>Google / Website</option>
              <option>Other URL</option>
              <option>Iframe</option>
            </select>

            <label>Metodă</label>
            <select name="inputType" defaultValue="url">
              <option value="url">URL link</option>
              <option value="iframe">Cod iframe</option>
            </select>

            <label>URL real sau iframe</label>
            <textarea name="value" required placeholder={'https://youtube.com/watch?v=...\n\nsau\n<iframe src="..."></iframe>'} />

            <div className="miniGrid">
              <div>
                <label>Sezon</label>
                <input name="season" placeholder="1" />
              </div>
              <div>
                <label>Episod</label>
                <input name="episode" placeholder="1" />
              </div>
            </div>

            <label>Calitate</label>
            <input name="quality" placeholder="HD / Full HD / 4K" />

            <label>Notițe manuale</label>
            <textarea name="notes" placeholder="Gen, an, categorie, colecție, franciză..." />

            <button type="submit"><Wand2 size={18} /> Salvează cu metadata</button>
          </form>

          <div className="uploadHelp">
            <h2>AI Upload</h2>
            <div className="sourceList">
              <div><Sparkles /><strong>Metadata AI</strong><span>Detectează categorie, gen, an, colecție, franciză.</span></div>
              <div><PlayCircle /><strong>Poster conectat</strong><span>Posterul apare în AI Library și pornește playerul.</span></div>
              <div><Database /><strong>Cloudflare</strong><span>Totul se salvează în D1.</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Ultimele upload-uri</h2>
        {uploads.length === 0 ? <p className="empty">Nu există upload-uri încă.</p> : (
          <div className="resultGrid">
            {uploads.slice(0, 8).map((upload) => (
              <UploadPosterCard key={upload.id} upload={upload} onPlay={onPlay} onDelete={deleteUpload} onEdit={onEdit} onInfo={onInfo} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function AiLibraryPage({ uploads, onPlay, onEdit, onInfo, onDelete, updateUpload }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [genreFilter, setGenreFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [franchiseFilter, setFranchiseFilter] = useState("All");
  const [collectionFilter, setCollectionFilter] = useState("All");

  function uniqueOptions(key, fallbackKey) {
    return [
      "All",
      ...new Set(
        uploads
          .map((upload) => {
            if (key === "sourceType") return upload.sourceType;
            return upload.metadata?.[key] || upload.metadata?.[fallbackKey];
          })
          .filter(Boolean)
      )
    ];
  }

  const categories = uniqueOptions("category");
  const genres = uniqueOptions("genre");
  const years = uniqueOptions("year");
  const sources = uniqueOptions("sourceType");
  const franchises = uniqueOptions("franchise");
  const collections = uniqueOptions("collection");

  const filtered = uploads.filter((upload) => {
    const searchable = [
      upload.title,
      upload.sourceType,
      upload.value,
      upload.metadata?.movieTitle,
      upload.metadata?.category,
      upload.metadata?.genre,
      upload.metadata?.year,
      upload.metadata?.language,
      upload.metadata?.collection,
      upload.metadata?.franchise,
      upload.metadata?.notes
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesQuery = searchable.includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "All" || upload.metadata?.category === categoryFilter;
    const matchesGenre = genreFilter === "All" || upload.metadata?.genre === genreFilter;
    const matchesYear = yearFilter === "All" || String(upload.metadata?.year || "") === String(yearFilter);
    const matchesSource = sourceFilter === "All" || upload.sourceType === sourceFilter;
    const matchesFranchise = franchiseFilter === "All" || upload.metadata?.franchise === franchiseFilter;
    const matchesCollection = collectionFilter === "All" || upload.metadata?.collection === collectionFilter;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesGenre &&
      matchesYear &&
      matchesSource &&
      matchesFranchise &&
      matchesCollection
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const currentItems = filtered.slice(start, start + PAGE_SIZE);

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function resetFilters() {
    setQuery("");
    setCategoryFilter("All");
    setGenreFilter("All");
    setYearFilter("All");
    setSourceFilter("All");
    setFranchiseFilter("All");
    setCollectionFilter("All");
    setPage(1);
  }

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <main>
      <section className="section">
        <h2><Sparkles size={28} /> AI Library Pagination</h2>
        <p>Posterele încărcate prin URL/iframe apar aici. Limită: 20 postere pe pagină.</p>

        <div className="aiFilters">
          <div className="searchBox compact wideSearch">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Caută după titlu, categorie, gen, an, franciză..."
            />
          </div>

          <select value={categoryFilter} onChange={(e) => updateFilter(setCategoryFilter, e.target.value)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select value={genreFilter} onChange={(e) => updateFilter(setGenreFilter, e.target.value)}>
            {genres.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select value={yearFilter} onChange={(e) => updateFilter(setYearFilter, e.target.value)}>
            {years.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select value={sourceFilter} onChange={(e) => updateFilter(setSourceFilter, e.target.value)}>
            {sources.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select value={franchiseFilter} onChange={(e) => updateFilter(setFranchiseFilter, e.target.value)}>
            {franchises.map((item) => <option key={item}>{item}</option>)}
          </select>

          <select value={collectionFilter} onChange={(e) => updateFilter(setCollectionFilter, e.target.value)}>
            {collections.map((item) => <option key={item}>{item}</option>)}
          </select>

          <button className="secondary" onClick={resetFilters}>
            Reset filtre
          </button>
        </div>

        <div className="librarySummary">
          <span>Total upload-uri: {uploads.length}</span>
          <span>Rezultate filtrate: {filtered.length}</span>
          <span>Pagina: {currentPage} / {totalPages}</span>
        </div>

        <div className="toolbar">
          <div className="paginationBox">
            <button className="secondary" onClick={prevPage} disabled={currentPage === 1}>
              <ChevronLeft size={18} /> Preview
            </button>
            <span>Pagina AI {currentPage} / {totalPages}</span>
            <button className="secondary" onClick={nextPage} disabled={currentPage === totalPages}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {currentItems.length === 0 ? <p className="empty">Nu există postere pentru filtrele selectate.</p> : (
          <div className="posterGrid20">
            {currentItems.map((upload) => (
              <UploadPosterCard key={upload.id} upload={upload} onPlay={onPlay} onEdit={onEdit} onInfo={onInfo} onDelete={onDelete} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function UploadPosterCard({ upload, onPlay, onDelete, onEdit, onInfo }) {
  const poster = getPoster(upload);
  const [showInfo, setShowInfo] = useState(false);
  const metadata = upload.metadata || {};

  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      alert("Copiat.");
    } catch {
      alert("Nu s-a putut copia.");
    }
  }

  return (
    <article className="resultCard posterPlayCard">
      <button className="posterPlayButton" onClick={() => onPlay(upload)}>
        {poster ? <img src={poster} alt={upload.title} /> : <div className="resultNoImage">No poster</div>}
        <span><PlayCircle size={38} /> Play</span>
      </button>

      <div className="resultBody">
        <span className="pill">{metadata.category || upload.sourceType}</span>
        <h3>{upload.title}</h3>
        <p>{metadata.genre || "General"} {metadata.year ? `· ${metadata.year}` : ""}</p>
        {metadata.collection && <p>Collection: {metadata.collection}</p>}

        <div className="row">
          <button onClick={() => onPlay(upload)}><Play size={16} /> Redă</button>
          <button className="secondary" onClick={() => setShowInfo((v) => !v)}>Info</button>
          {onEdit && <button className="secondary" onClick={() => onEdit(upload)}>Edit</button>}
          {onDelete && <button className="danger" onClick={() => onDelete(upload.id)}><Trash2 size={16} /> Șterge</button>}
        </div>

        {showInfo && (
          <div className="inlineInfoBox">
            <h4>Detalii postare</h4>
            <p><strong>ID:</strong> {upload.id || "-"}</p>
            <p><strong>Sursă:</strong> {upload.sourceType || "-"}</p>
            <p><strong>Input:</strong> {upload.inputType || "-"}</p>
            <p><strong>Categorie:</strong> {metadata.category || "-"}</p>
            <p><strong>Gen:</strong> {metadata.genre || "-"}</p>
            <p><strong>An:</strong> {metadata.year || "-"}</p>
            <p><strong>Franciză:</strong> {metadata.franchise || "-"}</p>
            <p><strong>Colecție:</strong> {metadata.collection || "-"}</p>
            <p><strong>Tip:</strong> {metadata.contentType || "-"}</p>
            <p><strong>AI confidence:</strong> {metadata.aiConfidence ? metadata.aiConfidence + "%" : "-"}</p>
            <p><strong>Tags:</strong> {Array.isArray(metadata.tags) ? metadata.tags.join(", ") : "-"}</p>

            <div className="row">
              <button type="button" className="secondary" onClick={() => copyText(upload.value)}>
                Copy URL
              </button>
              <button type="button" className="secondary" onClick={() => copyText(JSON.stringify(metadata, null, 2))}>
                Copy metadata
              </button>
            </div>

            <details>
              <summary>Vezi URL / iframe</summary>
              <pre>{String(upload.value || "")}</pre>
            </details>

            <details>
              <summary>Vezi metadata JSON</summary>
              <pre>{JSON.stringify(metadata, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </article>
  );
}

function VideoPlayerModal({ upload, onClose, recommendations, onPlay }) {
  const embedSrc = getSafeEmbedSrc(upload);

  return (
    <div className="playerOverlay">
      <div className="playerShell">
        <div className="playerTop">
          <div>
            <span className="pill">{upload.metadata?.category || upload.sourceType}</span>
            <h2>{upload.title}</h2>
          </div>
          <button className="danger" onClick={onClose}>Închide</button>
        </div>

        {embedSrc ? (
          <div className="playerFrame">
            <iframe
              src={embedSrc}
              title={upload.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="externalPlayer">
            <p>Această sursă nu permite redare directă iframe, dar linkul este salvat.</p>
            <a href={upload.value} target="_blank" rel="noreferrer">
              <ExternalLink size={18} /> Deschide sursa
            </a>
          </div>
        )}

        <div className="metadataBox">
          <strong>Metadata AI</strong>
          <code>{JSON.stringify(upload.metadata || {}, null, 2)}</code>
        </div>

        <section className="section">
          <h2>Recomandări similare</h2>
          {recommendations.length === 0 ? <p className="empty">Nu există recomandări încă.</p> : (
            <div className="resultGrid">
              {recommendations.map((item) => (
                <UploadPosterCard key={item.id} upload={item} onPlay={onPlay} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    function handler(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installPwa() {
    if (!deferredPrompt) {
      alert("Dacă browserul suportă instalarea, folosește meniul browserului: Add to Home Screen / Install app.");
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <main>
      <section className="section">
        <h2><Download size={28} /> Download / Install</h2>
        <p>Platforma poate fi instalată ca PWA pe Android, PC, tabletă și alte dispozitive compatibile.</p>

        <div className="downloadGrid">
          <div className="downloadCard">
            <h3>Website PWA</h3>
            <p>Instalează website-ul ca aplicație direct din browser.</p>
            <button onClick={installPwa}><Download size={18} /> Instalează PWA</button>
          </div>

          <div className="downloadCard">
            <h3>Android APK</h3>
            <p>Pachetul APK real se creează cu Capacitor/TWA după ce platforma este stabilă.</p>
            <code>npm run build → Capacitor Android → APK</code>
          </div>

          <div className="downloadCard">
            <h3>PC Desktop</h3>
            <p>Pachet Windows/Linux/macOS se creează cu Electron sau Tauri.</p>
            <code>npm run build → Electron/Tauri package</code>
          </div>

          <div className="downloadCard">
            <h3>iOS</h3>
            <p>Pe iOS instalarea reală se face prin PWA sau App Store/TestFlight.</p>
            <code>Safari → Share → Add to Home Screen</code>
          </div>
        </div>

        <p className="empty">
          Pentru APK/PC/iOS real trebuie etapă separată de build nativ. În Termux putem pregăti PWA și codul web, iar APK-ul complet necesită toolchain Android/Capacitor.
        </p>
      </section>
    </main>
  );
}

function AdminPage({ movies, uploads, addMovie, deleteMovie }) {
  return (
    <main>
      <section className="section admin">
        <AdminMetadataSearch />
        <h2><Shield size={24} /> Admin Cloudflare</h2>
        <div className="stats">
          <div><strong>{movies.length}</strong><span>Filme</span></div>
          <div><strong>{uploads.length}</strong><span>Upload-uri</span></div>
          <div><strong>ON</strong><span>D1</span></div>
        </div>
      </section>

      <section className="section adminGrid">
        <form className="movieForm" onSubmit={addMovie}>
          <h2>Adaugă film</h2>
          <label>Titlu</label><input name="title" required />
          <label>Titlu original</label><input name="originalTitle" />
          <label>An</label><input name="year" required type="number" />
          <label>Gen</label><input name="genre" required />
          <label>Rating</label><input name="rating" required type="number" min="1" max="10" step="0.1" />
          <label>Durată</label><input name="duration" required placeholder="112 min" />
          <label>Poster URL real</label><input name="posterUrl" placeholder="https://site.com/poster.jpg" />
          <div className="miniGrid">
            <div><label>Limbă</label><input name="language" /></div>
            <div><label>Țară</label><input name="country" /></div>
          </div>
          <label>Regizor</label><input name="director" />
          <label>Descriere</label><textarea name="description" required />
          <button type="submit"><Database size={18} /> Salvează film</button>
        </form>

        <div className="adminList">
          <h2>Filme existente</h2>
          {movies.map((movie) => (
            <div className="adminItem" key={movie.id}>
              {movie.poster ? <img src={movie.poster} alt={movie.title} /> : <div className="miniPoster">N/A</div>}
              <div>
                <strong>{movie.title}</strong>
                <span>{movie.year} · {movie.genre}</span>
              </div>
              <button className="danger iconOnly" onClick={() => deleteMovie(movie.id)}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
