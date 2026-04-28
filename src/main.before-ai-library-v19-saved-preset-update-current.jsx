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
import { API_URL, apiDelete, apiGet, apiPost, apiPut, apiCatalog, apiCatalogStats, apiCatalogFacets } from "./api";
import { CONTENT_CATEGORIES, getGenresForCategory, COUNTRIES, LANGUAGES, VIDEO_QUALITIES, VIDEO_QUALITY_LABELS, YEARS, SOURCE_TYPES, SETTINGS_GROUPS } from "./taxonomy";
import "./style.css";
import AdminMetadataSearch from "./AdminMetadataSearch.jsx";
import UploadMetadataSearch from "./UploadMetadataSearch.jsx";
import EditUploadModal from "./EditUploadModal.jsx";

const CINEVERSE_VERSION = "1.0.1";
const CINEVERSE_BUILD = "2026.04.27-ai-library-v18-saved-preset-duplicate";
const CINEVERSE_INSTALL_CHECKLIST = [
  { label: "PWA manifest", status: "Verificat", type: "ok" },
  { label: "Cloudflare API", status: "Conectat", type: "ok" },
  { label: "D1 database", status: "Conectat", type: "ok" },
  { label: "Algolia Search", status: "Conectat", type: "ok" },
  { label: "Upload + metadata AI", status: "Funcțional", type: "ok" },
  { label: "Android APK", status: "În pregătire", type: "pending" },
  { label: "Desktop build", status: "În pregătire", type: "pending" },
  { label: "iOS PWA", status: "Disponibil", type: "ok" },
  { label: "Cloudflare HTTPS deploy", status: "Publicat", type: "ok" }
];

const CINEVERSE_DEPLOY_INFO = {
  publicUrl: "https://rapid-tree-eb79.iri20rob94.workers.dev/",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  productionBuild: "Verificat",
  deployTarget: "Cloudflare Pages HTTPS",
  latestBackup: "cineverse-full-backup-2026-04-26_22-55.tar.gz"
};

const CINEVERSE_CHANGELOG = [
  "Algolia uploads + movies search",
  "Sync uploads to Algolia din Admin",
  "Admin Algolia Status Panel",
  "Quick filters în pagina Filme",
  "Sortare rezultate Algolia",
  "Redă / Info / Edit pentru rezultate Algolia",
  "Download / Install Center",
  "Package Version Manager",
  "Install Readiness Checklist",
  "PWA Manifest + Service Worker Check",
  "Real PWA Install Button",
  "Cloudflare Pages Deploy Center",
  "Build script pentru Cloudflare Pages",
  "Deploy Assistant Panel",
  "Cloudflare Pages Direct Upload Guide",
  "Public HTTPS deploy",
  "Public Deploy URL Panel",
  "Public App Health Panel",
  "Public API Diagnostics Panel",
  "AI Recommendations Panel",
  "Smart AI Recommendations v2",
  "AI Recommendations v3 Search Handoff",
  "AI Recommendations v4 Dedup Ranking",
  "AI Recommendations v5 Quality Filter",
  "AI Recommendations v6 More Like This",
  "AI Recommendations v7 Used Memory",
  "AI Recommendations v8 Persistent Memory",
  "AI Recommendations v9 Feedback",
  "AI Recommendations v10 Feedback Manager",
  "AI Library v2 Filters",
  "AI Library v3 Unified Filters",
  "AI Library v4 Active Filter Chips",
  "AI Library v5 Quality Panel",
  "AI Library v6 Quality Fix Filters",
  "Edit Upload v2 Metadata Fields",
  "Edit Upload v3 AI Metadata Toggle",
  "Frontend Catalog Mode v1",
  "AI Library Catalog v2 Smart Empty State",
  "Taxonomy Engine v1 Global Menus",
  "AI Library Catalog v3 Taxonomy Filters",
  "Frontend Catalog Alias UX v4",
  "AI Library v5 Filter Presets",
  "AI Library v6 Smart Preset Counts",
  "AI Library v7 Preset Active State",
  "AI Library v8 Preset Groups",
  "AI Library v9 Preset Reset + Source Combine",
  "AI Library v10 Source Toggle",
  "AI Library v11 Preset Memory",
  "AI Library v12 Filter URL Share",
  "AI Library v13 Copy Link Toast",
  "AI Library v14 Copy Link Button Feedback",
  "AI Library v15 Saved Filter Presets",
  "AI Library v16 Saved Presets Export Import",
  "AI Library v17 Saved Preset Rename",
  "AI Library v18 Saved Preset Duplicate"
];

const PAGE_SIZE = 20;
const AI_LIBRARY_FILTER_MEMORY_KEY = "cineverse.aiLibrary.filters.v11";
const AI_LIBRARY_SAVED_PRESETS_KEY = "cineverse.aiLibrary.savedPresets.v15";

function safeJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function readAiLibraryFilterMemory() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(AI_LIBRARY_FILTER_MEMORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function readAiLibraryUrlFilters() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    libraryQuery: params.get("aiQ") || "",
    libraryCategory: params.get("aiCategory") || "",
    libraryGenre: params.get("aiGenre") || "",
    librarySource: params.get("aiSource") || "",
    libraryCountry: params.get("aiCountry") || "",
    libraryLanguage: params.get("aiLanguage") || "",
    libraryYear: params.get("aiYear") || "",
    libraryVideoQuality: params.get("aiVideoQuality") || "",
    libraryQualityFilter: params.get("aiQuality") || "",
    librarySort: params.get("aiSort") || ""
  };
}


