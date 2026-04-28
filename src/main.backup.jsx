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
import { API_URL, apiDelete, apiGet, apiPost } from "./api";
import "./style.css";

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
  const text = `${title} ${url} ${notes}`.toLowerCase();

  let category = "Other";
  let genre = "General";
  let collection = "";
  let franchise = "";
  let year = "";
  let language = "Unknown";

  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) year = yearMatch[0];

  if (text.includes("anime") || text.includes("naruto") || text.includes("one piece") || text.includes("bleach")) {
    category = "Anime";
    genre = "Anime";
  } else if (text.includes("sport") || text.includes("football") || text.includes("soccer") || text.includes("f1") || text.includes("formula")) {
    category = "Sport";
    genre = text.includes("f1") || text.includes("formula") ? "Formula 1" : "Sport";
  } else if (text.includes("telenovela") || text.includes("novela")) {
    category = "Telenovele";
    genre = "Drama";
  } else if (text.includes("korea") || text.includes("k-drama") || text.includes("kdrama")) {
    category = "Korea";
    genre = "K-Drama";
    language = "Korean";
  } else if (text.includes("turkish") || text.includes("turkey") || text.includes("dizi")) {
    category = "Turkey";
    genre = "Drama";
    language = "Turkish";
  } else if (text.includes("india") || text.includes("bollywood") || text.includes("hindi")) {
    category = "India";
    genre = "Bollywood";
    language = "Hindi";
  } else if (text.includes("brazil") || text.includes("brasil")) {
    category = "Brazil";
    genre = "Drama";
    language = "Portuguese";
  } else if (text.includes("movie") || text.includes("film")) {
    category = "Movies";
  } else if (text.includes("episode") || text.includes("episod") || text.includes("season") || text.includes("sezon")) {
    category = "Series";
  }

  if (text.includes("avatar")) franchise = "Avatar";
  if (text.includes("marvel")) franchise = "Marvel";
  if (text.includes("dc")) franchise = "DC";
  if (text.includes("naruto")) franchise = "Naruto";
  if (text.includes("one piece")) franchise = "One Piece";

  if (franchise) collection = `${franchise} Collection`;

  return {
    aiGenerated: true,
    category,
    genre,
    year,
    language,
    collection,
    franchise,
    sourceType,
    posterDetected: Boolean(posterUrl),
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

  async function deleteUpload(uploadId) {
    await apiDelete(`/uploads/${uploadId}`);
    await loadCloudflareData();
  }

  const recommendations = useMemo(() => {
    if (!activeVideo) return [];
    const activeCategory = activeVideo.metadata?.category;
    const activeGenre = activeVideo.metadata?.genre;
    const activeSource = activeVideo.sourceType;

    return uploads
      .filter((item) => item.id !== activeVideo.id)
      .filter((item) => {
        return (
          item.metadata?.category === activeCategory ||
          item.metadata?.genre === activeGenre ||
          item.sourceType === activeSource
        );
      })
      .slice(0, 12);
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

      {activeVideo && (
        <VideoPlayerModal
          upload={activeVideo}
          onClose={() => setActiveVideo(null)}
          recommendations={recommendations}
          onPlay={setActiveVideo}
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
        />
      )}

      {page === "movies" && (
        <MoviesPage movies={movies} selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} toggleWatchlist={toggleWatchlist} isSaved={isSaved} />
      )}

      {page === "upload" && <UploadPage uploads={uploads} addUpload={addUpload} deleteUpload={deleteUpload} onPlay={setActiveVideo} />}

      {page === "library" && <AiLibraryPage uploads={uploads} onPlay={setActiveVideo} />}

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

function HomePage({ selectedMovie, setPage, movies, uploads, apiStatus }) {
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

function UploadPage({ uploads, addUpload, deleteUpload, onPlay }) {
  return (
    <main>
      <section className="section">
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
              <UploadPosterCard key={upload.id} upload={upload} onPlay={onPlay} onDelete={deleteUpload} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function AiLibraryPage({ uploads, onPlay }) {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(uploads.map((u) => u.metadata?.category).filter(Boolean))];

  const filtered = filter === "All" ? uploads : uploads.filter((u) => u.metadata?.category === filter);
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

  return (
    <main>
      <section className="section">
        <h2><Sparkles size={28} /> AI Library Pagination</h2>
        <p>Posterele încărcate prin URL/iframe apar aici. Limită: 20 postere pe pagină.</p>

        <div className="toolbar">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>

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

        {currentItems.length === 0 ? <p className="empty">Nu există postere pentru această pagină.</p> : (
          <div className="posterGrid20">
            {currentItems.map((upload) => (
              <UploadPosterCard key={upload.id} upload={upload} onPlay={onPlay} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function UploadPosterCard({ upload, onPlay, onDelete }) {
  const poster = getPoster(upload);

  return (
    <article className="resultCard posterPlayCard">
      <button className="posterPlayButton" onClick={() => onPlay(upload)}>
        {poster ? <img src={poster} alt={upload.title} /> : <div className="resultNoImage">No poster</div>}
        <span><PlayCircle size={38} /> Play</span>
      </button>

      <div className="resultBody">
        <span className="pill">{upload.metadata?.category || upload.sourceType}</span>
        <h3>{upload.title}</h3>
        <p>{upload.metadata?.genre || "General"} {upload.metadata?.year ? `· ${upload.metadata.year}` : ""}</p>
        {upload.metadata?.collection && <p>Collection: {upload.metadata.collection}</p>}
        <div className="row">
          <button onClick={() => onPlay(upload)}><Play size={16} /> Redă</button>
          {onDelete && <button className="danger" onClick={() => onDelete(upload.id)}><Trash2 size={16} /> Șterge</button>}
        </div>
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