function readSavedAiLibraryPresets() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(AI_LIBRARY_SAVED_PRESETS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeSavedAiLibraryPresets(presets) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AI_LIBRARY_SAVED_PRESETS_KEY, JSON.stringify(presets || []));
  } catch {
    // localStorage poate fi blocat
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

function getLastAiRecommendationMemory() {
  try {
    return JSON.parse(localStorage.getItem("cineverse_last_ai_recommendation") || "null");
  } catch {
    return null;
  }
}

function saveLastAiRecommendationMemory(memory) {
  try {
    localStorage.setItem("cineverse_last_ai_recommendation", JSON.stringify(memory));
  } catch {}
}

function clearLastAiRecommendationMemory() {
  try {
    localStorage.removeItem("cineverse_last_ai_recommendation");
  } catch {}
}

function getAiRecommendationFeedback() {
  try {
    return JSON.parse(localStorage.getItem("cineverse_ai_recommendation_feedback") || "{}");
  } catch {
    return {};
  }
}

function saveAiRecommendationFeedback(feedback) {
  try {
    localStorage.setItem("cineverse_ai_recommendation_feedback", JSON.stringify(feedback || {}));
  } catch {}
}

function clearAiRecommendationFeedback() {
  try {
    localStorage.removeItem("cineverse_ai_recommendation_feedback");
  } catch {}
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

  const franchiseGenreMap = {
    "Avatar": { genre: "Sci-Fi", tags: ["Sci-Fi", "Adventure", "Fantasy"] },
    "Marvel": { genre: "Superhero", tags: ["Superhero", "Action", "Sci-Fi", "Marvel"] },
    "Spider-Man": { genre: "Superhero", tags: ["Superhero", "Action", "Sci-Fi", "Marvel"] },
    "DC": { genre: "Superhero", tags: ["Superhero", "Action", "DC"] },
    "Batman": { genre: "Superhero", tags: ["Superhero", "Action", "Crime", "DC"] },
    "Superman": { genre: "Superhero", tags: ["Superhero", "Action", "Sci-Fi", "DC"] },
    "Naruto": { genre: "Anime", tags: ["Anime", "Action", "Adventure", "Ninja"] },
    "One Piece": { genre: "Anime", tags: ["Anime", "Adventure", "Fantasy", "Pirates"] },
    "Dragon Ball": { genre: "Anime", tags: ["Anime", "Action", "Martial Arts"] },
    "Fast & Furious": { genre: "Action", tags: ["Action", "Cars", "Racing"] },
    "Harry Potter": { genre: "Fantasy", tags: ["Fantasy", "Adventure", "Magic"] },
    "Star Wars": { genre: "Sci-Fi", tags: ["Sci-Fi", "Adventure", "Space"] },
    "Lord of the Rings": { genre: "Fantasy", tags: ["Fantasy", "Adventure", "Epic"] }
  };

  if (franchise && franchiseGenreMap[franchise]) {
    const boost = franchiseGenreMap[franchise];

    if (genre === "General" || genre === "Movie" || genre === "Drama") {
      genre = boost.genre;
    }

    for (const tag of boost.tags) {
      tags.push(tag);
    }

    confidence += 8;
  }

  if (genre === "Superhero") {
    category = category === "Other" ? "Movies" : category;
    tags.push("Superhero");
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



function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/www\./g, "")
    .replace(/[^a-z0-9ăâîșț]+/gi, " ")
    .trim();
}

function extractMetadataNotes(metadata) {
  try {
    if (!metadata?.notes) return {};
    const parsed = JSON.parse(metadata.notes);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getDuplicateScore(existing, candidate) {
  const existingMeta = existing.metadata || {};
  const candidateMeta = candidate.metadata || {};
  const existingNotes = extractMetadataNotes(existingMeta);
  const candidateNotes = extractMetadataNotes(candidateMeta);

  let score = 0;
  const reasons = [];

  const existingValue = normalizeText(existing.value);
  const candidateValue = normalizeText(candidate.value);

  if (existingValue && candidateValue && existingValue === candidateValue) {
    score += 100;
    reasons.push("același URL / iframe");
  }

  const existingTitle = normalizeText(existing.title);
  const candidateTitle = normalizeText(candidate.title);

  if (existingTitle && candidateTitle && existingTitle === candidateTitle) {
    score += 45;
    reasons.push("același titlu");
  }

  const existingMovieTitle = normalizeText(existingMeta.movieTitle);
  const candidateMovieTitle = normalizeText(candidateMeta.movieTitle);

  if (existingMovieTitle && candidateMovieTitle && existingMovieTitle === candidateMovieTitle) {
    score += 35;
    reasons.push("același titlu film/conținut");
  }

  if (existingMeta.franchise && candidateMeta.franchise && existingMeta.franchise === candidateMeta.franchise) {
    score += 15;
    reasons.push("aceeași franciză");
  }

  if (existingMeta.year && candidateMeta.year && String(existingMeta.year) === String(candidateMeta.year)) {
    score += 10;
    reasons.push("același an");
  }

  if (existingNotes.tmdbId && candidateNotes.tmdbId && String(existingNotes.tmdbId) === String(candidateNotes.tmdbId)) {
    score += 100;
    reasons.push("același TMDB ID");
  }

  if (existingMeta.externalIds?.tmdbId && candidateMeta.externalIds?.tmdbId && String(existingMeta.externalIds.tmdbId) === String(candidateMeta.externalIds.tmdbId)) {
    score += 100;
    reasons.push("același TMDB ID");
  }

  if (existingNotes.imdbID && candidateNotes.imdbID && String(existingNotes.imdbID) === String(candidateNotes.imdbID)) {
    score += 100;
    reasons.push("același IMDb ID");
  }

  if (existingNotes.trailerUrl && candidateNotes.trailerUrl && normalizeText(existingNotes.trailerUrl) === normalizeText(candidateNotes.trailerUrl)) {
    score += 100;
    reasons.push("același trailer");
  }

  return {
    score,
    reasons: [...new Set(reasons)]
  };
}

function findDuplicateUploads(uploads, candidate) {
  return uploads
    .map((upload) => {
      const result = getDuplicateScore(upload, candidate);
      return {
        upload,
        score: result.score,
        reasons: result.reasons
      };
    })
    .filter((item) => item.score >= 80)
    .sort((a, b) => b.score - a.score);
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
  const [movieSearchSeed, setMovieSearchSeed] = useState("");
  const [lastAiRecommendation, setLastAiRecommendation] = useState(() => getLastAiRecommendationMemory());
  const [aiRecommendationFeedback, setAiRecommendationFeedback] = useState(() => getAiRecommendationFeedback());
  const [lastAlgoliaSync, setLastAlgoliaSync] = useState(null);
  const [adminAlgoliaMessage, setAdminAlgoliaMessage] = useState(null);
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

    const duplicates = findDuplicateUploads(uploads, payload);

    if (duplicates.length > 0) {
      const top = duplicates[0];
      const message =
        "AI Duplicate Detector a găsit o postare asemănătoare:\\n\\n" +
        "Titlu existent: " + (top.upload.title || "-") + "\\n" +
        "Scor duplicat: " + top.score + "%\\n" +
        "Motive: " + top.reasons.join(", ") + "\\n\\n" +
        "Vrei să salvezi oricum?";

      const ok = window.confirm(message);
      if (!ok) return;
    }

    await apiPost("/uploads", payload);
    await loadCloudflareData();
    event.currentTarget.reset();
  }

  function playUpload(upload) {
    setActiveVideo(upload);
    setWatchHistory(saveWatchHistoryItem(upload));
  }

  function resetAiRecommendationFeedback() {
    setAiRecommendationFeedback({});
    clearAiRecommendationFeedback();
  }

  function rateAiRecommendation(label, value) {
    const key = String(label || "").trim();
    if (!key) return;

    const next = { ...aiRecommendationFeedback };

    if (value === 0) {
      delete next[key];
    } else {
      next[key] = value;
    }

    setAiRecommendationFeedback(next);
    saveAiRecommendationFeedback(next);
  }

  function openMovieSearchFromRecommendation(query, sourceLabel = "") {
    const cleanQuery = query || "";
    const memory = {
      query: cleanQuery,
      label: sourceLabel || cleanQuery,
      time: new Date().toLocaleTimeString(),
      savedAt: new Date().toISOString()
    };

    setMovieSearchSeed(cleanQuery);
    setLastAiRecommendation(memory);
    saveLastAiRecommendationMemory(memory);
    setPage("movies");
  }

  function resetWatchHistory() {
    clearWatchHistory();
    setWatchHistory([]);
  }

  async function syncUploadsToAlgolia() {
    try {
      const result = await apiPost("/sync-uploads-algolia", {});
      setLastAlgoliaSync(result);
      setAdminAlgoliaMessage({
        type: result.failed === 0 ? "success" : "warning",
        title: "Sync Algolia finalizat",
        text:
          "Total: " + result.total +
          " · Sincronizate: " + result.synced +
          " · Eșuate: " + result.failed,
        time: new Date().toLocaleTimeString()
      });
      return result;
    } catch (error) {
      console.error(error);
      setAdminAlgoliaMessage({
        type: "danger",
        title: "Sync Algolia a eșuat",
        text: "Verifică Worker-ul și conexiunea.",
        time: new Date().toLocaleTimeString()
      });
      return null;
    }
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
          onSearchRecommendation={openMovieSearchFromRecommendation}
          lastAiRecommendation={lastAiRecommendation}
          aiRecommendationFeedback={aiRecommendationFeedback}
          onRateAiRecommendation={rateAiRecommendation}
          onResetAiRecommendationFeedback={resetAiRecommendationFeedback}
        />
      )}

      {page === "movies" && (
        <MoviesPage
          movies={movies}
          uploads={uploads}
          selectedMovie={selectedMovie}
          setSelectedMovie={setSelectedMovie}
          toggleWatchlist={toggleWatchlist}
          isSaved={isSaved}
          onPlay={playUpload}
          onEdit={setEditingUpload}
          onInfo={setInfoUpload}
          searchSeed={movieSearchSeed}
          clearSearchSeed={() => setMovieSearchSeed("")}
          lastAiRecommendation={lastAiRecommendation}
        />
      )}

      {page === "upload" && <UploadPage uploads={uploads} addUpload={addUpload} deleteUpload={deleteUpload} updateUpload={updateUpload} onEdit={setEditingUpload} onInfo={setInfoUpload} onPlay={playUpload} />}

      {page === "library" && <AiLibraryPage uploads={uploads} onPlay={playUpload} onEdit={setEditingUpload} onInfo={setInfoUpload} onDelete={deleteUpload} updateUpload={updateUpload} />}

      {page === "download" && <DownloadPage />}

      {page === "admin" && <AdminPage movies={movies} uploads={uploads} addMovie={addMovie} deleteMovie={deleteMovie} syncUploadsToAlgolia={syncUploadsToAlgolia} lastAlgoliaSync={lastAlgoliaSync} adminAlgoliaMessage={adminAlgoliaMessage} setAdminAlgoliaMessage={setAdminAlgoliaMessage} />}
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

function buildMoreLikeThisQuery(item) {
  const parts = [
    item?.label,
    item?.genres?.[0],
    item?.tags?.find((tag) => !/^\d+$/.test(String(tag || "")))
  ]
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);

  return Array.from(new Set(parts)).slice(0, 3).join(" ");
}

function buildAiRecommendations(uploads = []) {
  const blocked = new Set([
    "movies",
    "movie",
    "youtube",
    "trailer",
    "movie trailer",
    "general",
    "other",
    "other url",
    "unknown",
    "url",
    "upload",
    "uploads",
    "collection"
  ]);

  const genericGenres = new Set([
    "anime",
    "fantasy",
    "sci-fi",
    "adventure",
    "action",
    "superhero"
  ]);

  const groups = {};

  function normalizeLabel(value) {
    return String(value || "")
      .replace(/ collection$/i, "")
      .trim();
  }

  function isWeakRecommendationLabel(label) {
    const value = String(label || "").trim().toLowerCase();

    if (!value) return true;
    if (/^\d{4}$/.test(value)) return true;
    if (/^\d+$/.test(value)) return true;
    if (value.length < 3) return true;

    return false;
  }

  function addKey(key, upload, metadata, weight = 1, source = "tag") {
    const label = normalizeLabel(key);
    const normalized = label.toLowerCase();

    if (!label || blocked.has(normalized)) return;
    if (isWeakRecommendationLabel(label)) return;

    if (!groups[label]) {
      groups[label] = {
        label,
        score: 0,
        count: 0,
        uploads: [],
        genres: new Set(),
        tags: new Set(),
        years: new Set(),
        sources: new Set()
      };
    }

    groups[label].score += weight;
    groups[label].count += 1;
    groups[label].uploads.push(upload);
    groups[label].sources.add(source);

    if (metadata.genre && !blocked.has(String(metadata.genre).toLowerCase())) {
      groups[label].genres.add(metadata.genre);
    }

    if (metadata.year) groups[label].years.add(metadata.year);

    if (Array.isArray(metadata.tags)) {
      metadata.tags.forEach((tag) => {
        const clean = normalizeLabel(tag);
        if (clean && !blocked.has(clean.toLowerCase())) {
          groups[label].tags.add(clean);
        }
      });
    }
  }

  uploads.forEach((upload) => {
    const metadata = upload.metadata || {};

    if (metadata.franchise) addKey(metadata.franchise, upload, metadata, 8, "franchise");
    if (metadata.collection) addKey(metadata.collection, upload, metadata, 6, "collection");
    if (metadata.genre) addKey(metadata.genre, upload, metadata, 3, "genre");

    if (Array.isArray(metadata.tags)) {
      metadata.tags.forEach((tag) => addKey(tag, upload, metadata, 1, "tag"));
    }
  });

  const all = Object.values(groups)
    .map((item) => {
      const sourceBonus =
        item.sources.has("franchise") ? 8 :
        item.sources.has("collection") ? 5 :
        item.sources.has("genre") ? 2 :
        0;

      const genericPenalty = genericGenres.has(item.label.toLowerCase()) ? 2 : 0;

      return {
        ...item,
        finalScore: item.score + sourceBonus - genericPenalty
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore || b.count - a.count || a.label.localeCompare(b.label, "ro"));

  const qualityItems = all.filter((item) => {
    if (isWeakRecommendationLabel(item.label)) return false;
    if (item.finalScore < 3) return false;
    return true;
  });

  const selected = [];
  const usedUploads = new Set();

  for (const item of qualityItems) {
    const uploadIds = item.uploads.map((upload) => upload.id).filter(Boolean);
    const overlap = uploadIds.filter((id) => usedUploads.has(id)).length;
    const overlapRatio = uploadIds.length ? overlap / uploadIds.length : 0;

    const isStrongEntity =
      item.sources.has("franchise") ||
      item.sources.has("collection") ||
      item.finalScore >= 8;

    if (overlapRatio > 0.75 && !isStrongEntity) continue;

    selected.push(item);
    uploadIds.forEach((id) => usedUploads.add(id));

    if (selected.length >= 8) break;
  }

  return selected.map((item) => ({
    ...item,
    score: item.finalScore,
    genres: Array.from(item.genres).slice(0, 4),
    tags: Array.from(item.tags).slice(0, 6),
    years: Array.from(item.years).slice(0, 3),
    sources: Array.from(item.sources)
  }));
}

function HomePage({ selectedMovie, setPage, movies, uploads, apiStatus, watchHistory = [], resetWatchHistory, onPlay, onSearchRecommendation, lastAiRecommendation, aiRecommendationFeedback = {}, onRateAiRecommendation, onResetAiRecommendationFeedback }) {
  const aiRecommendations = buildAiRecommendations(uploads)
    .map((item) => {
      const feedback = aiRecommendationFeedback[item.label] || 0;
      return {
        ...item,
        feedback,
        adjustedScore: item.score + feedback * 10
      };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);

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

      {lastAiRecommendation && (
        <section className="section">
          <h2><Sparkles size={28} /> Ultima recomandare AI folosită</h2>
          <div className="recommendationCard">
            <span className="pill">AI Memory · Persistă după refresh</span>
            <h3>{lastAiRecommendation.label}</h3>
            <p>Căutare: {lastAiRecommendation.query}</p>
            <p>Ora: {lastAiRecommendation.time}</p>
            <div className="row">
              <button onClick={() => onSearchRecommendation && onSearchRecommendation(lastAiRecommendation.query, lastAiRecommendation.label)}>
                Reia căutarea
              </button>
              <button
                className="secondary"
                onClick={() => {
                  clearLastAiRecommendationMemory();
                  window.location.reload();
                }}
              >
                Șterge memoria AI
              </button>
            </div>
          </div>
        </section>
      )}

      {Object.keys(aiRecommendationFeedback || {}).length > 0 && (
        <section className="section">
          <h2><Sparkles size={28} /> AI Feedback Manager</h2>
          <p>Feedback salvat local pentru recomandările AI.</p>

          <div className="recommendationGrid">
            {Object.entries(aiRecommendationFeedback).map(([label, value]) => (
              <article className="recommendationCard" key={label}>
                <span className="pill">Feedback AI</span>
                <h3>{label}</h3>
                <p>{value === 1 ? "Îmi place" : value === -1 ? "Nu-mi place" : "Neutru"}</p>
                <button
                  className="secondary"
                  onClick={() => onRateAiRecommendation && onRateAiRecommendation(label, 0)}
                >
                  Șterge acest feedback
                </button>
              </article>
            ))}
          </div>

          <div className="row">
            <button
              className="danger"
              onClick={() => onResetAiRecommendationFeedback && onResetAiRecommendationFeedback()}
            >
              Resetează feedback AI
            </button>
          </div>
        </section>
      )}

      <section className="section">
        <h2><Sparkles size={28} /> AI Recommendations Panel</h2>
        <p>Recomandări inteligente filtrate după francize, colecții, genuri și scor AI relevant.</p>

        {aiRecommendations.length === 0 ? (
          <p className="empty">Adaugă upload-uri ca să generezi recomandări AI.</p>
        ) : (
          <div className="recommendationGrid">
            {aiRecommendations.map((item) => (
              <article className="recommendationCard" key={item.label}>
                <div>
                  <span className="pill">AI Match</span>
                  <h3>{item.label}</h3>
                  <p>Scor AI: {item.score} · {item.count} potriviri</p>
                  {item.feedback !== 0 && <p>Scor ajustat: {item.adjustedScore}</p>}
                  <p>Sursă AI: {item.sources?.join(", ")}</p>
                  <p>{item.genres.length ? item.genres.join(" · ") : "Recomandare relevantă"}</p>
                  {item.years.length > 0 && <p>Ani: {item.years.join(", ")}</p>}
                </div>

                <div className="packageMeta">
                  {item.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="row">
                  <button onClick={() => onSearchRecommendation ? onSearchRecommendation(item.label, item.label) : setPage("movies")}>Caută în Filme</button>
                  {item.uploads[0] && (
                    <button className="secondary" onClick={() => onPlay(item.uploads[0])}>
                      Redă primul
                    </button>
                  )}

                  <button
                    className="secondary"
                    onClick={() =>
                      onSearchRecommendation
                        ? onSearchRecommendation(buildMoreLikeThisQuery(item), item.label)
                        : setPage("movies")
                    }
                  >
                    Mai multe ca acesta
                  </button>

                  <button
                    className={item.feedback === 1 ? "success" : "secondary"}
                    onClick={() => onRateAiRecommendation && onRateAiRecommendation(item.label, item.feedback === 1 ? 0 : 1)}
                  >
                    Îmi place
                  </button>

                  <button
                    className={item.feedback === -1 ? "danger" : "secondary"}
                    onClick={() => onRateAiRecommendation && onRateAiRecommendation(item.label, item.feedback === -1 ? 0 : -1)}
                  >
                    Nu-mi place
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {watchHistory.length > 0 && (
        <section className="section">
          <div className="sectionHeader">
            <div>
              <h2><PlayCircle size={28} /> Continuă vizionarea</h2>
              <p>Ultimele postări redate pe acest dispozitiv.</p>
            </div>

            <button className="danger" onClick={resetWatchHistory}>
              Șterge tot istoricul
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

function MoviesPage({ movies, uploads = [], selectedMovie, setSelectedMovie, toggleWatchlist, isSaved, onPlay, onEdit, onInfo, searchSeed = "", clearSearchSeed, lastAiRecommendation }) {
  const [query, setQuery] = useState("");
  const [algoliaResults, setAlgoliaResults] = useState([]);
  const [loadingAlgolia, setLoadingAlgolia] = useState(false);
  const [searched, setSearched] = useState(false);
  const [openAlgoliaInfoId, setOpenAlgoliaInfoId] = useState(null);
  const [sortMode, setSortMode] = useState("relevance");
  const quickSearchFilters = ["All", "Movies", "Anime", "Sci-Fi", "Fantasy", "Superhero", "Avatar", "Naruto", "Harry Potter"];

  function algoliaItemToUpload(item) {
    const metadata = item.metadata || {
      movieTitle: item.title || "",
      category: item.category || "",
      contentType: item.contentType || "",
      genre: item.genre || "",
      year: item.year || "",
      franchise: item.franchise || "",
      collection: item.collection || "",
      rating: item.rating || "",
      description: item.description || "",
      originalTitle: item.originalTitle || "",
      tags: item.tags || [],
      externalIds: {
        tmdbId: item.tmdbId || "",
        imdbID: item.imdbID || ""
      },
      aiGenerated: true,
      aiVersion: "algolia-result"
    };

    return {
      id: item.id || item.objectID,
      title: item.title || metadata.movieTitle || "Fără titlu",
      inputType: item.inputType || "url",
      sourceType: item.sourceType || "Algolia",
      value: item.value || "",
      posterUrl: item.posterUrl || "",
      metadata,
      createdAt: item.createdAt || new Date().toISOString()
    };
  }

  function sortSearchResults(items) {
    const list = [...items];

    if (sortMode === "year-desc") {
      return list.sort((a, b) => Number(b.year || b.metadata?.year || 0) - Number(a.year || a.metadata?.year || 0));
    }

    if (sortMode === "year-asc") {
      return list.sort((a, b) => Number(a.year || a.metadata?.year || 0) - Number(b.year || b.metadata?.year || 0));
    }

    if (sortMode === "title-az") {
      return list.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "ro"));
    }

    if (sortMode === "rating-desc") {
      return list.sort((a, b) => Number(b.rating || b.metadata?.rating || 0) - Number(a.rating || a.metadata?.rating || 0));
    }

    return list;
  }

  const sortedAlgoliaResults = sortSearchResults(algoliaResults);

  const localMovies = movies.filter((movie) =>
    `${movie.title} ${movie.genre} ${movie.year} ${movie.description}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const localUploads = uploads.filter((upload) => {
    const metadata = upload.metadata || {};
    return [
      upload.title,
      upload.sourceType,
      upload.value,
      metadata.movieTitle,
      metadata.category,
      metadata.contentType,
      metadata.genre,
      metadata.year,
      metadata.franchise,
      metadata.collection,
      Array.isArray(metadata.tags) ? metadata.tags.join(" ") : "",
      metadata.description,
      metadata.originalTitle
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  async function runAlgoliaQuery(value) {
    const cleanValue = String(value || "").trim();

    if (!cleanValue) {
      setAlgoliaResults([]);
      setSearched(false);
      return;
    }

    setLoadingAlgolia(true);
    setSearched(true);

    try {
      const data = await apiGet("/search?q=" + encodeURIComponent(cleanValue));
      setAlgoliaResults(data.hits || []);
    } catch (error) {
      console.error(error);
      setAlgoliaResults([]);
    }

    setLoadingAlgolia(false);
  }

  async function runQuickSearchFilter(filter) {
    const value = filter === "All" ? "" : filter;
    setQuery(value);
    await runAlgoliaQuery(value);
  }

  async function searchAlgolia(event) {
    event?.preventDefault();

    if (!query.trim()) {
      setAlgoliaResults([]);
      setSearched(false);
      return;
    }

    setLoadingAlgolia(true);
    setSearched(true);

    try {
      const data = await apiGet(`/search?q=${encodeURIComponent(query)}`);
      setAlgoliaResults(data.hits || []);
    } catch (error) {
      console.error(error);
      setAlgoliaResults([]);
    }

    setLoadingAlgolia(false);
  }

  useEffect(() => {
    if (!searchSeed) return;

    setQuery(searchSeed);
    runAlgoliaQuery(searchSeed);

    if (clearSearchSeed) clearSearchSeed();
  }, [searchSeed]); // searchSeed handoff

  function resetSearch() {
    setQuery("");
    setAlgoliaResults([]);
    setSearched(false);
  }

  return (
    <main>
      <section className="section">
        <h2><Search size={28} /> Algolia Smart Search</h2>
        <p>Caută în Algolia, filme și upload-uri salvate în Cloudflare D1.</p>

        <form className="toolbar" onSubmit={searchAlgolia}>
          <div className="searchBox compact wideSearch">
            <Search size={20} />
            <input
              placeholder="Caută film, anime, trailer, franciză, gen, an..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <button type="submit">
            {loadingAlgolia ? "Se caută..." : "Caută Algolia"}
          </button>

          <button type="button" className="secondary" onClick={resetSearch}>
            Reset
          </button>
        </form>

        <div className="sortControl">
          <label>Sortare</label>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="relevance">Relevanță</option>
            <option value="year-desc">An descrescător</option>
            <option value="year-asc">An crescător</option>
            <option value="title-az">Titlu A-Z</option>
            <option value="rating-desc">Rating descrescător</option>
          </select>
        </div>

        <div className="quickFilterBar">
          {quickSearchFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={query === (filter === "All" ? "" : filter) ? "active" : ""}
              onClick={() => runQuickSearchFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {lastAiRecommendation && query && (
          <div className="pwaInstallStatusBox">
            <strong>Căutare pornită din AI Recommendations</strong>
            <p>{lastAiRecommendation.label} → {query}</p>
          </div>
        )}

        <div className="librarySummary">
          <span>Algolia: {algoliaResults.length}</span>
          <span>Upload-uri locale: {localUploads.length}</span>
          <span>Filme locale: {localMovies.length}</span>
        </div>

        {searched && algoliaResults.length > 0 && (
          <div className="metadataResults">
            <h3>Rezultate Algolia</h3>
            <div className="resultGrid">
              {sortedAlgoliaResults.map((item) => (
                <article className="resultCard" key={item.objectID || item.id}>
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={item.title || "Poster"} />
                  ) : (
                    <div className="resultNoImage">No poster</div>
                  )}

                  <div className="resultBody">
                    <span className="pill">Algolia</span>
                    <h3>{item.title || "Fără titlu"}</h3>
                    <p>{item.genre || "General"} {item.year ? `· ${item.year}` : ""}</p>
                    <p>{item.description?.slice?.(0, 180) || "Rezultat din indexul Algolia."}</p>

                    {item.type === "upload" && (
                      <div className="row">
                        <button
                          onClick={() => onPlay(algoliaItemToUpload(item))}
                        >
                          Redă
                        </button>

                        <button
                          className="secondary"
                          onClick={() => {
                            const id = item.id || item.objectID;
                            setOpenAlgoliaInfoId(openAlgoliaInfoId === id ? null : id);
                          }}
                        >
                          Info
                        </button>

                        <button
                          className="secondary"
                          onClick={() => onEdit && onEdit(algoliaItemToUpload(item))}
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {openAlgoliaInfoId === (item.id || item.objectID) && (
                      <div className="uploadDetails">
                        <h4>Detalii Algolia</h4>
                        <p><strong>ID:</strong> {item.id || item.objectID}</p>
                        <p><strong>Sursă:</strong> {item.sourceType || "Algolia"}</p>
                        <p><strong>Input:</strong> {item.inputType || "url"}</p>
                        <p><strong>Categorie:</strong> {item.category || item.metadata?.category || "-"}</p>
                        <p><strong>Gen:</strong> {item.genre || item.metadata?.genre || "-"}</p>
                        <p><strong>An:</strong> {item.year || item.metadata?.year || "-"}</p>
                        <p><strong>Franciză:</strong> {item.franchise || item.metadata?.franchise || "-"}</p>
                        <p><strong>Colecție:</strong> {item.collection || item.metadata?.collection || "-"}</p>
                        <p><strong>Tip:</strong> {item.contentType || item.metadata?.contentType || "-"}</p>
                        <p><strong>Rating:</strong> {item.rating || item.metadata?.rating || "-"}</p>
                        <p><strong>Tags:</strong> {(item.tags || item.metadata?.tags || []).join(", ") || "-"}</p>

                        <div className="row">
                          <button
                            className="secondary"
                            onClick={() => navigator.clipboard?.writeText(item.value || "")}
                          >
                            Copy URL
                          </button>
                          <button
                            className="secondary"
                            onClick={() => navigator.clipboard?.writeText(JSON.stringify(item.metadata || item, null, 2))}
                          >
                            Copy metadata
                          </button>
                        </div>

                        <details>
                          <summary>Vezi URL / iframe</summary>
                          <pre>{item.value || "-"}</pre>
                        </details>

                        <details>
                          <summary>Vezi metadata JSON</summary>
                          <pre>{JSON.stringify(item.metadata || item, null, 2)}</pre>
                        </details>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {query.trim() && localUploads.length > 0 && (
          <div className="metadataResults">
            <h3>Upload-uri găsite</h3>
            <div className="posterGrid20">
              {localUploads.map((upload) => (
                <UploadPosterCard
                  key={upload.id}
                  upload={upload}
                  onPlay={onPlay}
                  onEdit={onEdit}
                  onInfo={onInfo}
                />
              ))}
            </div>
          </div>
        )}

        {query.trim() && localMovies.length > 0 && (
          <div className="metadataResults">
            <h3>Filme găsite</h3>
            <div className="grid">
              {localMovies.map((movie) => (
                <article
                  key={movie.id}
                  className={`card ${selectedMovie?.id === movie.id ? "selected" : ""}`}
                  onClick={() => setSelectedMovie(movie)}
                >
                  {movie.poster ? <img src={movie.poster} alt={movie.title} /> : <div className="posterPlaceholder">Fără poster</div>}
                  <div className="cardBody">
                    <h3>{movie.title}</h3>
                    <p>{movie.year} · {movie.genre}</p>
                    <span><Star size={16} /> {movie.rating}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {!query.trim() && (
          <p className="empty">
            Scrie ceva în motorul de căutare. Exemplu: Avatar, Spider-Man, 2021, Fantasy, Trailer, YouTube.
          </p>
        )}

        {query.trim() && searched && algoliaResults.length === 0 && localUploads.length === 0 && localMovies.length === 0 && (
          <p className="empty">Nu am găsit rezultate pentru această căutare.</p>
        )}
      </section>

      {selectedMovie && (
        <section className="section details">
          <div>
            <span className="pill">Selectat</span>
            <h2>{selectedMovie.title}</h2>
            <p>{selectedMovie.description}</p>
            <div className="meta">
              <span>{selectedMovie.year}</span>
              <span>{selectedMovie.genre}</span>
              <span>{selectedMovie.duration}</span>
            </div>
            <button onClick={() => toggleWatchlist(selectedMovie)}>
              {isSaved(selectedMovie.id) ? <Check size={18} /> : <Plus size={18} />}
              {isSaved(selectedMovie.id) ? "Salvat" : "Adaugă în listă"}
            </button>
          </div>
          {selectedMovie.poster ? <img src={selectedMovie.poster} alt={selectedMovie.title} /> : <div className="posterPlaceholder big">Fără poster</div>}
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
  const [libraryQuery, setLibraryQuery] = useState(() => readAiLibraryUrlFilters().libraryQuery || readAiLibraryFilterMemory().libraryQuery || "");
  const [libraryCategory, setLibraryCategory] = useState(() => readAiLibraryUrlFilters().libraryCategory || readAiLibraryFilterMemory().libraryCategory || "All");
  const [libraryGenre, setLibraryGenre] = useState(() => readAiLibraryUrlFilters().libraryGenre || readAiLibraryFilterMemory().libraryGenre || "All");
  const [librarySource, setLibrarySource] = useState(() => readAiLibraryUrlFilters().librarySource || readAiLibraryFilterMemory().librarySource || "All");
  const [librarySort, setLibrarySort] = useState(() => readAiLibraryUrlFilters().librarySort || readAiLibraryFilterMemory().librarySort || "newest");
  const [libraryQualityFilter, setLibraryQualityFilter] = useState(() => readAiLibraryUrlFilters().libraryQualityFilter || readAiLibraryFilterMemory().libraryQualityFilter || "All");
  const [libraryCountry, setLibraryCountry] = useState(() => readAiLibraryUrlFilters().libraryCountry || readAiLibraryFilterMemory().libraryCountry || "All");
  const [libraryLanguage, setLibraryLanguage] = useState(() => readAiLibraryUrlFilters().libraryLanguage || readAiLibraryFilterMemory().libraryLanguage || "All");
  const [libraryYear, setLibraryYear] = useState(() => readAiLibraryUrlFilters().libraryYear || readAiLibraryFilterMemory().libraryYear || "All");
  const [libraryVideoQuality, setLibraryVideoQuality] = useState(() => readAiLibraryUrlFilters().libraryVideoQuality || readAiLibraryFilterMemory().libraryVideoQuality || "All");
  const [catalogMode, setCatalogMode] = useState(true);
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");
  const [copyLinkToast, setCopyLinkToast] = useState("");
  const [copyLinkDone, setCopyLinkDone] = useState(false);
  const [savedPresetName, setSavedPresetName] = useState("");
  const [savedFilterPresets, setSavedFilterPresets] = useState(() => readSavedAiLibraryPresets());
  const [savedPresetImportText, setSavedPresetImportText] = useState("");
  const [showPresetImportBox, setShowPresetImportBox] = useState(false);
  const [catalogFacets, setCatalogFacets] = useState(null);
  const [catalogStats, setCatalogStats] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      libraryQuery,
      libraryCategory,
      libraryGenre,
      librarySource,
      librarySort,
      libraryQualityFilter,
      libraryCountry,
      libraryLanguage,
      libraryYear,
      libraryVideoQuality
    };

    try {
      localStorage.setItem(AI_LIBRARY_FILTER_MEMORY_KEY, JSON.stringify(payload));
    } catch {
      // localStorage poate fi blocat pe unele browsere
    }

    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      const setOrDelete = (key, value, emptyValue = "All") => {
        if (!value || value === emptyValue) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      };

      setOrDelete("aiQ", libraryQuery, "");
      setOrDelete("aiCategory", libraryCategory);
      setOrDelete("aiGenre", libraryGenre);
      setOrDelete("aiSource", librarySource);
      setOrDelete("aiCountry", libraryCountry);
      setOrDelete("aiLanguage", libraryLanguage);
      setOrDelete("aiYear", libraryYear);
      setOrDelete("aiVideoQuality", libraryVideoQuality);
      setOrDelete("aiQuality", libraryQualityFilter);
      setOrDelete("aiSort", librarySort, "newest");

      const nextUrl = url.pathname + (params.toString() ? "?" + params.toString() : "") + url.hash;
      window.history.replaceState({}, "", nextUrl);
    } catch {
      // URL sync poate fi blocat în moduri speciale de browser
    }
  }, [
    libraryQuery,
    libraryCategory,
    libraryGenre,
    librarySource,
    librarySort,
    libraryQualityFilter,
    libraryCountry,
    libraryLanguage,
    libraryYear,
    libraryVideoQuality
  ]);

  const taxonomyGenres = ["All", ...getGenresForCategory(libraryCategory === "All" ? "Filme" : libraryCategory)];

  const libraryOptions = (field) => {
    if (field === "category") return ["All", ...CONTENT_CATEGORIES];
    if (field === "source") return ["All", ...SOURCE_TYPES];

    if (catalogMode && catalogFacets) {
      if (field === "genre") return catalogFacets.genres || ["All"];
      if (field === "year") return catalogFacets.years || ["All"];
      if (field === "franchise") return catalogFacets.franchises || ["All"];
      if (field === "collection") return catalogFacets.collections || ["All"];
    }
    const values = uploads
      .map((upload) => {
        const metadata = upload.metadata || {};
        if (field === "source") return upload.sourceType || "Other";
        return metadata[field] || "";
      })
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b), "ro"))];
  };

  const filteredLibraryUploads = uploads
    .filter((upload) => {
      const metadata = upload.metadata || {};
      const haystack = [
        upload.title,
        upload.sourceType,
        upload.value,
        metadata.category,
        metadata.contentType,
        metadata.genre,
        metadata.year,
        metadata.franchise,
        metadata.collection,
        metadata.originalTitle,
        metadata.description,
        Array.isArray(metadata.tags) ? metadata.tags.join(" ") : ""
      ].filter(Boolean).join(" ").toLowerCase();

      const queryOk = !libraryQuery.trim() || haystack.includes(libraryQuery.toLowerCase());
      const categoryOk = libraryCategory === "All" || metadata.category === libraryCategory;
      const genreOk = libraryGenre === "All" || metadata.genre === libraryGenre;
      const sourceOk = librarySource === "All" || upload.sourceType === librarySource;

      const qualityOk =
        libraryQualityFilter === "All" ||
        (libraryQualityFilter === "missingPoster" && !upload.posterUrl) ||
        (libraryQualityFilter === "missingGenre" && !metadata.genre) ||
        (libraryQualityFilter === "missingYear" && !metadata.year) ||
        (libraryQualityFilter === "missingTags" && (!Array.isArray(metadata.tags) || metadata.tags.length === 0));

      return queryOk && categoryOk && genreOk && sourceOk && qualityOk;
    })
    .sort((a, b) => {
      const aMeta = a.metadata || {};
      const bMeta = b.metadata || {};

      if (librarySort === "title-az") return String(a.title || "").localeCompare(String(b.title || ""), "ro");
      if (librarySort === "title-za") return String(b.title || "").localeCompare(String(a.title || ""), "ro");
      if (librarySort === "year-desc") return Number(bMeta.year || 0) - Number(aMeta.year || 0);
      if (librarySort === "year-asc") return Number(aMeta.year || 0) - Number(bMeta.year || 0);

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  const activeLibraryFilters = [
    libraryQuery.trim() ? {
      label: "Căutare",
      value: libraryQuery,
      clear: () => setLibraryQuery("")
    } : null,
    libraryCategory !== "All" ? {
      label: "Categorie",
      value: libraryCategory,
      clear: () => setLibraryCategory("All")
    } : null,
    libraryGenre !== "All" ? {
      label: "Gen",
      value: libraryGenre,
      clear: () => setLibraryGenre("All")
    } : null,
    librarySource !== "All" ? {
      label: "Sursă",
      value: librarySource,
      clear: () => setLibrarySource("All")
    } : null,
    libraryCountry !== "All" ? {
      label: "Țară",
      value: libraryCountry,
      clear: () => setLibraryCountry("All")
    } : null,
    libraryYear !== "All" ? {
      label: "An",
      value: libraryYear,
      clear: () => setLibraryYear("All")
    } : null,
    libraryLanguage !== "All" ? {
      label: "Limbă",
      value: libraryLanguage,
      clear: () => setLibraryLanguage("All")
    } : null,
    libraryVideoQuality !== "All" ? {
      label: "Calitate",
      value: libraryVideoQuality,
      clear: () => setLibraryVideoQuality("All")
    } : null,
    librarySort !== "newest" ? {
      label: "Sortare",
      value: librarySort,
      clear: () => setLibrarySort("newest")
    } : null,
    libraryQualityFilter !== "All" ? {
      label: "Calitate",
      value:
        libraryQualityFilter === "missingPoster" ? "Fără poster" :
        libraryQualityFilter === "missingGenre" ? "Fără gen" :
        libraryQualityFilter === "missingYear" ? "Fără an" :
        libraryQualityFilter === "missingTags" ? "Fără tags" :
        libraryQualityFilter,
      clear: () => setLibraryQualityFilter("All")
    } : null
  ].filter(Boolean);

  const libraryQuality = {
    total: uploads.length,
    withPoster: uploads.filter((upload) => Boolean(upload.posterUrl)).length,
    withoutPoster: uploads.filter((upload) => !upload.posterUrl).length,
    withGenre: uploads.filter((upload) => Boolean(upload.metadata?.genre)).length,
    withoutGenre: uploads.filter((upload) => !upload.metadata?.genre).length,
    withYear: uploads.filter((upload) => Boolean(upload.metadata?.year)).length,
    withoutYear: uploads.filter((upload) => !upload.metadata?.year).length,
    withTags: uploads.filter((upload) => Array.isArray(upload.metadata?.tags) && upload.metadata.tags.length > 0).length,
    withoutTags: uploads.filter((upload) => !Array.isArray(upload.metadata?.tags) || upload.metadata.tags.length === 0).length
  };

  const smartEmptyActions = [
    libraryQuery.trim() ? {
      label: "Elimină căutarea",
      detail: libraryQuery,
      action: () => {
        setLibraryQuery("");
        setPage(1);
      }
    } : null,
    libraryCategory !== "All" ? {
      label: "Elimină categoria",
      detail: libraryCategory,
      action: () => {
        setLibraryCategory("All");
        setPage(1);
      }
    } : null,
    libraryGenre !== "All" ? {
      label: "Elimină genul",
      detail: libraryGenre,
      action: () => {
        setLibraryGenre("All");
        setPage(1);
      }
    } : null,
    librarySource !== "All" ? {
      label: "Elimină sursa",
      detail: librarySource,
      action: () => {
        setLibrarySource("All");
        setPage(1);
      }
    } : null,
    libraryCountry !== "All" ? {
      label: "Elimină țara",
      detail: libraryCountry,
      action: () => {
        setLibraryCountry("All");
        setPage(1);
      }
    } : null,
    libraryYear !== "All" ? {
      label: "Elimină anul",
      detail: libraryYear,
      action: () => {
        setLibraryYear("All");
        setPage(1);
      }
    } : null,
    libraryLanguage !== "All" ? {
      label: "Elimină limba",
      detail: libraryLanguage,
      action: () => {
        setLibraryLanguage("All");
        setPage(1);
      }
    } : null,
    libraryVideoQuality !== "All" ? {
      label: "Elimină calitatea",
      detail: libraryVideoQuality,
      action: () => {
        setLibraryVideoQuality("All");
        setPage(1);
      }
    } : null,
    libraryQualityFilter !== "All" ? {
      label: "Elimină filtrul de calitate",
      detail: libraryQualityFilter,
      action: () => {
        setLibraryQualityFilter("All");
        setPage(1);
      }
    } : null
  ].filter(Boolean);

  const hasSmartEmptyState = catalogMode && !catalogLoading && !catalogError && catalogTotal === 0 && smartEmptyActions.length > 0;

  const presetCount = (preset) => {
    const stats = catalogStats || {};
    const categories = stats.categories || [];
    const sources = stats.sources || [];

    const categoryCount = (names) => {
      const wanted = new Set(names.map((x) => String(x).toLowerCase()));
      return categories
        .filter((item) => wanted.has(String(item.value || "").toLowerCase()))
        .reduce((sum, item) => sum + Number(item.count || 0), 0);
    };

    const sourceCount = (names) => {
      const wanted = new Set(names.map((x) => String(x).toLowerCase()));
      return sources
        .filter((item) => wanted.has(String(item.value || "").toLowerCase()))
        .reduce((sum, item) => sum + Number(item.count || 0), 0);
    };

    if (preset === "all") return Number(stats.total || catalogTotal || uploads.length || 0);
    if (preset === "anime") return categoryCount(["Anime", "Anime-uri Filme", "Anime-uri Seriale"]);
    if (preset === "movies") return categoryCount(["Movies", "Filme"]);
    if (preset === "series") return categoryCount(["Series", "Seriale"]);
    if (preset === "bollywood") return categoryCount(["Filme Bollywood", "Seriale Bollywood"]);
    if (preset === "sport") return categoryCount(["Sport"]);
    if (preset === "music") return categoryCount(["Muzică", "Muzica", "Music"]);
    if (preset === "youtube") return sourceCount(["YouTube"]);
    if (preset === "tiktok") return sourceCount(["TikTok"]);
    if (preset === "terabox") return sourceCount(["Terabox"]);
    return 0;
  };

  const isPresetActive = (preset) => {
    if (preset === "all") {
      return libraryCategory === "All" &&
        libraryGenre === "All" &&
        librarySource === "All" &&
        libraryCountry === "All" &&
        libraryLanguage === "All" &&
        libraryYear === "All" &&
        libraryVideoQuality === "All" &&
        libraryQualityFilter === "All" &&
        !libraryQuery;
    }

    if (preset === "anime") {
      return libraryCategory === "Anime-uri Filme" && libraryCountry === "Japonia" && libraryLanguage === "Japoneză";
    }

    if (preset === "movies") {
      return libraryCategory === "Filme";
    }

    if (preset === "series") {
      return libraryCategory === "Seriale";
    }

    if (preset === "bollywood") {
      return libraryCategory === "Filme Bollywood" && libraryCountry === "India" && libraryLanguage === "Hindi";
    }

    if (preset === "sport") {
      return libraryCategory === "Sport";
    }

    if (preset === "music") {
      return libraryCategory === "Muzică";
    }

    if (preset === "youtube") {
      return librarySource === "YouTube";
    }

    if (preset === "tiktok") {
      return librarySource === "TikTok";
    }

    if (preset === "terabox") {
      return librarySource === "Terabox";
    }

    return false;
  };

  const applyLibraryPreset = (preset) => {
    setPage(1);

    if (preset === "all") {
      clearLibraryFilters();
      return;
    }

    setLibraryQuery("");

    if (preset === "anime") {
      setLibraryCategory("Anime-uri Filme");
      setLibraryGenre("All");
      setLibrarySource("All");
      setLibraryCountry("Japonia");
      setLibraryLanguage("Japoneză");
      setLibraryYear("All");
      setLibraryVideoQuality("All");
      setLibraryQualityFilter("All");
      setLibrarySort("newest");
      return;
    }

    if (preset === "movies") {
      setLibraryCategory("Filme");
      setLibraryGenre("All");
      setLibrarySource("All");
      setLibraryCountry("All");
      setLibraryLanguage("All");
      setLibraryYear("All");
      setLibraryVideoQuality("All");
      setLibraryQualityFilter("All");
      setLibrarySort("newest");
      return;
    }

    if (preset === "series") {
      setLibraryCategory("Seriale");
      setLibraryGenre("All");
      setLibrarySource("All");
      setLibraryCountry("All");
      setLibraryLanguage("All");
      setLibraryYear("All");
      setLibraryVideoQuality("All");
      setLibraryQualityFilter("All");
      setLibrarySort("newest");
      return;
    }

    if (preset === "bollywood") {
      setLibraryCategory("Filme Bollywood");
      setLibraryGenre("All");
      setLibrarySource("All");
      setLibraryCountry("India");
      setLibraryLanguage("Hindi");
      setLibraryYear("All");
      setLibraryVideoQuality("All");
      setLibraryQualityFilter("All");
      setLibrarySort("newest");
      return;
    }

    if (preset === "sport") {
      setLibraryCategory("Sport");
      setLibraryGenre("All");
      setLibrarySource("All");
      setLibraryCountry("All");
      setLibraryLanguage("All");
      setLibraryYear("All");
      setLibraryVideoQuality("All");
      setLibraryQualityFilter("All");
      setLibrarySort("newest");
      return;
    }

    if (preset === "music") {
      setLibraryCategory("Muzică");
      setLibraryGenre("All");
      setLibrarySource("All");
      setLibraryCountry("All");
      setLibraryLanguage("All");
      setLibraryYear("All");
      setLibraryVideoQuality("All");
      setLibraryQualityFilter("All");
      setLibrarySort("newest");
      return;
    }

    if (preset === "youtube") {
      setLibrarySource(librarySource === "YouTube" ? "All" : "YouTube");
      setLibraryQualityFilter("All");
      return;
    }

    if (preset === "tiktok") {
      setLibrarySource(librarySource === "TikTok" ? "All" : "TikTok");
      setLibraryQualityFilter("All");
      return;
    }

    if (preset === "terabox") {
      setLibrarySource(librarySource === "Terabox" ? "All" : "Terabox");
      setLibraryQualityFilter("All");
      return;
    }
  };

  const currentAiLibraryFilterPayload = () => ({
    libraryQuery,
    libraryCategory,
    libraryGenre,
    librarySource,
    librarySort,
    libraryQualityFilter,
    libraryCountry,
    libraryLanguage,
    libraryYear,
    libraryVideoQuality
  });

  const applyAiLibraryFilterPayload = (payload = {}) => {
    setLibraryQuery(payload.libraryQuery || "");
    setLibraryCategory(payload.libraryCategory || "All");
    setLibraryGenre(payload.libraryGenre || "All");
    setLibrarySource(payload.librarySource || "All");
    setLibrarySort(payload.librarySort || "newest");
    setLibraryQualityFilter(payload.libraryQualityFilter || "All");
    setLibraryCountry(payload.libraryCountry || "All");
    setLibraryLanguage(payload.libraryLanguage || "All");
    setLibraryYear(payload.libraryYear || "All");
    setLibraryVideoQuality(payload.libraryVideoQuality || "All");
    setPage(1);
  };

  const saveCurrentAiLibraryPreset = () => {
    const name = savedPresetName.trim();
    if (!name) {
      setCopyLinkToast("Scrie un nume pentru preset.");
      window.setTimeout(() => setCopyLinkToast(""), 2500);
      return;
    }

    const nextPreset = {
      id: String(Date.now()),
      name,
      filters: currentAiLibraryFilterPayload(),
      createdAt: new Date().toISOString()
    };

    const next = [
      nextPreset,
      ...savedFilterPresets.filter((item) => item.name.toLowerCase() !== name.toLowerCase())
    ].slice(0, 20);

    setSavedFilterPresets(next);
    writeSavedAiLibraryPresets(next);
    setSavedPresetName("");
    setCopyLinkToast("Preset salvat.");
    window.setTimeout(() => setCopyLinkToast(""), 2500);
  };

  const applySavedAiLibraryPreset = (preset) => {
    applyAiLibraryFilterPayload(preset?.filters || {});
    setCopyLinkToast("Preset aplicat.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const deleteSavedAiLibraryPreset = (id) => {
    const next = savedFilterPresets.filter((item) => item.id !== id);
    setSavedFilterPresets(next);
    writeSavedAiLibraryPresets(next);
    setCopyLinkToast("Preset șters.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const renameSavedAiLibraryPreset = (preset) => {
    const currentName = preset?.name || "";
    const nextName = window.prompt("Nume nou pentru preset:", currentName);

    if (nextName === null) return;

    const cleanName = String(nextName || "").trim();

    if (!cleanName) {
      setCopyLinkToast("Numele presetului nu poate fi gol.");
      window.setTimeout(() => setCopyLinkToast(""), 2200);
      return;
    }

    const next = savedFilterPresets.map((item) =>
      item.id === preset.id ? { ...item, name: cleanName } : item
    );

    setSavedFilterPresets(next);
    writeSavedAiLibraryPresets(next);
    setCopyLinkToast("Preset redenumit.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const duplicateSavedAiLibraryPreset = (preset) => {
    if (!preset) return;

    const copy = {
      ...preset,
      id: String(Date.now()),
      name: preset.name + " Copy",
      createdAt: new Date().toISOString()
    };

    const next = [copy, ...savedFilterPresets].slice(0, 20);

    setSavedFilterPresets(next);
    writeSavedAiLibraryPresets(next);
    setCopyLinkToast("Preset duplicat.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const exportSavedAiLibraryPresets = async () => {
    const payload = JSON.stringify(savedFilterPresets, null, 2);

    try {
      await navigator.clipboard.writeText(payload);
      setCopyLinkToast("Preseturi exportate/copiate.");
    } catch {
      setSavedPresetImportText(payload);
      setShowPresetImportBox(true);
      setCopyLinkToast("Export generat mai jos.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2500);
  };

  const importSavedAiLibraryPresets = () => {
    try {
      const parsed = JSON.parse(savedPresetImportText || "[]");

      if (!Array.isArray(parsed)) {
        setCopyLinkToast("JSON invalid: trebuie listă.");
        window.setTimeout(() => setCopyLinkToast(""), 2500);
        return;
      }

      const cleaned = parsed
        .filter((item) => item && item.name && item.filters)
        .map((item) => ({
          id: item.id || String(Date.now() + Math.random()),
          name: String(item.name).slice(0, 80),
          filters: item.filters || {},
          createdAt: item.createdAt || new Date().toISOString()
        }));

      const merged = [
        ...cleaned,
        ...savedFilterPresets.filter((existing) =>
          !cleaned.some((item) => item.name.toLowerCase() === existing.name.toLowerCase())
        )
      ].slice(0, 20);

      setSavedFilterPresets(merged);
      writeSavedAiLibraryPresets(merged);
      setSavedPresetImportText("");
      setShowPresetImportBox(false);
      setCopyLinkToast("Preseturi importate.");
    } catch {
      setCopyLinkToast("JSON invalid.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2500);
  };

  const clearLibraryFilters = () => {
    setLibraryQuery("");
    setLibraryCategory("All");
    setLibraryGenre("All");
    setLibrarySource("All");
    setLibrarySort("newest");
    setLibraryQualityFilter("All");
    setLibraryCountry("All");
    setLibraryLanguage("All");
    setLibraryYear("All");
    setLibraryVideoQuality("All");
    setPage(1);
  };

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

  const totalPages = catalogMode ? catalogTotalPages : Math.max(1, Math.ceil(filteredLibraryUploads.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const currentItems = catalogMode ? catalogItems : filteredLibraryUploads.slice(start, start + PAGE_SIZE);

  async function loadCatalogFacetsAndStats() {
    try {
      const [facets, stats] = await Promise.all([
        apiCatalogFacets(),
        apiCatalogStats()
      ]);
      setCatalogFacets(facets);
      setCatalogStats(stats);
    } catch (error) {
      console.warn("Catalog facets/stats failed", error);
    }
  }

  async function loadCatalogPage() {
    if (!catalogMode) return;

    setCatalogLoading(true);
    setCatalogError("");

    try {
      const data = await apiCatalog({
        page,
        limit: PAGE_SIZE,
        q: libraryQuery,
        category: libraryCategory,
        genre: libraryGenre,
        sourceType: librarySource,
        year: libraryYear,
        country: libraryCountry,
        language: libraryLanguage,
        videoQuality: libraryVideoQuality,
        quality: libraryQualityFilter,
        sort: librarySort
      });

      setCatalogItems(data.items || []);
      setCatalogTotal(Number(data.total || 0));
      setCatalogTotalPages(Number(data.totalPages || 1));
    } catch (error) {
      setCatalogError(String(error?.message || error));
      setCatalogItems([]);
    } finally {
      setCatalogLoading(false);
    }
  }

  useEffect(() => {
    if (catalogMode) {
      loadCatalogFacetsAndStats();
    }
  }, [catalogMode]);

  useEffect(() => {
    loadCatalogPage();
  }, [catalogMode, page, libraryQuery, libraryCategory, libraryGenre, librarySource, libraryYear, libraryCountry, libraryLanguage, libraryVideoQuality, libraryQualityFilter, librarySort]);

  function nextPage() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function prevPage() {
    setPage((p) => Math.max(1, p - 1));
  }

  function resetFilters() {
    setLibraryQuery("");
    setLibraryCategory("All");
    setLibraryGenre("All");
    setLibrarySource("All");
    setLibrarySort("newest");
    setLibraryQualityFilter("All");

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

        <div className="details">
          <div>
            <h3>AI Library Filters</h3>
            <p><span className="pill">Catalog Mode Server-Side</span> Biblioteca folosește Worker /catalog pentru paginare scalabilă.</p>
            <p><span className="pill">Alias Mapper activ</span> Filtrele noi pot găsi și metadata veche: Movies → Filme, Anime → Anime-uri Filme, Japan → Japonia.</p>

            <div className="presetPanel">
              <div className="presetHeader">
                <span className="pill">Preset rapid</span>
                <button className={isPresetActive("all") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("all")}>Toate · {presetCount("all")}</button>
                <span className="mutedText">Alege rapid tipul de bibliotecă sau sursa.</span>
              </div>

              <div className="presetGroup">
                <span className="presetGroupLabel">Conținut</span>
                <div className="presetButtons">
                  <button className={isPresetActive("anime") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("anime")}>Anime Japonia · {presetCount("anime")}</button>
                  <button className={isPresetActive("movies") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("movies")}>Filme · {presetCount("movies")}</button>
                  <button className={isPresetActive("series") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("series")}>Seriale · {presetCount("series")}</button>
                  <button className={isPresetActive("bollywood") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("bollywood")}>Bollywood · {presetCount("bollywood")}</button>
                </div>
              </div>

              <div className="presetGroup">
                <span className="presetGroupLabel">Domenii</span>
                <div className="presetButtons">
                  <button className={isPresetActive("sport") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("sport")}>Sport · {presetCount("sport")}</button>
                  <button className={isPresetActive("music") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("music")}>Muzică · {presetCount("music")}</button>
                </div>
              </div>

              <div className="presetGroup">
                <span className="presetGroupLabel">Surse</span>
                <div className="presetButtons">
                  <button className={isPresetActive("youtube") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("youtube")}>YouTube · {presetCount("youtube")}</button>
                  <button className={isPresetActive("tiktok") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("tiktok")}>TikTok · {presetCount("tiktok")}</button>
                  <button className={isPresetActive("terabox") ? "secondary activePreset" : "secondary"} onClick={() => applyLibraryPreset("terabox")}>Terabox · {presetCount("terabox")}</button>
                </div>
              </div>
            </div>

            <div className="savedPresetPanel">
              <div className="presetHeader">
                <span className="pill">Preseturi salvate</span>
                <span className="mutedText">Salvează combinația curentă de filtre.</span>
              </div>

              <div className="savedPresetForm">
                <input
                  value={savedPresetName}
                  onChange={(event) => setSavedPresetName(event.target.value)}
                  placeholder="Ex: Filme YouTube"
                />
                <button className="secondary" onClick={saveCurrentAiLibraryPreset}>
                  Salvează preset
                </button>
              </div>

              <div className="savedPresetTools">
                <button className="secondary" onClick={exportSavedAiLibraryPresets}>
                  Export preseturi
                </button>
                <button className="secondary" onClick={() => setShowPresetImportBox(!showPresetImportBox)}>
                  Import preseturi
                </button>
              </div>

              {showPresetImportBox && (
                <div className="savedPresetImportBox">
                  <textarea
                    value={savedPresetImportText}
                    onChange={(event) => setSavedPresetImportText(event.target.value)}
                    placeholder="Lipește aici JSON-ul exportat"
                  />
                  <button className="secondary" onClick={importSavedAiLibraryPresets}>
                    Aplică import
                  </button>
                </div>
              )}

              {savedFilterPresets.length > 0 ? (
                <div className="savedPresetList">
                  {savedFilterPresets.map((preset) => (
                    <div className="savedPresetItem" key={preset.id}>
                      <button className="secondary" onClick={() => applySavedAiLibraryPreset(preset)}>
                        {preset.name}
                      </button>
                      <button className="secondary" onClick={() => renameSavedAiLibraryPreset(preset)}>
                        Redenumește
                      </button>
                      <button className="secondary" onClick={() => duplicateSavedAiLibraryPreset(preset)}>
                        Duplică
                      </button>
                      <button className="secondary" onClick={() => deleteSavedAiLibraryPreset(preset.id)}>
                        Șterge
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mutedText">Nu ai preseturi salvate încă.</p>
              )}
            </div>
            <p>Filtrează rapid biblioteca după titlu, categorie, gen, sursă și sortare.</p>

            <div className="toolbar">
              <div className="searchBox compact wideSearch">
                <Search size={20} />
                <input
                  placeholder="Caută în AI Library..."
                  value={libraryQuery}
                  onChange={(event) => setLibraryQuery(event.target.value)}
                />
              </div>

              <select value={libraryCategory} onChange={(event) => { setLibraryCategory(event.target.value); setLibraryGenre("All"); setPage(1); }}>
                {libraryOptions("category").map((item) => (
                  <option key={item} value={item}>Categorie: {item}</option>
                ))}
              </select>

              <select value={libraryGenre} onChange={(event) => setLibraryGenre(event.target.value)}>
                {taxonomyGenres.map((item) => (
                  <option key={item} value={item}>Gen: {item}</option>
                ))}
              </select>

              <select value={librarySource} onChange={(event) => { setLibrarySource(event.target.value); setPage(1); }}>
                {libraryOptions("source").map((item) => (
                  <option key={item} value={item}>Sursă: {item}</option>
                ))}
              </select>

              <select value={libraryCountry} onChange={(event) => { setLibraryCountry(event.target.value); setPage(1); }}>
                {["All", ...COUNTRIES].map((item) => (
                  <option key={item} value={item}>Țară: {item}</option>
                ))}
              </select>

              <select value={libraryYear} onChange={(event) => { setLibraryYear(event.target.value); setPage(1); }}>
                {["All", ...YEARS].map((item) => (
                  <option key={item} value={item}>An: {item}</option>
                ))}
              </select>

              <select value={libraryLanguage} onChange={(event) => { setLibraryLanguage(event.target.value); setPage(1); }}>
                {["All", ...LANGUAGES].map((item) => (
                  <option key={item} value={item}>Limbă: {item}</option>
                ))}
              </select>

              <select value={libraryVideoQuality} onChange={(event) => { setLibraryVideoQuality(event.target.value); setPage(1); }}>
                {["All", ...VIDEO_QUALITIES].map((item) => (
                  <option key={item} value={item}>
                    Calitate: {item === "All" ? "All" : VIDEO_QUALITY_LABELS[item] || item}
                  </option>
                ))}
              </select>

              <select value={librarySort} onChange={(event) => setLibrarySort(event.target.value)}>
                <option value="newest">Cele mai noi</option>
                <option value="title-az">Titlu A-Z</option>
                <option value="title-za">Titlu Z-A</option>
                <option value="year-desc">An descrescător</option>
                <option value="year-asc">An crescător</option>
              </select>

              <button
                className="secondary"
                onClick={clearLibraryFilters}
              >
                Reset filtre
              </button>

              <button
                className="secondary"
                onClick={() => {
                  try {
                    localStorage.removeItem(AI_LIBRARY_FILTER_MEMORY_KEY);
                  } catch {}
                  clearLibraryFilters();
                }}
              >
                Șterge memoria
              </button>

              <button
                className="secondary"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopyLinkToast("Link filtre copiat cu succes.");
                    setCopyLinkDone(true);
                  } catch {
                    setCopyLinkToast(window.location.href);
                    setCopyLinkDone(true);
                  }

                  window.setTimeout(() => {
                    setCopyLinkToast("");
                    setCopyLinkDone(false);
                  }, 2500);
                }}
              >
                {copyLinkDone ? "Copiat!" : "Copiază link filtre"}
              </button>

              {copyLinkToast && (
                <span className="copyToast">{copyLinkToast}</span>
              )}
            </div>

            <div className="librarySummary">
              <span>Rezultate: {catalogMode ? catalogTotal : filteredLibraryUploads.length}</span>
              <span>Total upload-uri: {catalogMode ? catalogStats?.total || catalogTotal : uploads.length}</span>
            </div>

            {catalogMode && catalogLoading && <p className="empty">Se încarcă pagina catalog...</p>}
            {catalogMode && catalogError && <p className="empty">Catalog error: {catalogError}</p>}

            <div className="details">
              <div>
                <h3>AI Library Quality Panel</h3>
                <p>Verifică rapid cât de completă este biblioteca ta AI.</p>

                <div className="stats">
                  <div><strong>{libraryQuality.total}</strong><span>Total</span></div>
                  <div><strong>{libraryQuality.withPoster}</strong><span>Cu poster</span></div>
                  <div><strong>{libraryQuality.withGenre}</strong><span>Cu gen</span></div>
                  <div><strong>{libraryQuality.withYear}</strong><span>Cu an</span></div>
                  <div><strong>{libraryQuality.withTags}</strong><span>Cu tags</span></div>
                </div>

                <div className="activeFilterChips">
                  {libraryQuality.withoutPoster > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingPoster"); setPage(1); }}>
                      Fără poster: {libraryQuality.withoutPoster}
                    </button>
                  )}
                  {libraryQuality.withoutGenre > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingGenre"); setPage(1); }}>
                      Fără gen: {libraryQuality.withoutGenre}
                    </button>
                  )}
                  {libraryQuality.withoutYear > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingYear"); setPage(1); }}>
                      Fără an: {libraryQuality.withoutYear}
                    </button>
                  )}
                  {libraryQuality.withoutTags > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingTags"); setPage(1); }}>
                      Fără tags: {libraryQuality.withoutTags}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {activeLibraryFilters.length > 0 && (
              <div className="activeFilterChips">
                {activeLibraryFilters.map((filter) => (
                  <button
                    type="button"
                    className="filterChip"
                    key={filter.label + filter.value}
                    onClick={() => {
                      filter.clear();
                      setPage(1);
                    }}
                  >
                    {filter.label}: {filter.value} ×
                  </button>
                ))}

                <button
                  type="button"
                  className="filterChip clear"
                  onClick={clearLibraryFilters}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
        <p>Posterele încărcate prin URL/iframe apar aici. Limită: 20 postere pe pagină.</p>
        <div className="legacyLibraryFilters">

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

        </div>

        <div className="librarySummary">
          <span>Total upload-uri: {uploads.length}</span>
          <span>Rezultate filtrate: {catalogMode ? catalogTotal : filteredLibraryUploads.length}</span>
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

        {currentItems.length === 0 ? (
          <div className="empty">
            {hasSmartEmptyState ? (
              <div>
                <span className="pill">Smart Empty State</span>
                <h3>Nu există rezultate pentru combinația curentă.</h3>
                <p>
                  Filtrele active sunt prea restrictive. Elimină unul dintre filtre sau resetează tot.
                </p>

                <div className="row">
                  {smartEmptyActions.map((item) => (
                    <button key={item.label + item.detail} className="secondary" onClick={item.action}>
                      {item.label}: {item.detail}
                    </button>
                  ))}

                  <button onClick={clearLibraryFilters}>
                    Reset toate filtrele
                  </button>
                </div>
              </div>
            ) : (
              "Nu există postere pentru filtrele selectate."
            )}
          </div>
        ) : (
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
  const [pwaChecks, setPwaChecks] = useState([]);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [installStatus, setInstallStatus] = useState("");
  const [publicHealth, setPublicHealth] = useState([]);
  const [apiDiagnostics, setApiDiagnostics] = useState([]);
  const appVersion = CINEVERSE_VERSION;
  const buildVersion = CINEVERSE_BUILD;
  async function runApiDiagnostics() {
    const tests = [
      { label: "Health", path: "/health" },
      { label: "Uploads", path: "/uploads" },
      { label: "Algolia Avatar", path: "/search?q=Avatar" },
      { label: "Metadata Avatar", path: "/search-metadata?q=Avatar" },
      { label: "Anime Naruto", path: "/anime?q=Naruto" },
      { label: "Sport Barcelona", path: "/sport?q=Barcelona" }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const started = performance.now();
        const data = await apiGet(test.path);
        const ms = Math.round(performance.now() - started);

        const ok =
          Array.isArray(data) ||
          data?.ok === true ||
          data?.results ||
          data?.uploads ||
          data?.hits ||
          data?.tmdb ||
          data?.jikan ||
          data?.teams;

        results.push({
          label: test.label,
          path: test.path,
          status: ok ? `OK · ${ms}ms` : `Răspuns invalid · ${ms}ms`,
          type: ok ? "ok" : "danger"
        });
      } catch (error) {
        results.push({
          label: test.label,
          path: test.path,
          status: "Eroare",
          type: "danger"
        });
      }
    }

    setApiDiagnostics(results);
  }

  async function runPublicHealthCheck() {
    const checks = [];

    checks.push({
      label: "Public URL",
      status: CINEVERSE_DEPLOY_INFO.publicUrl ? "Configurat" : "Lipsește",
      type: CINEVERSE_DEPLOY_INFO.publicUrl ? "ok" : "danger"
    });

    try {
      const api = await apiGet("/health");
      checks.push({
        label: "Cloudflare API",
        status: api?.ok ? "Conectat" : "Răspuns invalid",
        type: api?.ok ? "ok" : "danger"
      });
    } catch {
      checks.push({ label: "Cloudflare API", status: "Eroare", type: "danger" });
    }

    try {
      const data = await apiGet("/search?q=Avatar");
      checks.push({
        label: "Algolia search",
        status: data?.ok ? `OK · ${data.hits?.length || 0} rezultate` : "Răspuns invalid",
        type: data?.ok ? "ok" : "danger"
      });
    } catch {
      checks.push({ label: "Algolia search", status: "Eroare", type: "danger" });
    }

    try {
      const manifestJson = await fetch("/manifest.json", { cache: "no-store" });
      const manifestWeb = await fetch("/manifest.webmanifest", { cache: "no-store" });
      const manifestOk = manifestJson.ok || manifestWeb.ok;
      checks.push({
        label: "PWA manifest",
        status: manifestOk ? "Găsit" : "Lipsește",
        type: manifestOk ? "ok" : "danger"
      });
    } catch {
      checks.push({ label: "PWA manifest", status: "Eroare", type: "danger" });
    }

    checks.push({
      label: "Service Worker",
      status: "serviceWorker" in navigator ? "Suportat" : "Nesuportat",
      type: "serviceWorker" in navigator ? "ok" : "pending"
    });

    try {
      localStorage.setItem("cineverse_health_test", "ok");
      localStorage.removeItem("cineverse_health_test");
      checks.push({ label: "Local storage", status: "Funcțional", type: "ok" });
    } catch {
      checks.push({ label: "Local storage", status: "Blocat", type: "danger" });
    }

    setPublicHealth(checks);
  }

  async function installPwaNow() {
    if (!installPromptEvent) {
      setInstallStatus("Promptul de instalare nu este disponibil încă. Folosește meniul browserului → Add to Home Screen / Install app.");
      alert("Promptul de instalare nu este disponibil încă. Pe Android/Chrome: meniul ⋮ → Add to Home Screen / Install app.");
      return;
    }

    try {
      installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;

      if (choice.outcome === "accepted") {
        setInstallStatus("Instalarea PWA a fost acceptată.");
      } else {
        setInstallStatus("Instalarea PWA a fost anulată.");
      }

      setInstallPromptEvent(null);
    } catch (error) {
      console.error(error);
      setInstallStatus("Nu s-a putut porni instalarea PWA.");
    }
  }

  async function runPwaChecks() {
    const checks = [];

    try {
      const manifestJsonResponse = await fetch("/manifest.json", { cache: "no-store" });
      const manifestWebResponse = await fetch("/manifest.webmanifest", { cache: "no-store" });
      const manifestOk = manifestJsonResponse.ok || manifestWebResponse.ok;

      checks.push({
        label: manifestWebResponse.ok ? "manifest.webmanifest" : "manifest.json",
        status: manifestOk ? "Găsit" : "Lipsește",
        type: manifestOk ? "ok" : "danger"
      });
    } catch {
      checks.push({ label: "manifest.json", status: "Eroare verificare", type: "danger" });
    }

    checks.push({
      label: "Service Worker support",
      status: "serviceWorker" in navigator ? "Suportat" : "Nesuportat",
      type: "serviceWorker" in navigator ? "ok" : "pending"
    });

    checks.push({
      label: "PWA install support",
      status: "BeforeInstallPromptEvent" in window || "onbeforeinstallprompt" in window ? "Disponibil" : "Limitat / depinde de browser",
      type: "BeforeInstallPromptEvent" in window || "onbeforeinstallprompt" in window ? "ok" : "pending"
    });

    try {
      localStorage.setItem("cineverse_pwa_test", "ok");
      localStorage.removeItem("cineverse_pwa_test");
      checks.push({ label: "Local storage", status: "Funcțional", type: "ok" });
    } catch {
      checks.push({ label: "Local storage", status: "Blocat", type: "danger" });
    }

    try {
      const api = await apiGet("/health");
      checks.push({
        label: "Cloudflare API",
        status: api?.ok ? "Conectat" : "Răspuns invalid",
        type: api?.ok ? "ok" : "danger"
      });
    } catch {
      checks.push({ label: "Cloudflare API", status: "Eroare conectare", type: "danger" });
    }

    setPwaChecks(checks);
  }

  useEffect(() => {
    runPwaChecks();
    runPublicHealthCheck();
    runApiDiagnostics();

    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPromptEvent(event);
      setInstallStatus("PWA poate fi instalată pe acest dispozitiv.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const directUploadSteps = [
    "Rulează în Termux: npm run build",
    "Verifică folderul generat: dist",
    "Intră în Cloudflare Dashboard → Workers & Pages",
    "Alege Create application → Pages",
    "Alege Direct Upload",
    "Încarcă folderul dist",
    "Apasă Deploy",
    "Deschide URL-ul HTTPS generat și testează PWA Install"
  ];

  const deploySteps = [
    "Rulează build local: npm run build",
    "În Cloudflare Dashboard intră la Workers & Pages",
    "Alege Create application → Pages",
    "Conectează GitHub sau folosește Direct Upload",
    "Setează build command: npm run build",
    "Setează output directory: dist",
    "Adaugă variabilele necesare pentru frontend dacă apar în proiect",
    "Deploy pe HTTPS și testează PWA Install"
  ];

  const packages = [
    {
      name: "Website PWA",
      platform: "Android / PC / Tablet",
      status: "Disponibil",
      version: appVersion,
      description: "Instalează CineVerse direct din browser ca aplicație PWA.",
      command: "Browser → Menu → Add to Home Screen / Install app",
      action: "Instalează PWA"
    },
    {
      name: "Android APK",
      platform: "Android",
      status: "În pregătire",
      version: appVersion,
      description: "Pachet Android nativ prin Capacitor/TWA pentru instalare APK.",
      command: "npm run build && npx cap sync android && npx cap open android",
      action: "Pregătește APK"
    },
    {
      name: "PC Desktop",
      platform: "Windows / Linux / macOS",
      status: "În pregătire",
      version: appVersion,
      description: "Pachet desktop prin Electron sau Tauri.",
      command: "npm run build && npm run package:desktop",
      action: "Pregătește Desktop"
    },
    {
      name: "iOS PWA",
      platform: "iPhone / iPad",
      status: "Disponibil ca PWA",
      version: appVersion,
      description: "Pe iOS se instalează din Safari prin Add to Home Screen.",
      command: "Safari → Share → Add to Home Screen",
      action: "Instrucțiuni iOS"
    }
  ];

  return (
    <main>
      <section className="section">
        <h2><Download size={28} /> Download / Install Center</h2>
        <p>Instalează CineVerse pe Android, PC, tabletă și dispozitive compatibile.</p>

        <div className="downloadHero">
          <div>
            <span className="pill">CineVerse</span>
            <h3>Platform build</h3>
            <p>Versiune platformă: <strong>{appVersion}</strong></p>
            <p>Build: <strong>{buildVersion}</strong></p>
            <p>API: Cloudflare Worker + D1 + Algolia</p>
          </div>
        </div>

        {installStatus && (
          <div className="pwaInstallStatusBox">
            <strong>Status instalare PWA</strong>
            <p>{installStatus}</p>
          </div>
        )}

        <div className="downloadGrid">
          {packages.map((pkg) => (
            <article className="downloadCard" key={pkg.name}>
              <div className="downloadCardHeader">
                <div>
                  <h3>{pkg.name}</h3>
                  <p>{pkg.platform}</p>
                </div>
                <span className={pkg.status.includes("Disponibil") ? "statusOk" : "statusPending"}>
                  {pkg.status}
                </span>
              </div>

              <p>{pkg.description}</p>

              <div className="packageMeta">
                <span>Versiune: {pkg.version}</span>
                <span>Build: {buildVersion}</span>
              </div>

              <pre>{pkg.command}</pre>

              <button
                onClick={() => {
                  if (pkg.name === "Website PWA") {
                    installPwaNow();
                    return;
                  }

                  if (pkg.name === "iOS PWA") {
                    alert("Pe iPhone/iPad: deschide în Safari → Share → Add to Home Screen.");
                    return;
                  }

                  alert("Pachetul " + pkg.name + " este în pregătire. Vom adăuga build automat în următorii pași.");
                }}
              >
                {pkg.action}
              </button>
            </article>
          ))}
        </div>

        <div className="details">
          <div>
            <h3>PWA Manifest + Service Worker Check</h3>
            <p>Verifică automat dacă aplicația este pregătită pentru instalare PWA.</p>

            <div className="readinessGrid">
              {pwaChecks.length === 0 ? (
                <div className="readinessItem pending">
                  <strong>Verificare</strong>
                  <span>Se verifică...</span>
                </div>
              ) : (
                pwaChecks.map((item) => (
                  <div className={`readinessItem ${item.type}`} key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.status}</span>
                  </div>
                ))
              )}
            </div>

            <div className="row">
              <button type="button" onClick={runPwaChecks}>Reverifică PWA</button>
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Deploy Assistant Panel</h3>
            <p>Status rapid pentru publicarea frontend-ului CineVerse.</p>

            <div className="readinessGrid">
              <div className="readinessItem ok">
                <strong>Build command</strong>
                <span>{CINEVERSE_DEPLOY_INFO.buildCommand}</span>
              </div>
              <div className="readinessItem ok">
                <strong>Output directory</strong>
                <span>{CINEVERSE_DEPLOY_INFO.outputDirectory}</span>
              </div>
              <div className="readinessItem ok">
                <strong>Production build</strong>
                <span>{CINEVERSE_DEPLOY_INFO.productionBuild}</span>
              </div>
              <div className="readinessItem ok">
                <strong>Deploy target</strong>
                <span>{CINEVERSE_DEPLOY_INFO.deployTarget}</span>
              </div>
            </div>

            <div className="deployCommandBox">
              <strong>Ultimul backup complet</strong>
              <pre>{CINEVERSE_DEPLOY_INFO.latestBackup}</pre>

              <strong>Public deploy URL</strong>
              <pre>{CINEVERSE_DEPLOY_INFO.publicUrl}</pre>

              <div className="row">
                <button type="button" onClick={() => window.open(CINEVERSE_DEPLOY_INFO.publicUrl, "_blank")}>
                  Open public app
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => navigator.clipboard?.writeText(CINEVERSE_DEPLOY_INFO.publicUrl)}
                >
                  Copy deploy URL
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Public App Health Panel</h3>
            <p>Verifică rapid aplicația publică, API-ul, Algolia și PWA.</p>

            <div className="readinessGrid">
              {publicHealth.length === 0 ? (
                <div className="readinessItem pending">
                  <strong>Health check</strong>
                  <span>Se verifică...</span>
                </div>
              ) : (
                publicHealth.map((item) => (
                  <div className={`readinessItem ${item.type}`} key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.status}</span>
                  </div>
                ))
              )}
            </div>

            <div className="row">
              <button type="button" onClick={runPublicHealthCheck}>Reverifică health</button>
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Public API Diagnostics Panel</h3>
            <p>Testează endpoint-urile principale ale API-ului public.</p>

            <div className="readinessGrid">
              {apiDiagnostics.length === 0 ? (
                <div className="readinessItem pending">
                  <strong>API diagnostics</strong>
                  <span>Se verifică...</span>
                </div>
              ) : (
                apiDiagnostics.map((item) => (
                  <div className={`readinessItem ${item.type}`} key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.status}</span>
                    <small>{item.path}</small>
                  </div>
                ))
              )}
            </div>

            <div className="row">
              <button type="button" onClick={runApiDiagnostics}>Reverifică API</button>
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Cloudflare Pages Direct Upload Guide</h3>
            <p>Publicare fără GitHub: generezi folderul dist și îl urci direct în Cloudflare Pages.</p>

            <div className="deployCommandBox">
              <strong>Comandă build</strong>
              <pre>npm run build</pre>
              <strong>Folder de upload</strong>
              <pre>dist</pre>
            </div>

            <div className="changelogBox">
              <h4>Pași Direct Upload</h4>
              <ol>
                {directUploadSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Cloudflare Pages Deploy Center</h3>
            <p>Publică frontend-ul pe HTTPS ca PWA-ul să poată fi instalat mai bine pe telefon.</p>

            <div className="deployCommandBox">
              <strong>Build local</strong>
              <pre>npm run build</pre>
              <strong>Output directory</strong>
              <pre>dist</pre>
            </div>

            <div className="changelogBox">
              <h4>Pași deploy Cloudflare Pages</h4>
              <ol>
                {deploySteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Install Readiness Checklist</h3>
            <p>Verificare rapidă pentru instalare pe dispozitive.</p>
            <div className="readinessGrid">
              {CINEVERSE_INSTALL_CHECKLIST.map((item) => (
                <div className={`readinessItem ${item.type}`} key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Ce include build-ul curent</h3>
            <ul>
              {CINEVERSE_CHANGELOG.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="details">
          <div>
            <h3>Roadmap pachete</h3>
            <p>De fiecare dată când dezvoltăm platforma, actualizăm și centrul de instalare: versiune, build, platforme și comenzi.</p>
            <ul>
              <li>PWA: instalare directă din browser</li>
              <li>Android: APK cu Capacitor/TWA</li>
              <li>Desktop: Windows/Linux/macOS cu Electron/Tauri</li>
              <li>iOS: PWA prin Safari</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminPage({ movies, uploads, addMovie, deleteMovie, syncUploadsToAlgolia, lastAlgoliaSync, adminAlgoliaMessage, setAdminAlgoliaMessage }) {
  return (
    <main>
      <section className="section admin">
        <AdminMetadataSearch />

        <div className="details">
          <div>
            <span className="pill">Packages</span>
            <h3>Package Version Manager</h3>
            <p>Versiunea curentă a platformei și statusul pachetelor de instalare.</p>

            <div className="stats">
              <div><strong>{CINEVERSE_VERSION}</strong><span>Versiune</span></div>
              <div><strong>{CINEVERSE_BUILD}</strong><span>Build</span></div>
              <div><strong>ON</strong><span>PWA</span></div>
            </div>

            <div className="packageMeta">
              <span>PWA: Disponibil</span>
              <span>Android APK: În pregătire</span>
              <span>Desktop: În pregătire</span>
              <span>iOS PWA: Disponibil</span>
            </div>

            <div className="changelogBox">
              <h4>Admin Deploy Assistant</h4>
              <ul>
                <li>Build command: {CINEVERSE_DEPLOY_INFO.buildCommand}</li>
                <li>Output directory: {CINEVERSE_DEPLOY_INFO.outputDirectory}</li>
                <li>Production build: {CINEVERSE_DEPLOY_INFO.productionBuild}</li>
                <li>Deploy target: {CINEVERSE_DEPLOY_INFO.deployTarget}</li>
                <li>Backup: {CINEVERSE_DEPLOY_INFO.latestBackup}</li>
                <li>Public URL: {CINEVERSE_DEPLOY_INFO.publicUrl}</li>
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Admin API Diagnostics</h4>
              <ul>
                <li>/health: verificat în Download</li>
                <li>/uploads: verificat în Download</li>
                <li>/search?q=Avatar: verificat în Download</li>
                <li>/search-metadata?q=Avatar: verificat în Download</li>
                <li>/anime?q=Naruto: verificat în Download</li>
                <li>/sport?q=Barcelona: verificat în Download</li>
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Admin Public App Health</h4>
              <ul>
                <li>Public URL: {CINEVERSE_DEPLOY_INFO.publicUrl}</li>
                <li>API: Cloudflare Worker conectat</li>
                <li>Algolia: search activ</li>
                <li>PWA: manifest + service worker verificate în Download</li>
                <li>Status deploy: Publicat</li>
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Admin Direct Upload Guide</h4>
              <ul>
                <li>Rulează: npm run build</li>
                <li>Folder rezultat: dist</li>
                <li>Cloudflare Pages: Create application → Pages → Direct Upload</li>
                <li>Încarcă folderul dist și apasă Deploy</li>
                <li>Testează URL-ul HTTPS generat.</li>
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Admin Cloudflare Pages Deploy</h4>
              <ul>
                <li>Build command: npm run build</li>
                <li>Output directory: dist</li>
                <li>Deploy target: Cloudflare Pages HTTPS</li>
                <li>PWA install prompt funcționează mai bine după HTTPS deploy.</li>
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Admin Install Readiness</h4>
              <ul>
                {CINEVERSE_INSTALL_CHECKLIST.map((item) => (
                  <li key={item.label}>{item.label}: {item.status}</li>
                ))}
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Build Changelog Panel</h4>
              <ul>
                {CINEVERSE_CHANGELOG.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <h2><Shield size={24} /> Admin Cloudflare</h2>
        <div className="stats">
          <div><strong>{movies.length}</strong><span>Filme</span></div>
          <div><strong>{uploads.length}</strong><span>Upload-uri</span></div>
          <div><strong>ON</strong><span>D1</span></div>
        </div>

        <div className="details">
          <div>
            <span className="pill">Algolia</span>
            <h3>Algolia Status Panel</h3>
            <p>Indexează toate upload-urile din Cloudflare D1 în Algolia uploads și verifică statusul ultimului sync.</p>

            <div className="stats">
              <div><strong>{uploads.length}</strong><span>Upload-uri locale</span></div>
              <div><strong>{lastAlgoliaSync?.synced ?? "-"}</strong><span>Ultimul sync</span></div>
              <div><strong>{lastAlgoliaSync?.failed ?? "-"}</strong><span>Eșuate</span></div>
            </div>

            {lastAlgoliaSync && (
              <p>
                Ultimul sync: {lastAlgoliaSync.synced}/{lastAlgoliaSync.total} sincronizate.
              </p>
            )}

            {adminAlgoliaMessage && (
              <div className={`adminStatusCard ${adminAlgoliaMessage.type}`}>
                <strong>{adminAlgoliaMessage.title}</strong>
                <p>{adminAlgoliaMessage.text}</p>
                <span>Ultima acțiune: {adminAlgoliaMessage.time}</span>
              </div>
            )}

            <div className="row">
              <button onClick={syncUploadsToAlgolia}>Sync uploads to Algolia</button>
              <button
                className="secondary"
                onClick={async () => {
                  try {
                    const result = await apiGet("/search?q=Avatar");
                    setAdminAlgoliaMessage({
                      type: (result.hits?.length || 0) > 0 ? "success" : "warning",
                      title: "Test Algolia Avatar",
                      text:
                        "Hits: " + (result.hits?.length || 0) +
                        " · Uploads: " + (result.uploads?.length || 0) +
                        " · Movies: " + (result.movies?.length || 0),
                      time: new Date().toLocaleTimeString()
                    });
                  } catch (error) {
                    console.error(error);
                    setAdminAlgoliaMessage({
                      type: "danger",
                      title: "Test Algolia a eșuat",
                      text: "Nu s-a putut verifica search?q=Avatar.",
                      time: new Date().toLocaleTimeString()
                    });
                  }
                }}
              >
                Test search Avatar
              </button>
            </div>
          </div>
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
