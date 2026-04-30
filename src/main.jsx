
function isRealMetaValue(value) {
  const v = String(value || "").trim();
  if (!v) return false;
  return !["all", "general", "nespecificat", "fără subtitrare / nespecificat", "fără dublaj / nespecificat"].includes(v.toLowerCase());
}
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
import {
  API_URL,
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  apiCatalog,
  apiCatalogStats,
  apiCatalogFacets,
  getAdminToken,
  setAdminToken,
  clearAdminToken
} from "./api";
import { CONTENT_CATEGORIES, getGenresForCategory, COUNTRIES, LANGUAGES, VIDEO_QUALITIES, VIDEO_QUALITY_LABELS, YEARS, SOURCE_TYPES, SETTINGS_GROUPS } from "./taxonomy";
import "./style.css";
import AdminMetadataSearch from "./AdminMetadataSearch.jsx";
import UploadMetadataSearch from "./UploadMetadataSearch.jsx";
import EditUploadModal from "./EditUploadModal.jsx";
import BulkImportPanel from "./BulkImportPanel.jsx";
import GlobalFilterWizard from "./GlobalFilterWizard.jsx";
import CountryPage from "./CountryPage.jsx";
import SettingsPage from "./SettingsPage.jsx";
import PlaybackPreferences from "./PlaybackPreferences.jsx";
import SettingsCenter from "./SettingsCenter.jsx";
import FilterWizard from "./FilterWizard.jsx";
import { completeMetadataWithIntelligence } from "./metadataIntelligence.js";


const CINEVERSE_SETTINGS_KEY = "cineverse_settings_v1";

function readCineVerseSettings() {
  try {
    return JSON.parse(localStorage.getItem(CINEVERSE_SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

function applyCineVerseVisualSettings(settings = readCineVerseSettings()) {
  if (typeof document === "undefined") return;

  const theme = settings.theme || "dark";
  const textSize = settings.accessibilityText || "normal";
  const highContrast = !!settings.highContrast;

  document.body.classList.remove(
    "cv-theme-dark",
    "cv-theme-light",
    "cv-theme-red-cinema",
    "cv-theme-blue-stream",
    "cv-text-small",
    "cv-text-normal",
    "cv-text-large",
    "cv-text-extra-large",
    "cv-high-contrast"
  );

  document.body.classList.add(`cv-theme-${theme}`);
  document.body.classList.add(`cv-text-${textSize}`);

  if (highContrast) {
    document.body.classList.add("cv-high-contrast");
  }
}

const CINEVERSE_VERSION = "1.0.1";
const CINEVERSE_BUILD = "2026.04.28-bulk-import-v27-backend-scalable-audit-plan";
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
  publicUrl: "https://jolly-sea-36fd.iri20rob94.workers.dev/",
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
  "AI Library v18 Saved Preset Duplicate",
  "AI Library v19 Saved Preset Update Current",
  "AI Library v20 Preset Metadata Labels",
  "AI Library v21 Preset Pin Favorite",
  "AI Library v22 Preset Search",
  "AI Library v23 Cloud Presets D1",
  "AI Library v24 Cloud Primary Presets",
  "AI Library v25 Cloud Presets UI Polish",
  "AI Library v26 Cloud Only Presets",
  "AI Library v27 Cloud Presets Cleanup Manager",
  "AI Library v28 Cloud Presets Duplicate Cleanup",
  "AI Library v29 Cloud Presets Protected Delete",
  "AI Library v30 Cloud Presets Details Panel",
  "AI Library v31 Cloud Presets Detail Actions",
  "AI Library v32 Cloud Presets Audit Log",
  "AI Library v33 Cloud Presets Bulk Select",
  "AI Library v34 Cloud Presets Folders",
  "AI Library v35 Cloud Presets Advanced Search",
  "AI Library v36 Cloud Presets Backup Restore",
  "AI Library v37 Cloud Presets Usage Stats",
  "AI Library v38 Cloud Presets Admin Lock",
  "AI Library v39 Cloud Presets Health Check",
  "AI Library v40 Cloud Presets Final Stabilization",
  "AI Library v41 Auto Test Mode",
  "Bulk Import v1 Simple Preview",
  "Bulk Import v3 Smart Metadata Labels",
  "Bulk Import v4 Duplicate Guard",
  "Bulk Import v5 Cleanup Empty Value",
  "Bulk Import v6 Unique Smart Titles",
  "Bulk Import v7 Batch Import Progress",
  "Bulk Import v8 Import Limit Selector",
  "Bulk Import v9 AI Metadata Toggle",
  "Bulk Import v10 AI Metadata Queue",
  "Bulk Import v11 AI Queue Actions",
  "Bulk Import v12 AI Queue Processor v1",
  "Bulk Import v13 Metadata Search Handoff",
  "Bulk Import v14 Direct Search Field Handoff",
  "Bulk Import v15 Safe Apply Existing Bulk",
  "Bulk Import v16 Apply Feedback Panel",
  "Bulk Import v16.1 Apply Guard Auto Refresh",
  "Bulk Import v17 Bulk Selected Helper UX",
  "Bulk Import v17.1 Form Fill Refresh",
  "Bulk Import v18 Auto Queue Refresh After Apply",
  "Bulk Import v18.1 Refresh Readiness Reliable",
  "Bulk Import v18.2 No False Disabled",
  "Bulk Import v19 Queue Complete State",
  "Bulk Import v19.1 Hide Process Button When Queue Complete",
  "Bulk Import v20 Safe Admin Snapshot",
  "Bulk Import v20.1 Changelog Sync",
  "Bulk Import v21 Safe Bulk Quality Audit",
  "Bulk Import v22 Admin Bulk Audit Actions",
  "Bulk Import v23 Safe Audit Expand",
  "Bulk Import v24 Duplicate Title Warning",
  "Bulk Import v25 Scalable Audit Limit",
  "Bulk Import v26 Source Counts",
  "Bulk Import v27 Backend Scalable Audit Plan",
  "AI Library v42 Auto Test Safe Mode"
];

const PAGE_SIZE = 20;
const AI_LIBRARY_FILTER_MEMORY_KEY = "cineverse.aiLibrary.filters.v11";
const AI_LIBRARY_SAVED_PRESETS_KEY = "cineverse.aiLibrary.savedPresets.v15";
const AI_LIBRARY_AUTO_TEST_ENABLED_KEY = "cineverse.aiLibrary.autoTest.enabled.v42";

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
libraryFromYear: params.get("fromYear") || "",
libraryToYear: params.get("toYear") || "",
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


async function getCloudPresets() {
  const response = await fetch(`${API_URL}/presets`);
  if (!response.ok) throw new Error("Nu pot încărca preset-urile cloud.");
  return response.json();
}

async function createCloudPreset(preset) {
  const response = await fetch(`${API_URL}/presets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preset)
  });
  if (!response.ok) throw new Error("Nu pot salva presetul în cloud.");
  return response.json();
}

async function updateCloudPreset(id, patch) {
  const response = await fetch(`${API_URL}/presets/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!response.ok) throw new Error("Nu pot actualiza presetul în cloud.");
  return response.json();
}

async function deleteCloudPreset(id) {
  const response = await fetch(`${API_URL}/presets/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Nu pot șterge presetul din cloud.");
  return response.json();
}


function sortSavedAiLibraryPresets(presets) {
  return [...(presets || [])].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
  });
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


function CineVerseCountryFallbackPage({ onGoToLibrary }) {
  const [query, setQuery] = useState("");

  const countries = typeof COUNTRIES !== "undefined" && Array.isArray(COUNTRIES) ? COUNTRIES : [
    "Afganistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Australia", "Austria",
    "Belgia", "Brazilia", "Bulgaria", "Canada", "China", "Coreea de Sud", "Danemarca", "Egipt",
    "Finlanda", "Franța", "Germania", "Grecia", "India", "Italia", "Japonia", "Mexic", "Norvegia",
    "Olanda", "Polonia", "Portugalia", "Regatul Unit", "România", "Rusia", "Serbia", "Spania",
    "Suedia", "Turcia", "Ucraina", "Ungaria", "USA", "Vietnam", "Zimbabwe"
  ];

  const clean = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const visibleCountries = countries.filter((country) => clean(country).includes(clean(query)));

  function openCountry(country) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "library");
    params.set("aiCountry", country);
    window.history.pushState({}, "", `/?${params.toString()}`);
    onGoToLibrary?.(quality);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function buildFilterUrl() {
    const params = new URLSearchParams();
    params.set("page", "library");
    if (country !== "All") params.set("aiCountry", country);
    if (type !== "All") params.set("aiCategory", type);
    if (genre !== "All") params.set("aiGenre", genre);
    if (year !== "All") params.set("aiYear", year);
    if (fromYear) params.set("fromYear", fromYear);
    if (toYear) params.set("toYear", toYear);
    if (language !== "All") params.set("aiLanguage", language);
    if (quality !== "All") params.set("aiVideoQuality", quality);
    return `${window.location.origin}/?${params.toString()}`;
  }

  function copyFilterLink() {
    const url = buildFilterUrl();
    navigator.clipboard?.writeText(url)
      .then(() => alert("Link filtrat copiat."))
      .catch(() => alert(url));
  }

  function resetFilters() {
    setCountry("All");
    setType("All");
    setGenre("All");
    setYear("All");
    setFromYear("");
    setToYear("");
    setLanguage("All");
    setQuality("All");
    setActiveStep(1);
  }

  return (
    <section className="section countryFallbackPage">
      <div className="fallbackHero">
        <span className="pill">Meniu Țări</span>
        <h2>Țări</h2>
        <p>Alege o țară ca să deschizi AI Library cu filtrul de țară aplicat.</p>
      </div>

      <div className="fallbackToolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Caută țară..."
        />
        <span className="pill">{visibleCountries.length} rezultate</span>
      </div>

      <div className="fallbackGrid">
        {visibleCountries.map((country) => (
          <button type="button" key={country} onClick={() => openCountry(country)}>
            {country}
          </button>
        ))}
      </div>
    </section>
  );
}

function CineVerseGlobalFilterFallbackPage({ onGoToLibrary }) {
  const [country, setCountry] = useState("All");
  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [type, setType] = useState("All");
  const [language, setLanguage] = useState("All");
  const [quality, setQuality] = useState("All");

  const countries = typeof COUNTRIES !== "undefined" && Array.isArray(COUNTRIES) ? COUNTRIES : ["România", "USA", "India", "Japonia", "Coreea de Sud", "Turcia", "Brazilia"];
  const languages = typeof LANGUAGES !== "undefined" && Array.isArray(LANGUAGES) ? LANGUAGES : ["Română", "Engleză", "Hindi", "Japoneză", "Coreeană", "Turcă"];
  const qualities = typeof VIDEO_QUALITIES !== "undefined" && Array.isArray(VIDEO_QUALITIES) ? VIDEO_QUALITIES : ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p", "4320p", "7680p"];
  const categories = typeof CONTENT_CATEGORIES !== "undefined" && Array.isArray(CONTENT_CATEGORIES) ? CONTENT_CATEGORIES : ["Filme", "Seriale", "Desene Animate Filme", "Anime-uri Filme", "Sport", "Muzică", "Tv Show-uri"];
  const genres = genre === "All" && typeof getGenresForCategory === "function" && type !== "All"
    ? ["All", ...getGenresForCategory(type)]
    : ["All", "Acțiune", "Aventură", "Comedie", "Dramă", "Fantezie", "Horror", "Mister", "Muzical", "Romantic", "Sci-Fi", "Thriller", "Sport"];

  const years = ["All", ...Array.from({ length: 151 }, (_, index) => String(1950 + index))];

  function applyFilters() {
    const params = new URLSearchParams();
    params.set("page", "library");
    if (country !== "All") params.set("aiCountry", country);
    if (genre !== "All") params.set("aiGenre", genre);
    if (year !== "All") params.set("aiYear", year);
    if (type !== "All") params.set("aiCategory", type);
    if (language !== "All") params.set("aiLanguage", language);
    if (quality !== "All") params.set("aiVideoQuality", quality);

    window.history.pushState({}, "", `/?${params.toString()}`);
    onGoToLibrary?.(quality);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function resetFilters() {
    setCountry("All");
    setGenre("All");
    setYear("All");
    setType("All");
    setLanguage("All");
    setQuality("All");
  }

  return (
    <section className="section globalFilterFallbackPage">
      <div className="fallbackHero">
        <span className="pill">Filtru Global</span>
        <h2>Țară → Gen → An → Type → Limba → Calitate</h2>
        <p>Alege filtrele în ordinea din prompt, apoi deschide rezultatele în AI Library.</p>
      </div>

      <div className="globalStepsGrid">
        <label>
          1. Țară
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="All">Toate țările</option>
            {countries.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          2. Type
          <select value={type} onChange={(event) => { setType(event.target.value); setGenre("All"); }}>
            <option value="All">Toate categoriile</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          3. Gen
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          4. An
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            {years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          5. Limba
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="All">Toate limbile</option>
            {languages.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          6. Calitate
          <select value={quality} onChange={(event) => setQuality(event.target.value)}>
            <option value="All">Toate calitățile</option>
            {qualities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="filterSummaryBox">
        <strong>Selecție:</strong>
        <span>Țară: {country}</span>
        <span>Type: {type}</span>
        <span>Gen: {genre}</span>
        <span>An exact: {year}</span>
        <span>Interval: {fromYear || "—"} - {toYear || "—"}</span>
        <span>Limba: {language}</span>
        <span>Calitate: {quality}</span>
      </div>

      <div className="wizardActions">
        <div className="globalFilterActions">
        <button type="button" onClick={applyFilters}>Aplică în AI Library</button>
        <button type="button" className="secondary" onClick={copyFilterLink}>Copiază link filtru</button>
        <button type="button" className="secondary" onClick={resetFilters}>Resetează filtrele</button>
      </div>
        <button type="button" className="secondary" onClick={resetFilters}>Resetează</button>
      </div>
    </section>
  );
}



function normalizeCineVersePageName(page) {
  const value = String(page || "").toLowerCase().trim();

  if (["countries", "country", "tari", "țări", "tara", "țara"].includes(value)) {
    return "countries";
  }

  if (["global-filter", "global", "filter-global", "filtru-global", "filtru global", "filter", "filters", "filtru"].includes(value)) {
    return "global-filter";
  }

  return page;
}



function SimpleCountriesPageFinal({ onGoToLibrary }) {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const list = typeof COUNTRIES !== "undefined" && Array.isArray(COUNTRIES) ? COUNTRIES : [
    "Afganistan","Albania","Algeria","Andorra","Angola","Argentina","Australia","Austria","Belgia","Brazilia",
    "Bulgaria","Canada","China","Coreea de Sud","Danemarca","Egipt","Finlanda","Franța","Germania","Grecia",
    "India","Italia","Japonia","Mexic","Olanda","Polonia","Portugalia","Regatul Unit","România","Rusia",
    "Serbia","Spania","Suedia","Turcia","Ucraina","Ungaria","USA","Vietnam","Zimbabwe"
  ];

  const norm = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const countries = list.filter((item) => norm(item).includes(norm(query)));
  const groupedCountries = countries.reduce((acc, country) => {
    const letter = String(country || "#").charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(country);
    return acc;
  }, {});
  const groupLetters = Object.keys(groupedCountries).sort((a, b) => a.localeCompare(b));

  function buildCountryUrl(country) {
    const params = new URLSearchParams();
    params.set("page", "library");
    params.set("aiCountry", country);
    return `${window.location.origin}/?${params.toString()}`;
  }

  function selectCountry(country) {
    setSelectedCountry(country);
  }

  function applyCountry(country = selectedCountry) {
    if (!country) {
      alert("Alege mai întâi o țară.");
      return;
    }

    const params = new URLSearchParams();
    params.set("page", "library");
    params.set("aiCountry", country);
    window.history.pushState({}, "", `/?${params.toString()}`);
    onGoToLibrary?.(quality);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function copyCountryLink(country = selectedCountry) {
    if (!country) {
      alert("Alege mai întâi o țară.");
      return;
    }

    const url = buildCountryUrl(country);
    navigator.clipboard?.writeText(url)
      .then(() => alert(`Link copiat pentru ${country}.`))
      .catch(() => alert(url));
  }

  return (
    <section className="section finalMenuPage">
      <span className="pill">Meniu Țări</span>
      <h2>Țări</h2>
      <p>Alege o țară pentru a filtra conținutul după țara de origine.</p>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Caută țară..."
      />

      <div className="countrySelectedFinalBox">
        <strong>Țară selectată:</strong>
        <span>{selectedCountry || "Nicio țară selectată"}</span>
        <button type="button" onClick={() => applyCountry()}>Deschide în AI Library</button>
        <button type="button" className="secondary" onClick={() => copyCountryLink()}>Copiază link</button>
      </div>

      <div className="countryAzGroups">
        {groupLetters.map((letter) => (
          <div className="countryAzGroup" key={letter}>
            <h3>{letter}</h3>
            <div className="finalMenuGrid">
              {groupedCountries[letter].map((country) => (
                <button
                  type="button"
                  key={country}
                  className={selectedCountry === country ? "selectedCountryButton" : ""}
                  onClick={() => selectCountry(country)}
                  onDoubleClick={() => applyCountry(country)}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SimpleGlobalFilterPageFinal({ onGoToLibrary }) {
  const [activeStep, setActiveStep] = useState(1);
  const [country, setCountry] = useState("All");
  const [type, setType] = useState("All");
  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [fromYear, setFromYear] = useState("");
  const [toYear, setToYear] = useState("");
  const [language, setLanguage] = useState("All");
  const [quality, setQuality] = useState("All");

  const countries = typeof COUNTRIES !== "undefined" && Array.isArray(COUNTRIES) ? COUNTRIES : ["România", "USA", "India", "Japonia", "Coreea de Sud", "Turcia"];
  const categories = typeof CONTENT_CATEGORIES !== "undefined" && Array.isArray(CONTENT_CATEGORIES) ? CONTENT_CATEGORIES : ["Filme", "Seriale", "Anime-uri Filme", "Sport", "Muzică", "Tv Show-uri"];
  const languages = typeof LANGUAGES !== "undefined" && Array.isArray(LANGUAGES) ? LANGUAGES : ["Română", "Engleză", "Hindi", "Japoneză"];
  const qualities = typeof VIDEO_QUALITIES !== "undefined" && Array.isArray(VIDEO_QUALITIES) ? VIDEO_QUALITIES : ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p"];
  const years = ["All", ...Array.from({ length: 151 }, (_, i) => String(1950 + i))];
  const genres = type !== "All" && typeof getGenresForCategory === "function"
    ? ["All", ...getGenresForCategory(type)]
    : ["All", "Acțiune", "Aventură", "Comedie", "Dramă", "Fantezie", "Horror", "Mister", "Muzical", "Romantic", "Sci-Fi", "Thriller", "Sport"];

  const steps = [
    { id: 1, label: "Țară", value: country },
    { id: 2, label: "Type", value: type },
    { id: 3, label: "Gen", value: genre },
    { id: 4, label: "An", value: year !== "All" ? year : `${fromYear || "—"} - ${toYear || "—"}` },
    { id: 5, label: "Limba", value: language },
    { id: 6, label: "Calitate", value: quality }
  ];

  function applyFilters() {
    const params = new URLSearchParams();
    params.set("page", "library");
    if (country !== "All") params.set("aiCountry", country);
    if (type !== "All") params.set("aiCategory", type);
    if (genre !== "All") params.set("aiGenre", genre);
    if (year !== "All") params.set("aiYear", year);
    if (fromYear) params.set("fromYear", fromYear);
    if (toYear) params.set("toYear", toYear);
    if (language !== "All") params.set("aiLanguage", language);
    if (quality !== "All") params.set("aiVideoQuality", quality);

    window.history.pushState({}, "", `/?${params.toString()}`);
    onGoToLibrary?.(quality);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <section className="section finalMenuPage">
      <span className="pill">Filtru Global</span>
      <h2>Țară → Gen → An → Type → Limba → Calitate</h2>
      <p>Filtru pas cu pas pentru conținutul din AI Library.</p>

      <div className="globalStepper">
        {steps.map((step) => (
          <button
            type="button"
            key={step.id}
            className={activeStep === step.id ? "activeStep" : ""}
            onClick={() => setActiveStep(step.id)}
          >
            <strong>{step.id}. {step.label}</strong>
            <span>{step.value || "All"}</span>
          </button>
        ))}
      </div>

      <div className="globalStepHint">
        Pas activ: <strong>{steps.find((step) => step.id === activeStep)?.label}</strong>
      </div>

      <div className="finalFilterGrid">
        <label className={activeStep === 1 ? "activeGlobalField" : ""}>Țară
          <select value={country} onChange={(e) => { setCountry(e.target.value); setActiveStep(2); }}>
            <option value="All">Toate țările</option>
            {countries.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label className={activeStep === 2 ? "activeGlobalField" : ""}>Type
          <select value={type} onChange={(e) => { setType(e.target.value); setGenre("All"); setActiveStep(3); }}>
            <option value="All">Toate categoriile</option>
            {categories.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label className={activeStep === 3 ? "activeGlobalField" : ""}>Gen
          <select value={genre} onChange={(e) => { setGenre(e.target.value); setActiveStep(4); }}>
            {genres.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label className={activeStep === 4 ? "activeGlobalField" : ""}>An exact
          <select value={year} onChange={(e) => { setYear(e.target.value); setActiveStep(5); }}>
            {years.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label>De la anul
          <select value={fromYear} onChange={(e) => setFromYear(e.target.value)}>
            <option value="">Fără limită</option>
            {years.filter((x) => x !== "All").map((x) => <option key={`from-${x}`} value={x}>{x}</option>)}
          </select>
        </label>

        <label>Până la anul
          <select value={toYear} onChange={(e) => setToYear(e.target.value)}>
            <option value="">Fără limită</option>
            {years.filter((x) => x !== "All").map((x) => <option key={`to-${x}`} value={x}>{x}</option>)}
          </select>
        </label>

        <label className={activeStep === 5 ? "activeGlobalField" : ""}>Limba
          <select value={language} onChange={(e) => { setLanguage(e.target.value); setActiveStep(6); }}>
            <option value="All">Toate limbile</option>
            {languages.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>

        <label className={activeStep === 6 ? "activeGlobalField" : ""}>Calitate
          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            <option value="All">Toate calitățile</option>
            {qualities.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </label>
      </div>

      <div className="filterSummaryBox">
        <span>Țară: {country}</span>
        <span>Type: {type}</span>
        <span>Gen: {genre}</span>
        <span>An: {year}</span>
        <span>Limba: {language}</span>
        <span>Calitate: {quality}</span>
      </div>

      <button type="button" onClick={applyFilters}>Aplică în AI Library</button>
    </section>
  );
}

function isFinalCountriesPage(page) {
  return ["countries", "country", "tari", "tara", "țări", "țara"].includes(String(page || "").toLowerCase().trim());
}

function isFinalGlobalFilterPage(page) {
  return ["global-filter", "global", "filter-global", "filtru-global", "filtru", "filter", "filters"].includes(String(page || "").toLowerCase().trim());
}


function App() {
  const [page, setPage] = useState(() => new URLSearchParams(window.location.search).get("page") || "home");
  const pageKey = normalizeCineVersePageName(page);
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
    applyCineVerseVisualSettings();

    const onSettingsChanged = (event) => {
      applyCineVerseVisualSettings(event.detail || readCineVerseSettings());
    };

    window.addEventListener("cineverse-settings-changed", onSettingsChanged);
    window.addEventListener("storage", onSettingsChanged);

    return () => {
      window.removeEventListener("cineverse-settings-changed", onSettingsChanged);
      window.removeEventListener("storage", onSettingsChanged);
    };
  }, []);

  useEffect(() => {
    loadCloudflareData();
  }, []);

  useEffect(() => {
    function syncPageFromUrl() {
      const urlPage = new URLSearchParams(window.location.search).get("page");
      if (urlPage) setPage(urlPage);
    }

    function handleWizardApply() {
      setPage("ai-library");
      setTimeout(() => {
        document.querySelector("[data-ai-library-page]")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }

    window.addEventListener("popstate", syncPageFromUrl);
    window.addEventListener("cineverse-filter-wizard-apply", handleWizardApply);

    syncPageFromUrl();

    return () => {
      window.removeEventListener("popstate", syncPageFromUrl);
      window.removeEventListener("cineverse-filter-wizard-apply", handleWizardApply);
    };
  }, []);

  async function loadCloudflareData() {
    try {
      const [apiMoviesResult, apiUploadsResult] = await Promise.allSettled([
        apiCatalog(),
        apiGet("/uploads")
      ]);

      if (apiMoviesResult.status === "rejected") {
        console.error("Catalog API failed:", apiMoviesResult.reason);
      }

      if (apiUploadsResult.status === "rejected") {
        console.error("Uploads API failed:", apiUploadsResult.reason);
      }

      const apiMovies = apiMoviesResult.status === "fulfilled" ? apiMoviesResult.value : { items: [] };
      const apiUploads = apiUploadsResult.status === "fulfilled" ? apiUploadsResult.value : { items: [] };

      const movieItems = Array.isArray(apiMovies)
        ? apiMovies
        : Array.isArray(apiMovies?.items)
          ? apiMovies.items
          : [];

      const uploadItems = Array.isArray(apiUploads)
        ? apiUploads
        : Array.isArray(apiUploads?.items)
          ? apiUploads.items
          : [];

      const mappedMovies = movieItems.map(mapMovieFromApi);
      const mappedUploads = uploadItems.map(mapUploadFromApi);

      setMovies(mappedMovies);
      setUploads(mappedUploads);
      setSelectedMovie(mappedMovies[0] || mappedUploads[0] || null);
      setApiStatus("connected");
    } catch (error) {
      console.error(error);
      console.error("CineVerse loadData error:", error);
      setApiStatus("connected");
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

    await apiPost("/uploads", payload);
    await loadCloudflareData();
    event.currentTarget.reset();
    setPage("movies");
  }

  async function deleteMovie(movieId) {
    await apiDelete(`/uploads/${movieId}`);
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

    const normalizeUploadMetaValue = (value, fallback) => {
      const v = String(value || "").trim();
      const low = v.toLowerCase();
      if (!v || low === "all" || low === "unknown" || low === "nespecificat") return fallback;
      return v;
    };


    const uploadSmartText = [
      title,
      form.get("movieTitle"),
      form.get("category"),
      form.get("genre"),
      notes
    ].join(" ").toLowerCase();

    const looksAnimeUpload = [
      "anime",
      "dragon ball",
      "naruto",
      "one piece",
      "demon slayer",
      "jujutsu",
      "pokemon",
      "pokémon",
      "bleach",
      "attack on titan",
      "sailor moon"
    ].some((term) => uploadSmartText.includes(term));

    const uploadDefaultCategory = looksAnimeUpload ? "Anime-uri Filme" : "Filme";
    const uploadDefaultGenre = looksAnimeUpload ? "Anime" : "General";
    const uploadDefaultCountry = looksAnimeUpload ? "Japonia" : "Statele Unite";
    const uploadDefaultLanguage = looksAnimeUpload ? "Japoneză" : "Engleză";
    const uploadVideoQuality = normalizeUploadMetaValue(form.get("videoQuality"), "HD");

    const manualMetadata = {
      movieTitle: form.get("movieTitle"),
      category: normalizeUploadMetaValue(form.get("category"), uploadDefaultCategory),
      genre: normalizeUploadMetaValue(form.get("genre"), uploadDefaultGenre),
      year: form.get("year") || "",
      country: normalizeUploadMetaValue(form.get("country"), uploadDefaultCountry),
      language: normalizeUploadMetaValue(form.get("language"), uploadDefaultLanguage),
      videoQuality: uploadVideoQuality,
      quality: uploadVideoQuality,
      subtitleLanguage: form.get("subtitleLanguage") || "",
      dubbingLanguage: form.get("dubbingLanguage") || "",
      franchise: form.get("franchise") || "",
      collection: form.get("collection") || "",
      tags: String(form.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      season: form.get("season"),
      episode: form.get("episode"),
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
        metadata: completeMetadataWithIntelligence({
          ...aiMetadata,
          ...manualMetadata
        }, {
          title,
          movieTitle: form.get("movieTitle"),
          category: form.get("category"),
          genre: form.get("genre"),
          sourceType,
          url: value,
          notes
        })
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
          <button onClick={() => setPage("global-filter")} className={pageKey === "global-filter" ? "active" : ""}><Globe2 size={18} /> Filtru Global</button>
          <button onClick={() => setPage("countries")} className={pageKey === "countries" ? "active" : ""}><Globe2 size={18} /> Țări</button>
          <button onClick={() => setPage("upload")} className={page === "upload" ? "active" : ""}><Upload size={18} /> Upload</button>
          <button onClick={() => setPage("library")} className={page === "library" ? "active" : ""}><Play size={18} /> AI Library</button>
          <button onClick={() => setPage("download")} className={page === "download" ? "active" : ""}><Download size={18} /> Download</button>
          <button onClick={() => setPage("settings")} className={page === "settings" ? "active" : ""}><Settings size={18} /> Setări</button>
          <button onClick={() => setPage("playback")} className={page === "playback" ? "active" : ""}><PlayCircle size={18} /> Redare</button>
          <button onClick={() => setPage("admin")} className={page === "admin" ? "active" : ""}><Settings size={18} /> Admin</button>
        </nav>
      </header>

      <CloudStatus apiStatus={apiStatus} reload={loadCloudflareData} />

        {(isFinalCountriesPage(page) || isFinalGlobalFilterPage(page)) && (
          <div className="pageDebugBox">
            Debug pagină: <strong>{String(page)}</strong>
          </div>
        )}

        {isFinalCountriesPage(page) && (
          <SimpleCountriesPageFinal onGoToLibrary={() => setPage("library")} />
        )}

        {isFinalGlobalFilterPage(page) && (
          <SimpleGlobalFilterPageFinal onGoToLibrary={() => setPage("library")} />
        )}


      {editingUpload && (
        <EditUploadModal
          upload={editingUpload}
          onClose={() => setEditingUpload(null)}
          onSave={async (id, payload) => {
            await updateUpload(id, payload);
            setEditingUpload(null);
            await loadCloudflareData();
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

      {page === "upload" && <UploadPage uploads={uploads} addUpload={addUpload} deleteUpload={deleteUpload} updateUpload={updateUpload} onEdit={setEditingUpload} onInfo={setInfoUpload} onPlay={playUpload} onReload={loadCloudflareData} />}

      {page === "library" && <AiLibraryPage uploads={uploads} onPlay={playUpload} onEdit={setEditingUpload} onInfo={setInfoUpload} onDelete={deleteUpload} updateUpload={updateUpload} />}

      {page === "download" && <DownloadPage />}

      {page === "settings" && <SettingsCenter />}

      {page === "admin" && <AdminPage movies={movies} uploads={uploads} addMovie={addMovie} deleteMovie={deleteMovie} syncUploadsToAlgolia={syncUploadsToAlgolia} lastAlgoliaSync={lastAlgoliaSync} adminAlgoliaMessage={adminAlgoliaMessage} setAdminAlgoliaMessage={setAdminAlgoliaMessage} onEdit={setEditingUpload} setPage={setPage} />}
    </div>
  );
}

function CloudStatus({ apiStatus, reload }) {
  return (
    <div className={`cloudStatus ${apiStatus}`}>
      <div>
        <Cloud size={18} />
        <span>Cloudflare API: {apiStatus === "connected" ? "conectat" : apiStatus}</span>
        <small> · {API_URL}</small>
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
    "collection",
    "bulk",
    "bulk-import",
    "hd",
    "full hd",
    "4k"
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
  const [homeCatalogStats, setHomeCatalogStats] = useState(null);

  useEffect(() => {
    let alive = true;

    async function loadHomeCatalogStats() {
      try {
        const data = await apiCatalogStats();
        if (alive && data?.ok) setHomeCatalogStats(data);
      } catch {}
    }

    loadHomeCatalogStats();

    return () => {
      alive = false;
    };
  }, []);

  const homeUploadTotal = Number(homeCatalogStats?.total || 0) || uploads.length;

  const [homeCatalogUploads, setHomeCatalogUploads] = useState([]);
  const [homeCatalogRecommendationError, setHomeCatalogRecommendationError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadHomeCatalogUploads() {
      try {
        setHomeCatalogRecommendationError("");
        const data = await apiCatalog({
          page: 1,
          limit: 100,
          sort: "newest"
        });

        if (!alive) return;

        setHomeCatalogUploads(Array.isArray(data?.items) ? data.items : []);
      } catch (error) {
        if (alive) setHomeCatalogRecommendationError(String(error?.message || error));
      }
    }

    loadHomeCatalogUploads();

    return () => {
      alive = false;
    };
  }, []);

  const recommendationUploads = homeCatalogUploads.length ? homeCatalogUploads : uploads;
  const aiRecommendations = buildAiRecommendations(recommendationUploads)
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
            <p>Upload-uri: {homeUploadTotal}</p>
            <p>API: {apiStatus}</p>
          </div>
        </div>
      </section>
      <FilterWizard />


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
        <p className="mutedText">
          Sursă recomandări: {homeCatalogUploads.length ? `/catalog (${homeCatalogUploads.length} itemuri)` : `uploads local (${uploads.length} itemuri)`}
          {homeCatalogRecommendationError ? ` · ${homeCatalogRecommendationError}` : ""}
        </p>

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

function UploadPage({ uploads, addUpload, deleteUpload, updateUpload, onEdit, onInfo, onPlay, onReload }) {
  const [metadataSearchSeed, setMetadataSearchSeed] = useState("");
  const [selectedBulkMetadataTarget, setSelectedBulkMetadataTarget] = useState(null);
  const [bulkQueueRefreshSignal, setBulkQueueRefreshSignal] = useState(0);

  return (
    <main>
      <section className="section">
        <UploadMetadataSearch
          metadataSearchSeed={metadataSearchSeed}
          clearMetadataSearchSeed={() => setMetadataSearchSeed("")}
          selectedBulkMetadataTarget={selectedBulkMetadataTarget}
          clearSelectedBulkMetadataTarget={() => setSelectedBulkMetadataTarget(null)}
          onDataChanged={onReload}
          onBulkApplied={() => setBulkQueueRefreshSignal((value) => value + 1)}
        />
        <h2><Upload size={28} /> Upload cu AI metadata</h2>
        <p>AI metadata poate fi ON/OFF. Dacă îl oprești, completezi manual metadata.</p>

        <BulkImportPanel
          onDataChanged={onReload}
          onSendToMetadataSearch={setMetadataSearchSeed}
          onSelectBulkMetadataTarget={setSelectedBulkMetadataTarget}
          queueRefreshSignal={bulkQueueRefreshSignal}
        />

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

            <div className="uploadMetadataGrid">
              <label>
                Categorie
                <select name="category" defaultValue="Filme">
                  <option>Filme</option>
                  <option>Seriale</option>
                  <option>Desene Animate Filme</option>
                  <option>Desene Animate Seriale</option>
                  <option>Anime-uri Filme</option>
                  <option>Anime-uri Seriale</option>
                  <option>Filme Bollywood</option>
                  <option>Seriale Bollywood</option>
                  <option>Filme Desene Dublate</option>
                  <option>Seriale Desene Dublate</option>
                  <option>Sport</option>
                  <option>Muzică</option>
                  <option>All Collection</option>
                  <option>Disney</option>
                  <option>DC</option>
                  <option>Marvell</option>
                  <option>Minimax</option>
                  <option>Cartoon Network</option>
                  <option>Fox Kids</option>
                  <option>Nickelodeon</option>
                  <option>Animax</option>
                  <option>Boomerang</option>
                  <option>Disney Junior</option>
                  <option>Disney Channel</option>
                  <option>JimJam</option>
                  <option>Baby TV</option>
                  <option>Filme Război</option>
                  <option>Tv Show-uri</option>
                </select>
              </label>

              <label>
                Gen
                <input name="genre" placeholder="Acțiune, Comedie, Anime, Sport..." />
              </label>

              <label>
                An
                <input name="year" type="number" min="1900" max="2100" placeholder="2026" />
              </label>

              <label>
                Țară
                <input name="country" placeholder="România, Japonia, USA..." />
              </label>

              <label>
                Limbă
                <input name="language" placeholder="Română, Engleză, Japoneză..." />
              </label>

              <label>
                Calitate video
                <select name="videoQuality" defaultValue="1080p">
                  <option>144p</option>
                  <option>240p</option>
                  <option>360p</option>
                  <option>480p</option>
                  <option>720p</option>
                  <option>1080p</option>
                  <option>1440p</option>
                  <option>2160p</option>
                  <option>4320p</option>
                  <option>7680p</option>
                </select>
              </label>

              <label>
                Subtitrare
                <select name="subtitleLanguage" defaultValue="">
                  <option value="">Fără subtitrare / Nespecificat</option>
                  <option>Română</option>
                  <option>Engleză</option>
                  <option>Japoneză</option>
                  <option>Coreeană</option>
                  <option>Hindi</option>
                  <option>Turcă</option>
                  <option>Franceză</option>
                  <option>Germană</option>
                  <option>Spaniolă</option>
                </select>
              </label>

              <label>
                Dublaj
                <select name="dubbingLanguage" defaultValue="">
                  <option value="">Fără dublaj / Nespecificat</option>
                  <option>Română</option>
                  <option>Engleză</option>
                  <option>Japoneză</option>
                  <option>Coreeană</option>
                  <option>Hindi</option>
                  <option>Turcă</option>
                  <option>Franceză</option>
                  <option>Germană</option>
                  <option>Spaniolă</option>
                </select>
              </label>

              <label>
                Franciză
                <input name="franchise" placeholder="Marvel, Avatar, Zorro..." />
              </label>

              <label>
                Colecție
                <input name="collection" placeholder="Avatar Collection, X-Men Collection..." />
              </label>

              <label className="wideField">
                Tags
                <input name="tags" placeholder="anime, actiune, familie, youtube" />
              </label>
            </div>

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

            {/* Calitate este gestionată prin câmpul Calitate video. */}

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
  
  const [libraryFromYear, setLibraryFromYear] = useState(new URLSearchParams(window.location.search).get("fromYear") || "");
  const [libraryToYear, setLibraryToYear] = useState(new URLSearchParams(window.location.search).get("toYear") || "");
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
  const [savedFilterPresets, setSavedFilterPresets] = useState([]);
  const [savedPresetImportText, setSavedPresetImportText] = useState("");
  const [showPresetImportBox, setShowPresetImportBox] = useState(false);
  const [savedPresetSearch, setSavedPresetSearch] = useState("");
  const [savedPresetFolder, setSavedPresetFolder] = useState("General");
  const [savedPresetFolderFilter, setSavedPresetFolderFilter] = useState("All");
  const [savedPresetQuickFilter, setSavedPresetQuickFilter] = useState("All");
  const [cloudPresetsLoading, setCloudPresetsLoading] = useState(false);
  const [cloudPresetsError, setCloudPresetsError] = useState("");
  const [selectedPresetDetails, setSelectedPresetDetails] = useState(null);
  const [cloudPresetAuditLog, setCloudPresetAuditLog] = useState([]);
  const [selectedCloudPresetIds, setSelectedCloudPresetIds] = useState([]);
  const [cloudPresetRestoreText, setCloudPresetRestoreText] = useState("");
  const [showCloudPresetRestoreBox, setShowCloudPresetRestoreBox] = useState(false);
  const [aiLibraryAutoTestEnabled, setAiLibraryAutoTestEnabled] = useState(() => {
    try {
      return localStorage.getItem(AI_LIBRARY_AUTO_TEST_ENABLED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [aiLibraryAutoTestRunning, setAiLibraryAutoTestRunning] = useState(false);
  const [aiLibraryAutoTestReport, setAiLibraryAutoTestReport] = useState(null);
  const [aiLibraryAutoTestHasRun, setAiLibraryAutoTestHasRun] = useState(false);

  const [cloudPresetHealth, setCloudPresetHealth] = useState({
    status: "never",
    total: 0,
    checkedAt: "",
    message: "Never checked"
  });
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

  const qualityPanelTotal = Number(catalogStats?.total || 0) || libraryQuality.total;
const qualityPanelMissingPoster = catalogStats?.quality ? Number(catalogStats.quality.missingPoster || 0) : libraryQuality.withoutPoster;
const qualityPanelMissingGenre = catalogStats?.quality ? Number(catalogStats.quality.missingGenre || 0) : libraryQuality.withoutGenre;
const qualityPanelMissingYear = catalogStats?.quality ? Number(catalogStats.quality.missingYear || 0) : libraryQuality.withoutYear;
const qualityPanelMissingTags = catalogStats?.quality ? Number(catalogStats.quality.missingTags || 0) : libraryQuality.withoutTags;
const qualityPanelMissingCountry = catalogStats?.quality ? Number(catalogStats.quality.missingCountry || 0) : 0;
const qualityPanelMissingLanguage = catalogStats?.quality ? Number(catalogStats.quality.missingLanguage || 0) : 0;
const qualityPanelMissingQuality = catalogStats?.quality ? Number(catalogStats.quality.missingQuality || 0) : 0;
const qualityPanelWithPoster = Math.max(0, qualityPanelTotal - qualityPanelMissingPoster);
const qualityPanelWithGenre = Math.max(0, qualityPanelTotal - qualityPanelMissingGenre);
const qualityPanelWithYear = Math.max(0, qualityPanelTotal - qualityPanelMissingYear);
const qualityPanelWithTags = Math.max(0, qualityPanelTotal - qualityPanelMissingTags);

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

  const presetDuplicateKey = (preset) => {
    const filters = preset?.filters || {};
    return JSON.stringify({
      libraryQuery: filters.libraryQuery || "",
      libraryCategory: filters.libraryCategory || "All",
      libraryGenre: filters.libraryGenre || "All",
      librarySource: filters.librarySource || "All",
      librarySort: filters.librarySort || "newest",
      libraryQualityFilter: filters.libraryQualityFilter || "All",
      libraryCountry: filters.libraryCountry || "All",
      libraryLanguage: filters.libraryLanguage || "All",
      libraryYear: filters.libraryYear || "All",
      libraryVideoQuality: filters.libraryVideoQuality || "All"
    });
  };

  const deleteDuplicateCloudPresets = async () => {
    const seen = new Map();
    const duplicates = [];

    for (const preset of sortSavedAiLibraryPresets(savedFilterPresets)) {
      const key = presetDuplicateKey(preset);

      if (!seen.has(key)) {
        seen.set(key, preset);
      } else {
        if (!isCloudPresetLocked(preset)) duplicates.push(preset);
      }
    }

    if (!duplicates.length) {
      setCopyLinkToast("Nu există duplicate de șters.");
      window.setTimeout(() => setCopyLinkToast(""), 2200);
      return;
    }

    const ok = window.confirm(`Ștergi ${duplicates.length} preseturi duplicate din Cloudflare D1?`);
    if (!ok) return;

    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      for (const preset of duplicates) {
        await deleteCloudPreset(preset.id);
      }

      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Preseturile duplicate au fost șterse.");
      addCloudPresetAuditLog("Duplicate șterse", "", String(duplicates.length));
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot șterge duplicatele.");
      setCopyLinkToast("Ștergere duplicate eșuată.");
    } finally {
      setCloudPresetsLoading(false);
      window.setTimeout(() => setCopyLinkToast(""), 2800);
    }
  };

  const toggleCloudPresetSelected = (id) => {
    setSelectedCloudPresetIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const clearCloudPresetSelection = () => {
    setSelectedCloudPresetIds([]);
  };

  const exportCloudPresetsBackup = async () => {
    const payload = {
      type: "cineverse-cloud-presets-backup",
      build: CINEVERSE_BUILD,
      exportedAt: new Date().toISOString(),
      total: savedFilterPresets.length,
      items: savedFilterPresets
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      addCloudPresetAuditLog("Backup copiat", "", String(savedFilterPresets.length));
      setCopyLinkToast("Backup preseturi copiat ca JSON.");
    } catch {
      setCloudPresetRestoreText(JSON.stringify(payload, null, 2));
      setShowCloudPresetRestoreBox(true);
      setCopyLinkToast("Backup generat în caseta restore.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2600);
  };

  const restoreCloudPresetsBackup = async () => {
    if (!cloudPresetRestoreText.trim()) {
      setCopyLinkToast("Lipește JSON backup înainte de restore.");
      window.setTimeout(() => setCopyLinkToast(""), 2400);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(cloudPresetRestoreText);
    } catch {
      setCopyLinkToast("JSON backup invalid.");
      window.setTimeout(() => setCopyLinkToast(""), 2400);
      return;
    }

    const items = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(items)) {
      setCopyLinkToast("Backup invalid: lipsesc items.");
      window.setTimeout(() => setCopyLinkToast(""), 2400);
      return;
    }

    const ok = window.confirm(`Restaurezi ${items.length} preseturi în Cloudflare D1?`);
    if (!ok) return;

    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      for (const preset of items) {
        await createCloudPreset({
          ...preset,
          id: preset.id || String(Date.now()) + "-" + Math.random().toString(16).slice(2),
          name: preset.name || "Preset restaurat",
          filters: preset.filters || {},
          pinned: !!preset.pinned
        });
      }

      addCloudPresetAuditLog("Restore backup", "", String(items.length));
      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Backup restaurat în Cloudflare D1.");
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot restaura backup-ul.");
      setCopyLinkToast("Restore backup eșuat.");
    } finally {
      setCloudPresetsLoading(false);
      window.setTimeout(() => setCopyLinkToast(""), 2800);
    }
  };

  const bulkDeleteCloudPresets = async () => {
    if (!selectedCloudPresetIds.length) return;

    const ok = window.confirm(`Ștergi ${selectedCloudPresetIds.length} preseturi selectate din Cloudflare D1?`);
    if (!ok) return;

    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      for (const id of selectedCloudPresetIds) {
        const preset = savedFilterPresets.find((item) => item.id === id);
        if (isCloudPresetLocked(preset)) continue;
        await deleteCloudPreset(id);
      }

      addCloudPresetAuditLog("Bulk delete", "", String(selectedCloudPresetIds.length));
      setSelectedCloudPresetIds([]);
      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Preseturile selectate au fost șterse.");
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot șterge preseturi bulk.");
      setCopyLinkToast("Bulk delete eșuat.");
    } finally {
      setCloudPresetsLoading(false);
      window.setTimeout(() => setCopyLinkToast(""), 2600);
    }
  };

  const bulkPinCloudPresets = async () => {
    if (!selectedCloudPresetIds.length) return;

    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      for (const id of selectedCloudPresetIds) {
        await updateCloudPreset(id, { pinned: true });
      }

      addCloudPresetAuditLog("Bulk pin", "", String(selectedCloudPresetIds.length));
      setSelectedCloudPresetIds([]);
      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Preseturile selectate au fost pinned.");
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot face bulk pin.");
      setCopyLinkToast("Bulk pin eșuat.");
    } finally {
      setCloudPresetsLoading(false);
      window.setTimeout(() => setCopyLinkToast(""), 2600);
    }
  };

  const deleteCloudTestPresets = async () => {
    const testPresets = savedFilterPresets.filter((preset) => {
      if (isCloudPresetLocked(preset)) return false;
      const name = String(preset.name || "").toLowerCase();
      return name.includes("test") || name.includes("fronted") || name.includes("frontend") || name.includes("direct worker");
    });

    if (!testPresets.length) {
      setCopyLinkToast("Nu există preseturi test de șters.");
      window.setTimeout(() => setCopyLinkToast(""), 2200);
      return;
    }

    const ok = window.confirm(`Ștergi ${testPresets.length} preseturi test din Cloudflare D1?`);
    if (!ok) return;

    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      for (const preset of testPresets) {
        await deleteCloudPreset(preset.id);
      }

      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Preseturile test au fost șterse din cloud.");
      addCloudPresetAuditLog("Preseturi test șterse", "", String(testPresets.length));
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot șterge preseturile test.");
      setCopyLinkToast("Ștergere test eșuată.");
    } finally {
      setCloudPresetsLoading(false);
      window.setTimeout(() => setCopyLinkToast(""), 2800);
    }
  };

  const clearLocalAiLibraryPresetCache = async () => {
    try {
      setCopyLinkToast("Preseturile sunt deja doar în cloud.");
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot șterge cache-ul local.");
      setCopyLinkToast("Nu pot șterge cache-ul local.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2400);
  };

  const migrateLocalAiLibraryPresetsToCloud = async () => {
    const localPresets = sortSavedAiLibraryPresets(readSavedAiLibraryPresets());

    if (!localPresets.length) {
      setCopyLinkToast("Nu există preseturi locale de migrat.");
      window.setTimeout(() => setCopyLinkToast(""), 2200);
      return;
    }

    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      for (const preset of localPresets) {
        await createCloudPreset(preset);
      }

      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Preseturile locale au fost migrate în cloud.");
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot migra preseturile locale în cloud.");
      setCopyLinkToast("Migrare eșuată.");
    } finally {
      setCloudPresetsLoading(false);
      window.setTimeout(() => setCopyLinkToast(""), 2800);
    }
  };

  const runAiLibraryAutoTest = async () => {
    if (aiLibraryAutoTestRunning) return;

    setAiLibraryAutoTestRunning(true);
    setAiLibraryAutoTestHasRun(true);

    const results = [];
    const addResult = (name, ok, details = "") => {
      results.push({
        name,
        ok,
        details,
        time: new Date().toLocaleString()
      });
    };

    let testPresetId = "";

    try {
      const presetsData = await getCloudPresets();
      addResult("Cloud presets GET", !!presetsData?.ok, `total=${presetsData?.total ?? 0}`);

      const testPreset = {
        id: "auto-test-" + Date.now(),
        name: "Auto Test Preset",
        pinned: false,
        filters: {
          libraryQuery: "",
          libraryCategory: "Filme",
          libraryGenre: "All",
          librarySource: "YouTube",
          librarySort: "newest",
          libraryQualityFilter: "All",
          libraryCountry: "All",
          libraryLanguage: "All",
          libraryYear: "All",
          libraryVideoQuality: "All",
          autoTest: true
        }
      };

      const created = await createCloudPreset(testPreset);
      testPresetId = created?.id || testPreset.id;
      addResult("Create preset test", !!created?.ok, testPresetId);

      const updated = await updateCloudPreset(testPresetId, {
        pinned: true,
        filters: {
          ...testPreset.filters,
          autoTestUpdated: true
        }
      });
      addResult("Update preset test", !!updated?.ok, testPresetId);

      const unlocked = await updateCloudPreset(testPresetId, {
        filters: {
          ...testPreset.filters,
          locked: false,
          autoTestUpdated: true
        }
      });
      addResult("Lock/Unlock preset test", !!unlocked?.ok, testPresetId);

      const deleted = await deleteCloudPreset(testPresetId);
      addResult("Delete preset test", !!deleted?.ok, testPresetId);
      testPresetId = "";

      const backupPayload = {
        type: "cineverse-cloud-presets-backup-test",
        build: CINEVERSE_BUILD,
        exportedAt: new Date().toISOString(),
        total: savedFilterPresets.length,
        items: savedFilterPresets
      };
      addResult("Backup JSON generate", Array.isArray(backupPayload.items), String(backupPayload.total));

      try {
        const catalog = await apiCatalog({ page: 1, limit: 1 });
        addResult("Catalog /catalog", !!catalog?.ok, `total=${catalog?.total ?? "-"}`);
      } catch (error) {
        addResult("Catalog /catalog", false, error?.message || "catalog failed");
      }

      try {
        const stats = await apiCatalogStats();
        addResult("Catalog /catalog/stats", !!stats?.ok, `total=${stats?.total ?? "-"}`);
      } catch (error) {
        addResult("Catalog /catalog/stats", false, error?.message || "stats failed");
      }

      try {
        const facets = await apiCatalogFacets();
        addResult("Catalog /catalog/facets", !!facets?.ok, `categories=${facets?.categories?.length ?? "-"}`);
      } catch (error) {
        addResult("Catalog /catalog/facets", false, error?.message || "facets failed");
      }

      const failed = results.filter((item) => !item.ok).length;
      const passed = results.filter((item) => item.ok).length;

      setAiLibraryAutoTestReport({
        status: failed ? "error" : "ok",
        passed,
        failed,
        total: results.length,
        checkedAt: new Date().toLocaleString(),
        results
      });

      addCloudPresetAuditLog(failed ? "Auto test ERROR" : "Auto test OK", "", `${passed}/${results.length}`);
      setCopyLinkToast(failed ? "Auto test AI Library are erori." : "Auto test AI Library OK.");
    } catch (error) {
      addResult("Auto test runtime", false, error?.message || "Auto test failed");

      if (testPresetId) {
        try {
          await deleteCloudPreset(testPresetId);
        } catch {}
      }

      setAiLibraryAutoTestReport({
        status: "error",
        passed: results.filter((item) => item.ok).length,
        failed: results.filter((item) => !item.ok).length,
        total: results.length,
        checkedAt: new Date().toLocaleString(),
        results
      });

      setCopyLinkToast("Auto test AI Library eșuat.");
    } finally {
      await loadCloudAiLibraryPresets();
      setAiLibraryAutoTestRunning(false);
      window.setTimeout(() => setCopyLinkToast(""), 3000);
    }
  };

  const checkCloudPresetHealth = async () => {
    setCloudPresetsError("");

    try {
      const data = await getCloudPresets();
      const total = Number(data.total ?? (data.items || []).length);

      setCloudPresetHealth({
        status: "ok",
        total,
        checkedAt: new Date().toLocaleString(),
        message: "Cloudflare D1 presets conectat"
      });

      addCloudPresetAuditLog("Health check OK", "", String(total));
      setCopyLinkToast("Health check presets OK.");
    } catch (error) {
      setCloudPresetHealth({
        status: "error",
        total: 0,
        checkedAt: new Date().toLocaleString(),
        message: error?.message || "Cloud presets health failed"
      });

      setCloudPresetsError(error?.message || "Cloud presets health failed.");
      setCopyLinkToast("Health check presets eșuat.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2400);
  };

  const loadCloudAiLibraryPresets = async () => {
    setCloudPresetsLoading(true);
    setCloudPresetsError("");

    try {
      const data = await getCloudPresets();
      const items = sortSavedAiLibraryPresets(data.items || []);
      setSavedFilterPresets(items);
      setCloudPresetHealth({
        status: "ok",
        total: items.length,
        checkedAt: new Date().toLocaleString(),
        message: "Cloudflare D1 presets conectat"
      });
      syncSelectedPresetDetailsFromList(items);
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot încărca preset-urile cloud.");
    } finally {
      setCloudPresetsLoading(false);
    }
  };

  useEffect(() => {
    loadCloudAiLibraryPresets();
  }, []);

  useEffect(() => {
    if (!aiLibraryAutoTestEnabled || aiLibraryAutoTestRunning || aiLibraryAutoTestHasRun) return;
    runAiLibraryAutoTest();
  }, [aiLibraryAutoTestEnabled, aiLibraryAutoTestHasRun]);

  const syncSelectedPresetDetailsFromList = (items) => {
    if (!selectedPresetDetails?.id) return;
    const updated = (items || []).find((item) => item.id === selectedPresetDetails.id);
    if (updated) {
      setSelectedPresetDetails(updated);
    }
  };

  const savedPresetLabel = (preset) => {
    const filters = preset?.filters || {};
    const parts = [
      filters.libraryCategory && filters.libraryCategory !== "All" ? filters.libraryCategory : "",
      filters.libraryGenre && filters.libraryGenre !== "All" ? filters.libraryGenre : "",
      filters.librarySource && filters.librarySource !== "All" ? filters.librarySource : "",
      filters.libraryCountry && filters.libraryCountry !== "All" ? filters.libraryCountry : "",
      filters.libraryLanguage && filters.libraryLanguage !== "All" ? filters.libraryLanguage : "",
      filters.libraryYear && filters.libraryYear !== "All" ? filters.libraryYear : "",
      filters.libraryVideoQuality && filters.libraryVideoQuality !== "All" ? filters.libraryVideoQuality : "",
      filters.locked ? "Locked" : "",
      filters.presetFolder && filters.presetFolder !== "General" ? "Folder: " + filters.presetFolder : "",
      filters.useCount ? "Folosiri: " + filters.useCount : "",
      filters.lastUsedAt ? "Ultima folosire: " + filters.lastUsedAt : "",
      filters.libraryQuery ? "Căutare: " + filters.libraryQuery : ""
    ].filter(Boolean);

    return parts.length ? parts.join(" · ") : "Toate filtrele";
  };

  const cloudPresetFolders = ["All", ...new Set(savedFilterPresets.map((preset) => preset?.filters?.presetFolder || "General"))];

  const filteredSavedFilterPresets = savedFilterPresets.filter((preset) => {
    const query = savedPresetSearch.trim().toLowerCase();
    const folder = preset?.filters?.presetFolder || "General";

    if (savedPresetFolderFilter !== "All" && folder !== savedPresetFolderFilter) return false;

    if (savedPresetQuickFilter === "Pinned" && !preset.pinned) return false;
    if (savedPresetQuickFilter === "Anime" && !String(savedPresetLabel(preset)).toLowerCase().includes("anime")) return false;
    if (savedPresetQuickFilter === "Filme" && !String(savedPresetLabel(preset)).toLowerCase().includes("filme")) return false;
    if (savedPresetQuickFilter === "YouTube" && !String(savedPresetLabel(preset)).toLowerCase().includes("youtube")) return false;
    if (savedPresetQuickFilter === "Japonia" && !String(savedPresetLabel(preset)).toLowerCase().includes("japonia")) return false;

    if (!query) return true;

    const haystack = [
      preset.name,
      savedPresetLabel(preset),
      JSON.stringify(preset.filters || {})
    ].join(" ").toLowerCase();

    return haystack.includes(query);
  });

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

  const saveCurrentAiLibraryPreset = async () => {
    const name = savedPresetName.trim();
    if (!name) {
      setCopyLinkToast("Scrie un nume pentru preset.");
      window.setTimeout(() => setCopyLinkToast(""), 2500);
      return;
    }

    const nextPreset = {
      id: String(Date.now()),
      name,
      filters: {
        ...currentAiLibraryFilterPayload(),
        presetFolder: savedPresetFolder || "General"
      },
      createdAt: new Date().toISOString()
    };

    const next = sortSavedAiLibraryPresets([
      nextPreset,
      ...savedFilterPresets.filter((item) => item.name.toLowerCase() !== name.toLowerCase())
    ]).slice(0, 20);

    setSavedFilterPresets(next);
    try {
      await createCloudPreset(nextPreset);
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot salva presetul în cloud.");
    }
    setSavedPresetName("");
    setCopyLinkToast("Preset salvat.");
    window.setTimeout(() => setCopyLinkToast(""), 2500);
  };

  const addCloudPresetAuditLog = (action, presetName = "", extra = "") => {
    const item = {
      id: String(Date.now()) + "-" + Math.random().toString(16).slice(2),
      time: new Date().toLocaleString(),
      action,
      presetName,
      extra
    };

    setCloudPresetAuditLog((current) => [item, ...current].slice(0, 25));
  };

  const copySelectedPresetJson = async (preset) => {
    if (!preset) return;

    const payload = JSON.stringify(preset, null, 2);

    try {
      await navigator.clipboard.writeText(payload);
      setCopyLinkToast("JSON preset copiat.");
      addCloudPresetAuditLog("JSON copiat", preset.name || "Preset");
    } catch {
      setCopyLinkToast("Nu pot copia JSON-ul.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2200);
  };

  const trackCloudPresetUsage = async (preset) => {
    if (!preset?.id) return;

    const currentFilters = preset.filters || {};
    const currentUseCount = Number(currentFilters.useCount || 0);
    const nextFilters = {
      ...currentFilters,
      useCount: currentUseCount + 1,
      lastUsedAt: new Date().toISOString()
    };

    try {
      await updateCloudPreset(preset.id, { filters: nextFilters });
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot actualiza statisticile presetului.");
    }
  };

  const applySavedAiLibraryPreset = async (preset) => {
    applyAiLibraryFilterPayload(preset?.filters || {});
    setCopyLinkToast("Preset aplicat.");
    addCloudPresetAuditLog("Preset aplicat", preset?.name || "Preset");
    await trackCloudPresetUsage(preset);
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const isCloudPresetLocked = (preset) => {
    return !!preset?.filters?.locked;
  };

  const toggleCloudPresetLock = async (preset) => {
    if (!preset?.id) return;

    const locked = !isCloudPresetLocked(preset);
    const nextFilters = {
      ...(preset.filters || {}),
      locked
    };

    try {
      await updateCloudPreset(preset.id, { filters: nextFilters });
      addCloudPresetAuditLog(locked ? "Preset locked" : "Preset unlocked", preset.name || "Preset");
      await loadCloudAiLibraryPresets();
      setCopyLinkToast(locked ? "Preset blocat." : "Preset deblocat.");
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot actualiza lock preset.");
      setCopyLinkToast("Lock preset eșuat.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2400);
  };

  const deleteSavedAiLibraryPreset = async (presetOrId) => {
    const preset = typeof presetOrId === "object"
      ? presetOrId
      : savedFilterPresets.find((item) => item.id === presetOrId);

    if (!preset?.id) {
      setCopyLinkToast("Presetul nu a fost găsit.");
      window.setTimeout(() => setCopyLinkToast(""), 2200);
      return;
    }

    if (isCloudPresetLocked(preset)) {
      setCopyLinkToast("Presetul este blocat. Deblochează-l înainte de ștergere.");
      window.setTimeout(() => setCopyLinkToast(""), 2600);
      return;
    }

    const ok = window.confirm(`Ștergi presetul cloud "${preset.name}" din Cloudflare D1?`);
    if (!ok) return;

    const next = savedFilterPresets.filter((item) => item.id !== preset.id);
    setSavedFilterPresets(next);

    try {
      await deleteCloudPreset(preset.id);
      await loadCloudAiLibraryPresets();
      setCopyLinkToast("Preset șters din cloud.");
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot șterge presetul din cloud.");
      setCopyLinkToast("Ștergere preset eșuată.");
    }

    window.setTimeout(() => setCopyLinkToast(""), 2200);
  };

  const renameSavedAiLibraryPreset = async (preset) => {
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
    try {
      await updateCloudPreset(preset.id, { name: cleanName });
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot redenumi presetul în cloud.");
    }
    setCopyLinkToast("Preset redenumit.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const duplicateSavedAiLibraryPreset = async (preset) => {
    if (!preset) return;

    const copy = {
      ...preset,
      id: String(Date.now()),
      name: preset.name + " Copy",
      createdAt: new Date().toISOString()
    };

    const next = sortSavedAiLibraryPresets([copy, ...savedFilterPresets]).slice(0, 20);

    setSavedFilterPresets(next);
    try {
      await createCloudPreset(copy);
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot duplica presetul în cloud.");
    }
    setCopyLinkToast("Preset duplicat.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const updateSavedAiLibraryPreset = async (preset) => {
    if (!preset) return;

    const ok = window.confirm("Actualizezi acest preset cu filtrele curente?");
    if (!ok) return;

    const next = savedFilterPresets.map((item) =>
      item.id === preset.id
        ? {
            ...item,
            filters: currentAiLibraryFilterPayload(),
            updatedAt: new Date().toISOString()
          }
        : item
    );

    const sortedNext = sortSavedAiLibraryPresets(next);
    setSavedFilterPresets(sortedNext);
    try {
      await updateCloudPreset(preset.id, {
        filters: currentAiLibraryFilterPayload()
      });
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot actualiza presetul în cloud.");
    }
    setCopyLinkToast("Preset actualizat.");
    window.setTimeout(() => setCopyLinkToast(""), 1800);
  };

  const toggleSavedAiLibraryPresetPin = async (preset) => {
    if (!preset) return;

    const next = sortSavedAiLibraryPresets(savedFilterPresets.map((item) =>
      item.id === preset.id
        ? {
            ...item,
            pinned: !item.pinned,
            updatedAt: new Date().toISOString()
          }
        : item
    ));

    setSavedFilterPresets(next);
    try {
      await updateCloudPreset(preset.id, { pinned: !preset.pinned });
      await loadCloudAiLibraryPresets();
    } catch (error) {
      setCloudPresetsError(error?.message || "Nu pot actualiza pin în cloud.");
    }
    setCopyLinkToast(preset.pinned ? "Preset scos din pinned." : "Preset pinned.");
    addCloudPresetAuditLog(preset.pinned ? "Unpin" : "Pin", preset.name || "Preset");
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

      const merged = sortSavedAiLibraryPresets([
        ...cleaned,
        ...savedFilterPresets.filter((existing) =>
          !cleaned.some((item) => item.name.toLowerCase() === existing.name.toLowerCase())
        )
      ]).slice(0, 20);

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
      const safeLibraryFromYear =
        typeof libraryFromYear !== "undefined" ? libraryFromYear : "";

      const safeLibraryToYear =
        typeof libraryToYear !== "undefined" ? libraryToYear : "";

      const data = await apiCatalog({
        page,
        limit: PAGE_SIZE,
        q: libraryQuery,
        category: libraryCategory,
        genre: libraryGenre,
        sourceType: librarySource,
        year: libraryYear,
        fromYear: safeLibraryFromYear,
        toYear: safeLibraryToYear,
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
                <input
                  value={savedPresetFolder}
                  onChange={(event) => setSavedPresetFolder(event.target.value)}
                  placeholder="Folder preset"
                />
                <button className="secondary" onClick={saveCurrentAiLibraryPreset}>
                  Salvează preset
                </button>
              </div>

              <div className="presetCloudStatus">
                <div className="presetCloudStatusText">
                  <span className="pill">Cloud presets conectat</span>
                  <span className="pill stableCloudPresetPill">Cloud Presets Stable</span>
                  {cloudPresetsLoading && <span className="mutedText">Se încarcă preset-urile din Cloudflare...</span>}
                  {cloudPresetsError && <span className="mutedText">Cloud error: {cloudPresetsError}</span>}
                  {!cloudPresetsLoading && !cloudPresetsError && (
                    <>
                      <span className="mutedText">Preset-urile sunt salvate doar în Cloudflare D1.</span>
                      <span className="mutedText">Capitol Cloud Presets finalizat: backup, restore, lock, health, usage, folders, bulk și audit log.</span>
                    </>
                  )}
                </div>

                <div className="presetCloudActions">
                  <button className="secondary" onClick={loadCloudAiLibraryPresets}>
                    Refresh cloud presets
                  </button>
                  <button className="secondary" onClick={clearLocalAiLibraryPresetCache}>
                    Verifică din cloud
                  </button>
                  <button className="secondary" onClick={deleteCloudTestPresets}>
                    Șterge preseturi test
                  </button>
                  <button className="secondary" onClick={deleteDuplicateCloudPresets}>
                    Șterge duplicate
                  </button>
                  <span className="mutedText">Cloud cleanup: {savedFilterPresets.length} preseturi</span>
                  <button className="secondary" onClick={exportCloudPresetsBackup}>
                    Backup cloud presets
                  </button>
                  <button className="secondary" onClick={checkCloudPresetHealth}>
                    Health check presets
                  </button>
                  <button className="secondary" onClick={() => setShowCloudPresetRestoreBox(!showCloudPresetRestoreBox)}>
                    Restore cloud presets
                  </button>
                </div>
              </div>

              <div className="aiLibraryAutoTestBox">
                <div className="aiLibraryAutoTestHeader">
                  <span className="pill">AI Library Auto Test</span>
                  <button
                    className={aiLibraryAutoTestEnabled ? "secondary activePreset" : "secondary"}
                    onClick={() => {
                      const next = !aiLibraryAutoTestEnabled;
                      setAiLibraryAutoTestEnabled(next);
                      try {
                        localStorage.setItem(AI_LIBRARY_AUTO_TEST_ENABLED_KEY, String(next));
                      } catch {}
                      if (!next) setAiLibraryAutoTestHasRun(false);
                    }}
                  >
                    {aiLibraryAutoTestEnabled ? "ON" : "OFF"}
                  </button>
                  <button className="secondary" onClick={runAiLibraryAutoTest} disabled={aiLibraryAutoTestRunning}>
                    {aiLibraryAutoTestRunning ? "Rulează..." : "Rulează test acum"}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setAiLibraryAutoTestReport(null);
                      setAiLibraryAutoTestHasRun(false);
                    }}
                  >
                    Reset auto test report
                  </button>
                </div>

                {aiLibraryAutoTestReport ? (
                  <div className="aiLibraryAutoTestSummary">
                    <strong>{aiLibraryAutoTestReport.status === "ok" ? "OK" : "ERROR"}</strong>
                    <span className="mutedText">Teste OK: {aiLibraryAutoTestReport.passed}</span>
                    <span className="mutedText">Eșuate: {aiLibraryAutoTestReport.failed}</span>
                    <span className="mutedText">Ultimul test: {aiLibraryAutoTestReport.checkedAt}</span>
                  </div>
                ) : (
                  <span className="mutedText">Auto test OFF. Safe Mode: ON rulează automat o singură dată pe sesiune; OFF înseamnă control manual.</span>
                )}

                {aiLibraryAutoTestReport?.results?.length > 0 && (
                  <div className="aiLibraryAutoTestResults">
                    {aiLibraryAutoTestReport.results.map((item, index) => (
                      <div className={item.ok ? "autoTestResult ok" : "autoTestResult error"} key={item.name + index}>
                        <strong>{item.ok ? "OK" : "ERROR"}</strong>
                        <span>{item.name}</span>
                        <small>{item.details || "-"}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cloudPresetHealthBox">
                <span className="pill">Cloud presets health</span>
                <strong>{cloudPresetHealth.status === "ok" ? "OK" : cloudPresetHealth.status === "error" ? "ERROR" : "NEVER"}</strong>
                <span className="mutedText">{cloudPresetHealth.message}</span>
                <span className="mutedText">Total D1: {cloudPresetHealth.total}</span>
                <span className="mutedText">Ultima verificare: {cloudPresetHealth.checkedAt || "-"}</span>
              </div>

              {showCloudPresetRestoreBox && (
                <div className="cloudPresetRestoreBox">
                  <span className="pill">Restore cloud presets</span>
                  <textarea
                    value={cloudPresetRestoreText}
                    onChange={(event) => setCloudPresetRestoreText(event.target.value)}
                    placeholder="Lipește aici backup JSON pentru restore în Cloudflare D1..."
                  />
                  <div className="presetCloudActions">
                    <button className="secondary" onClick={restoreCloudPresetsBackup}>
                      Aplică restore
                    </button>
                    <button className="secondary" onClick={() => setCloudPresetRestoreText("")}>
                      Clear JSON
                    </button>
                  </div>
                </div>
              )}

              {cloudPresetAuditLog.length > 0 && (
                <div className="cloudPresetAuditPanel">
                  <div className="cloudPresetAuditHeader">
                    <span className="pill">Cloud presets audit log</span>
                    <button className="secondary" onClick={() => setCloudPresetAuditLog([])}>
                      Clear audit
                    </button>
                  </div>
                  <div className="cloudPresetAuditList">
                    {cloudPresetAuditLog.map((item) => (
                      <div className="cloudPresetAuditItem" key={item.id}>
                        <strong>{item.action}</strong>
                        <span>{item.presetName || item.extra || "-"}</span>
                        <small>{item.time}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="savedPresetFolderFilter">
                <span className="pill">Folder preset</span>
                <select value={savedPresetFolderFilter} onChange={(event) => setSavedPresetFolderFilter(event.target.value)}>
                  {cloudPresetFolders.map((folder) => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>

              <div className="presetQuickFilters">
                <span className="pill">Preset quick filters</span>
                {["All", "Pinned", "Anime", "Filme", "YouTube", "Japonia"].map((item) => (
                  <button
                    key={item}
                    className={savedPresetQuickFilter === item ? "secondary activePreset" : "secondary"}
                    onClick={() => setSavedPresetQuickFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="savedPresetSearchBox">
                <input
                  value={savedPresetSearch}
                  onChange={(event) => setSavedPresetSearch(event.target.value)}
                  placeholder="Caută preseturi..."
                />
                {savedPresetSearch && (
                  <button className="secondary" onClick={() => setSavedPresetSearch("")}>
                    Clear
                  </button>
                )}
              </div>

              <div className="savedPresetTools">
                <button className="secondary" onClick={exportSavedAiLibraryPresets}>
                  Export preseturi
                </button>
                <button className="secondary" onClick={() => setShowPresetImportBox(!showPresetImportBox)}>
                  Import preseturi
                </button>
                <button className="secondary" onClick={migrateLocalAiLibraryPresetsToCloud}>
                  Migrează local în cloud
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

              {filteredSavedFilterPresets.length > 0 && (
                <div className="cloudPresetBulkToolbar">
                  <span className="pill">Bulk select</span>
                  <span className="mutedText">{selectedCloudPresetIds.length} selectate</span>
                  <button className="secondary" onClick={bulkPinCloudPresets} disabled={!selectedCloudPresetIds.length}>
                    Pin selectate
                  </button>
                  <button className="secondary" onClick={bulkDeleteCloudPresets} disabled={!selectedCloudPresetIds.length}>
                    Șterge selectate
                  </button>
                  <button className="secondary" onClick={clearCloudPresetSelection} disabled={!selectedCloudPresetIds.length}>
                    Clear select
                  </button>
                </div>
              )}

              {filteredSavedFilterPresets.length > 0 ? (
                <div className="savedPresetList">
                  {filteredSavedFilterPresets.map((preset) => (
                    <div className="savedPresetItem" key={preset.id}>
                      <label className="cloudPresetSelectBox">
                        <input
                          type="checkbox"
                          checked={selectedCloudPresetIds.includes(preset.id)}
                          onChange={() => toggleCloudPresetSelected(preset.id)}
                        />
                        Select
                      </label>
                      <div className="savedPresetMain">
                        <button className="secondary" onClick={() => applySavedAiLibraryPreset(preset)}>
                          {preset.filters?.locked ? "🔒 " : ""}{preset.pinned ? "📌 " : ""}{preset.name}
                        </button>
                        <span className="savedPresetMeta">{savedPresetLabel(preset)}</span>
                      </div>
                      <button className="secondary" onClick={() => toggleSavedAiLibraryPresetPin(preset)}>
                        {preset.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button className="secondary" onClick={() => setSelectedPresetDetails(preset)}>
                        Detalii
                      </button>
                      <button className="secondary" onClick={() => toggleCloudPresetLock(preset)}>
                        {preset.filters?.locked ? "Unlock" : "Lock"}
                      </button>
                      <button className="secondary" onClick={() => renameSavedAiLibraryPreset(preset)}>
                        Redenumește
                      </button>
                      <button className="secondary" onClick={() => duplicateSavedAiLibraryPreset(preset)}>
                        Duplică
                      </button>
                      <button className="secondary" onClick={() => updateSavedAiLibraryPreset(preset)}>
                        Actualizează
                      </button>
                      <button className="secondary" onClick={() => deleteSavedAiLibraryPreset(preset)}>
                        Șterge
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mutedText">{savedPresetSearch ? "Nu există preseturi pentru căutarea curentă." : "Nu ai preseturi salvate încă."}</p>
              )}

              {selectedPresetDetails && (
                <div className="selectedPresetDetailsPanel">
                  <div className="selectedPresetDetailsHeader">
                    <div>
                      <span className="pill">Detalii preset cloud</span>
                      <h3>{selectedPresetDetails.filters?.locked ? "🔒 " : ""}{selectedPresetDetails.name}</h3>
                    </div>
                    <button className="secondary" onClick={() => setSelectedPresetDetails(null)}>
                      Închide
                    </button>
                  </div>

                  <div className="selectedPresetDetailsActions">
                    <button className="secondary" onClick={() => applySavedAiLibraryPreset(selectedPresetDetails)}>
                      Aplică preset
                    </button>
                    <button className="secondary" onClick={() => toggleSavedAiLibraryPresetPin(selectedPresetDetails)}>
                      {selectedPresetDetails.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button className="secondary" onClick={() => copySelectedPresetJson(selectedPresetDetails)}>
                      Copiază JSON
                    </button>
                    <button className="secondary" onClick={() => toggleCloudPresetLock(selectedPresetDetails)}>
                      {selectedPresetDetails.filters?.locked ? "Unlock" : "Lock"}
                    </button>
                  </div>

                  <div className="selectedPresetDetailsGrid">
                    <div>
                      <strong>ID</strong>
                      <span>{selectedPresetDetails.id}</span>
                    </div>
                    <div>
                      <strong>Creat</strong>
                      <span>{selectedPresetDetails.createdAt || "-"}</span>
                    </div>
                    <div>
                      <strong>Actualizat</strong>
                      <span>{selectedPresetDetails.updatedAt || "-"}</span>
                    </div>
                    <div>
                      <strong>Pinned</strong>
                      <span>{selectedPresetDetails.pinned ? "Da" : "Nu"}</span>
                    </div>
                    <div>
                      <strong>Locked</strong>
                      <span>{selectedPresetDetails.filters?.locked ? "Da" : "Nu"}</span>
                    </div>
                    <div>
                      <strong>Folosiri</strong>
                      <span>{selectedPresetDetails.filters?.useCount || 0}</span>
                    </div>
                    <div>
                      <strong>Ultima folosire</strong>
                      <span>{selectedPresetDetails.filters?.lastUsedAt || "-"}</span>
                    </div>
                  </div>

                  <pre className="presetDetailsJson">{JSON.stringify(selectedPresetDetails.filters || {}, null, 2)}</pre>
                </div>
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
                <h3>AI Library Quality Panel</h3>                <p className="mutedText">{catalogStats?.total ? "Stats server-side din Cloudflare D1" : "Stats locale fallback"}</p>
                <p>Verifică rapid cât de completă este biblioteca ta AI.</p>

                <div className="stats">
                  <div><strong>{qualityPanelTotal}</strong><span>Total</span></div>
                  <div><strong>{qualityPanelWithPoster}</strong><span>Cu poster</span></div>
                  <div><strong>{qualityPanelWithGenre}</strong><span>Cu gen</span></div>
                  <div><strong>{qualityPanelWithYear}</strong><span>Cu an</span></div>
                  <div><strong>{qualityPanelWithTags}</strong><span>Cu tags</span></div>
                </div>

                <div className="activeFilterChips">
                  {qualityPanelMissingPoster > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingPoster"); setPage(1); }}>
                      Fără poster: {qualityPanelMissingPoster}
                    </button>
                  )}
                  {qualityPanelMissingGenre > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingGenre"); setPage(1); }}>
                      Fără gen: {qualityPanelMissingGenre}
                    </button>
                  )}
                  {qualityPanelMissingYear > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingYear"); setPage(1); }}>
                      Fără an: {qualityPanelMissingYear}
                    </button>
                  )}
                  {qualityPanelMissingTags > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingTags"); setPage(1); }}>
                      Fără tags: {qualityPanelMissingTags}
                    </button>
                  )}
                  {qualityPanelMissingCountry > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingCountry"); setPage(1); }}>
                      Fără țară: {qualityPanelMissingCountry}
                    </button>
                  )}
                  {qualityPanelMissingLanguage > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingLanguage"); setPage(1); }}>
                      Fără limbă: {qualityPanelMissingLanguage}
                    </button>
                  )}
                  {qualityPanelMissingQuality > 0 && (
                    <button className="filterChip" onClick={() => { setLibraryQualityFilter("missingQuality"); setPage(1); }}>
                      Fără calitate: {qualityPanelMissingQuality}
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
          <span>Total upload-uri: {catalogMode ? catalogStats?.total || catalogTotal : uploads.length}</span>
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

        <div className="metadataBadgeRow">
          {isRealMetaValue(metadata.country) && <span>{metadata.country}</span>}
          {isRealMetaValue(metadata.language) && <span>{metadata.language}</span>}
          {isRealMetaValue(metadata.videoQuality || metadata.quality) && <span>{metadata.videoQuality || metadata.quality}</span>}
          {metadata.metadataRule && metadata.metadataRule !== "fallback-default" && (
            <span>
              AI: {metadata.metadataRule}
              {metadata.metadataConfidence ? ` · ${Math.round(Number(metadata.metadataConfidence) * 100)}%` : ""}
            </span>
          )}
          {isRealMetaValue(metadata.subtitleLanguage) && <span>Sub: {metadata.subtitleLanguage}</span>}
          {isRealMetaValue(metadata.dubbingLanguage) && <span>Dublaj: {metadata.dubbingLanguage}</span>}
        </div>

        {(metadata.franchise || metadata.collection) && (
          <div className="metadataMiniInfo">
            {metadata.franchise && <p>Franciză: {metadata.franchise}</p>}
            {metadata.collection && <p>Colecție: {metadata.collection}</p>}
          </div>
        )}

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


function PwaInstallCardSafe() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [status, setStatus] = useState("Se verifică instalarea PWA...");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;

    setIsStandalone(!!standalone);

    if (standalone) {
      setStatus("CineVerse rulează deja ca aplicație instalată.");
    } else if (!("serviceWorker" in navigator)) {
      setStatus("Browserul nu suportă Service Worker. Folosește Chrome sau Edge pe Android.");
    } else {
      setStatus("Poți instala din meniul browserului sau din buton când promptul devine disponibil.");
    }

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setStatus("Instalarea este disponibilă. Apasă butonul Instalează aplicația.");
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
      setStatus("CineVerse a fost instalată cu succes.");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installNow() {
    if (!installPrompt) {
      alert("Promptul Android nu este disponibil încă. Deschide Chrome → meniul ⋮ → Install app / Add to Home Screen.");
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice.catch(() => null);

    if (choice?.outcome === "accepted") {
      setStatus("Instalare acceptată. Verifică ecranul principal al telefonului.");
    } else {
      setStatus("Instalarea a fost anulată.");
    }

    setInstallPrompt(null);
  }

  return (
    <div className="pwaInstallCardSafe">
      <span className="pill">Instalare Android PWA</span>
      <h3>Instalează CineVerse pe telefon</h3>
      <p>{status}</p>

      <div className="pwaInstallStatusGrid">
        <span>HTTPS / Pages</span>
        <strong>{window.location.protocol === "https:" || window.location.hostname === "localhost" ? "OK" : "Necesită HTTPS"}</strong>
        <span>Service Worker</span>
        <strong>{"serviceWorker" in navigator ? "Suportat" : "Nesuportat"}</strong>
        <span>Mod aplicație</span>
        <strong>{isStandalone ? "Instalat" : "Browser"}</strong>
      </div>

      <button type="button" onClick={installNow}>
        Instalează aplicația
      </button>

      <small>
        Pe Android: Chrome / Edge → ⋮ → Install app sau Add to Home Screen.
        Pe iPhone: Safari → Share → Add to Home Screen.
      </small>
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
        <PwaInstallCardSafe />
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



function getUploadAuditMeta(upload = {}) {
  const metadata = upload.metadata || {};

  const qualityValue =
    metadata.videoQuality ||
    metadata.quality ||
    upload.videoQuality ||
    upload.quality ||
    "";

  const sourceType =
    upload.sourceType ||
    upload.source_type ||
    metadata.sourceType ||
    metadata.source ||
    "";

  const posterUrl =
    upload.posterUrl ||
    upload.poster_url ||
    metadata.posterUrl ||
    metadata.poster ||
    "";

  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter(Boolean)
    : typeof metadata.tags === "string"
      ? metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  return {
    title: upload.title || metadata.title || "Fără titlu",
    sourceType: sourceType || "Sursă necunoscută",
    posterUrl,
    genre: metadata.genre || upload.genre || "",
    year: metadata.year || upload.year || "",
    country: metadata.country || "",
    language: metadata.language || "",
    quality: qualityValue,
    category: metadata.category || "",
    franchise: metadata.franchise || "",
    collection: metadata.collection || "",
    tags
  };
}

function isAuditMetaMissing(value) {
  const v = String(value || "").trim().toLowerCase();

  return (
    !v ||
    v === "all" ||
    v === "general" ||
    v === "unknown" ||
    v === "nespecificat" ||
    v === "fără subtitrare / nespecificat" ||
    v === "fără dublaj / nespecificat"
  );
}

function getUploadAuditMissing(upload = {}) {
  const m = getUploadAuditMeta(upload);
  const missing = [];

  if (isAuditMetaMissing(m.posterUrl)) missing.push("poster");
  if (isAuditMetaMissing(m.genre)) missing.push("gen");
  if (isAuditMetaMissing(m.year)) missing.push("an");
  if (isAuditMetaMissing(m.country)) missing.push("țară");
  if (isAuditMetaMissing(m.language)) missing.push("limbă");
  if (isAuditMetaMissing(m.quality)) missing.push("calitate");
  if (!m.tags.length) missing.push("tags");

  return missing;
}

function getUploadAuditScore(upload = {}) {
  const m = getUploadAuditMeta(upload);
  let score = 0;

  if (!isAuditMetaMissing(m.posterUrl)) score += 20;
  if (!isAuditMetaMissing(m.genre)) score += 15;
  if (!isAuditMetaMissing(m.year)) score += 15;
  if (!isAuditMetaMissing(m.country)) score += 15;
  if (!isAuditMetaMissing(m.language)) score += 15;
  if (!isAuditMetaMissing(m.quality)) score += 10;
  if (m.tags.length) score += 10;

  return Math.min(100, score);
}

function AdminMetadataAuditPanel({ uploads = [], onEdit, onGoToLibrary }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [serverStats, setServerStats] = useState(null);
  const [serverStatsError, setServerStatsError] = useState("");
  const [catalogAuditUploads, setCatalogAuditUploads] = useState([]);
  const [catalogAuditError, setCatalogAuditError] = useState("");
  const [catalogAuditLoading, setCatalogAuditLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadServerStats() {
      try {
        setServerStatsError("");
        const data = await apiCatalogStats();

        if (!alive) return;

        if (data?.ok) {
          setServerStats(data);
        } else {
          setServerStatsError(data?.error || "Nu am putut încărca /catalog/stats");
        }
      } catch (error) {
        if (alive) setServerStatsError(String(error?.message || error));
      }
    }

    async function loadCatalogAuditUploads() {
      try {
        setCatalogAuditLoading(true);
        setCatalogAuditError("");

        const data = await apiCatalog({
          page: 1,
          limit: 100,
          sort: "newest"
        });

        if (!alive) return;

        setCatalogAuditUploads(Array.isArray(data?.items) ? data.items : []);
      } catch (error) {
        if (alive) setCatalogAuditError(String(error?.message || error));
      } finally {
        if (alive) setCatalogAuditLoading(false);
      }
    }

    loadServerStats();
    loadCatalogAuditUploads();

    return () => {
      alive = false;
    };
  }, []);

  const auditSourceUploads = catalogAuditUploads.length ? catalogAuditUploads : uploads;

  const auditItems = useMemo(() => {
    return (auditSourceUploads || [])
      .map((upload) => {
        const meta = getUploadAuditMeta(upload);
        const missing = getUploadAuditMissing(upload);
        const score = getUploadAuditScore(upload);

        return {
          upload,
          meta,
          missing,
          score,
          complete: missing.length === 0
        };
      })
      .sort((a, b) => a.score - b.score || b.missing.length - a.missing.length);
  }, [auditSourceUploads]);

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return auditItems;
    if (activeFilter === "complete") return auditItems.filter((item) => item.complete);
    return auditItems.filter((item) => item.missing.includes(activeFilter));
  }, [auditItems, activeFilter]);

  const localTotals = useMemo(() => {
    const total = auditItems.length;
    const complete = auditItems.filter((item) => item.complete).length;

    return {
      total,
      complete,
      withIssues: Math.max(0, total - complete),
      missingPoster: auditItems.filter((item) => item.missing.includes("poster")).length,
      missingGenre: auditItems.filter((item) => item.missing.includes("gen")).length,
      missingYear: auditItems.filter((item) => item.missing.includes("an")).length,
      missingCountry: auditItems.filter((item) => item.missing.includes("țară")).length,
      missingLanguage: auditItems.filter((item) => item.missing.includes("limbă")).length,
      missingQuality: auditItems.filter((item) => item.missing.includes("calitate")).length,
      missingTags: auditItems.filter((item) => item.missing.includes("tags")).length
    };
  }, [auditItems]);

  const serverQuality = serverStats?.quality || null;
  const serverTotal = Number(serverStats?.total || 0);

  const serverWorstMissing = serverQuality
    ? Math.max(
        Number(serverQuality.missingPoster || 0),
        Number(serverQuality.missingGenre || 0),
        Number(serverQuality.missingYear || 0),
        Number(serverQuality.missingCountry || 0),
        Number(serverQuality.missingLanguage || 0),
        Number(serverQuality.missingQuality || 0),
        Number(serverQuality.missingTags || 0)
      )
    : 0;

  const displayTotals = serverStats?.ok && serverTotal
    ? {
        total: serverTotal,
        withIssues: serverWorstMissing,
        complete: Math.max(0, serverTotal - serverWorstMissing),
        missingPoster: Number(serverQuality?.missingPoster || 0),
        missingGenre: Number(serverQuality?.missingGenre || 0),
        missingYear: Number(serverQuality?.missingYear || 0),
        missingCountry: Number(serverQuality?.missingCountry || 0),
        missingLanguage: Number(serverQuality?.missingLanguage || 0),
        missingQuality: Number(serverQuality?.missingQuality || 0),
        missingTags: Number(serverQuality?.missingTags || 0)
      }
    : localTotals;

  const visibleItems = filteredItems.slice(0, 30);

  const goToQualityFilter = (quality) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("page", "library");
      url.searchParams.set("quality", quality);
      window.history.replaceState({}, "", url.toString());
    } catch {}

    onGoToLibrary?.(quality);
  };

  return (
    <div className="adminMetadataAuditPanel">
      <div className="sectionHeader">
        <div>
          <h3>Admin Metadata Audit v3</h3>
          <p>Verifică rapid upload-urile care au metadata incompletă.</p>
          <p className="mutedText">
            {serverStats?.ok ? "Stats server-side din Cloudflare D1" : "Stats locale fallback"}
            {serverStatsError ? ` · ${serverStatsError}` : ""}
          </p>
          <p className="mutedText">
            Sursă audit: {catalogAuditUploads.length ? `/catalog (${catalogAuditUploads.length} itemuri)` : `uploads local (${uploads.length} itemuri)`}
            {catalogAuditLoading ? " · se încarcă..." : ""}
            {catalogAuditError ? ` · ${catalogAuditError}` : ""}
          </p>
        </div>
        <span className="pill">{displayTotals.complete}/{displayTotals.total} complete</span>
      </div>

      <div className="stats">
        <div><strong>{displayTotals.total}</strong><span>Total</span></div>
        <div><strong>{displayTotals.withIssues}</strong><span>Cu lipsuri</span></div>
        <div><strong>{displayTotals.missingPoster}</strong><span>Fără poster</span></div>
        <div><strong>{displayTotals.missingGenre}</strong><span>Fără gen</span></div>
        <div><strong>{displayTotals.missingYear}</strong><span>Fără an</span></div>
        <div><strong>{displayTotals.missingCountry}</strong><span>Fără țară</span></div>
        <div><strong>{displayTotals.missingLanguage}</strong><span>Fără limbă</span></div>
        <div><strong>{displayTotals.missingQuality}</strong><span>Fără calitate</span></div>
        <div><strong>{displayTotals.missingTags}</strong><span>Fără tags</span></div>
      </div>

      <div className="quickActions">
        <button type="button" onClick={() => setActiveFilter("all")}>Toate</button>
        <button type="button" onClick={() => setActiveFilter("poster")}>Vezi fără poster</button>
        <button type="button" onClick={() => setActiveFilter("gen")}>Vezi fără gen</button>
        <button type="button" onClick={() => setActiveFilter("an")}>Vezi fără an</button>
        <button type="button" onClick={() => setActiveFilter("țară")}>Vezi fără țară</button>
        <button type="button" onClick={() => setActiveFilter("limbă")}>Vezi fără limbă</button>
        <button type="button" onClick={() => setActiveFilter("calitate")}>Vezi fără calitate</button>
        <button type="button" onClick={() => setActiveFilter("tags")}>Vezi fără tags</button>
        <button type="button" onClick={() => setActiveFilter("complete")}>Vezi complete</button>
      </div>

      <div className="quickActions">
        <button type="button" onClick={() => goToQualityFilter("missingPoster")}>Deschide fără poster în AI Library</button>
        <button type="button" onClick={() => goToQualityFilter("missingGenre")}>Deschide fără gen în AI Library</button>
        <button type="button" onClick={() => goToQualityFilter("missingYear")}>Deschide fără an în AI Library</button>
        <button type="button" onClick={() => goToQualityFilter("missingCountry")}>Deschide fără țară în AI Library</button>
        <button type="button" onClick={() => goToQualityFilter("missingLanguage")}>Deschide fără limbă în AI Library</button>
        <button type="button" onClick={() => goToQualityFilter("missingQuality")}>Deschide fără calitate în AI Library</button>
      </div>

      <p className="mutedText">
        Filtru audit: {activeFilter === "all" ? "toate itemurile" : activeFilter} · afișate {visibleItems.length}/{filteredItems.length}
      </p>

      {visibleItems.length === 0 ? (
        <p className="empty">Nu există upload-uri pentru filtrul curent.</p>
      ) : (
        <div className="auditList">
          {visibleItems.map(({ upload, meta, missing, score }) => (
            <div className="auditItem" key={upload.id}>
              <div>
                <strong>{meta.title}</strong>
                <p>{meta.sourceType} · scor metadata {score}%</p>

                <div className="metadataBadgeRow">
                  {!isAuditMetaMissing(meta.category) && <span>{meta.category}</span>}
                  {!isAuditMetaMissing(meta.genre) && <span>{meta.genre}</span>}
                  {!isAuditMetaMissing(meta.year) && <span>{meta.year}</span>}
                  {!isAuditMetaMissing(meta.country) && <span>{meta.country}</span>}
                  {!isAuditMetaMissing(meta.language) && <span>{meta.language}</span>}
                  {!isAuditMetaMissing(meta.quality) && <span>{meta.quality}</span>}
                  {meta.tags
                    .filter((tag) => !isAuditMetaMissing(tag))
                    .slice(0, 4)
                    .map((tag) => <span key={tag}>#{tag}</span>)}
                </div>

                {missing.length ? (
                  <div className="metadataBadgeRow">
                    {missing.map((item) => <span key={item}>Lipsește: {item}</span>)}
                  </div>
                ) : (
                  <p className="okText">Metadata completă.</p>
                )}
              </div>

              <button type="button" onClick={() => onEdit?.(upload)}>Edit metadata</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function AdminTokenPanel() {
  const [token, setToken] = useState(() => getAdminToken());
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const hasToken = !!String(token || "").trim();

  function saveToken() {
    const clean = String(token || "").trim();

    if (!clean) {
      clearAdminToken();
      setToken("");
      setMessage("Token șters.");
      return;
    }

    setAdminToken(clean);
    setToken(clean);
    setMessage("Token salvat pe acest dispozitiv.");
  }

  function removeToken() {
    clearAdminToken();
    setToken("");
    setMessage("Token șters de pe acest dispozitiv.");
  }

  async function testToken() {
    setMessage("Testez tokenul...");

    try {
      const response = await fetch(`${API_URL}/admin/init`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${String(token || "").trim()}`
        }
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setMessage("OK: token valid, /admin/init funcționează.");
      } else {
        setMessage(`Eroare: ${data.error || response.status || "token invalid"}`);
      }
    } catch (error) {
      setMessage(`Eroare test token: ${error?.message || error}`);
    }
  }

  return (
    <section className="panel">
      <h3>Admin Token</h3>
      <p>
        Tokenul se salvează doar pe acest telefon/browser și este folosit pentru Upload,
        Edit, Ștergere, Presets și Sync Algolia.
      </p>

      <div className="formGrid">
        <label>
          ADMIN_TOKEN
          <input
            type={visible ? "text" : "password"}
            value={token}
            placeholder="Lipește tokenul admin"
            onChange={(event) => {
              setToken(event.target.value);
              setMessage("");
            }}
          />
        </label>
      </div>

      <div className="actions">
        <button type="button" onClick={saveToken}>
          Salvează token
        </button>

        <button type="button" className="secondary" onClick={() => setVisible(!visible)}>
          {visible ? "Ascunde" : "Arată"}
        </button>

        <button type="button" className="secondary" onClick={testToken} disabled={!hasToken}>
          Testează token
        </button>

        <button type="button" className="danger" onClick={removeToken}>
          Șterge token
        </button>
      </div>

      <p>
        Status: <strong>{getAdminToken() ? "token salvat" : "token lipsă"}</strong>
      </p>

      {message && <p className="muted">{message}</p>}
    </section>
  );
}


function AdminAutoMetadataQueuePanel({ catalogItems = [], onEdit }) {
  const [queueLimit, setQueueLimit] = useState(12);

  const candidates = useMemo(() => {
    return (catalogItems || [])
      .filter((item) => {
        const title = String(item?.title || "").trim();
        const lowerTitle = title.toLowerCase();
        const metadata = item?.metadata || {};

        if (!title) return false;
        if (lowerTitle.startsWith("bulk youtube")) return false;
        if (lowerTitle.startsWith("bulk tiktok")) return false;
        if (lowerTitle.startsWith("bulk rumble")) return false;
        if (lowerTitle.startsWith("bulk url")) return false;

        const missingPoster = !item.posterUrl;
        const missingGenre = !isRealMetaValue(metadata.genre);
        const missingYear = !isRealMetaValue(metadata.year);

        return missingPoster || missingGenre || missingYear;
      })
      .map((item) => {
        const metadata = item.metadata || {};
        const missing = [];

        if (!item.posterUrl) missing.push("poster");
        if (!isRealMetaValue(metadata.genre)) missing.push("gen");
        if (!isRealMetaValue(metadata.year)) missing.push("an");
        if (!isRealMetaValue(metadata.country)) missing.push("țară");
        if (!isRealMetaValue(metadata.language)) missing.push("limbă");
        if (!isRealMetaValue(metadata.videoQuality || metadata.quality)) missing.push("calitate");

        const confidence = Math.max(10, 100 - missing.length * 12);

        return {
          item,
          metadata,
          missing,
          confidence
        };
      })
      .sort((a, b) => b.missing.length - a.missing.length || a.item.title.localeCompare(b.item.title));
  }, [catalogItems]);

  const visibleCandidates = candidates.slice(0, queueLimit);

  return (
    <div className="changelogBox">
      <div className="sectionHeader">
        <div>
          <h4>Auto Metadata Queue v1</h4>
          <p>Candidate sigure pentru completare poster, gen și an. Bulk-urile sunt excluse.</p>
        </div>
        <span className="pill">{candidates.length} candidate</span>
      </div>

      {candidates.length === 0 ? (
        <p className="empty">Nu există candidate clare pentru metadata automată.</p>
      ) : (
        <>
          <div className="quickActions">
            <button type="button" className="secondary" onClick={() => setQueueLimit((n) => Math.min(n + 12, candidates.length))}>
              Arată mai multe
            </button>
            <button type="button" className="secondary" onClick={() => setQueueLimit(12)}>
              Restrânge
            </button>
          </div>

          <div className="bulkAuditActionList">
            {visibleCandidates.map(({ item, missing, confidence }) => (
              <div className="bulkAuditActionItem" key={item.id || item.title}>
                <strong>{item.title || "Fără titlu"}</strong>
                <div>{item.sourceType || item.source_type || "sursă necunoscută"} · scor candidat {confidence}%</div>
                <div className="metadataBadgeRow">
                  {missing.map((field) => <span key={field}>Lipsește: {field}</span>)}
                </div>
                <button type="button" onClick={() => onEdit?.(item)}>
                  Edit metadata
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AdminPage({ movies, uploads, addMovie, deleteMovie, syncUploadsToAlgolia, lastAlgoliaSync, adminAlgoliaMessage, setAdminAlgoliaMessage, onEdit, setPage }) {
  const [adminCompactMode, setAdminCompactMode] = useState(() => {
    try {
      return localStorage.getItem("cineverse_admin_compact_mode") !== "off";
    } catch {
      return true;
    }
  });

  function toggleAdminCompactMode() {
    const next = !adminCompactMode;
    setAdminCompactMode(next);

    try {
      localStorage.setItem("cineverse_admin_compact_mode", next ? "on" : "off");
    } catch {}
  }
  const [adminCatalogStats, setAdminCatalogStats] = useState(null);
  const [adminCatalogStatsError, setAdminCatalogStatsError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadAdminCatalogStats() {
      try {
        setAdminCatalogStatsError("");
        const response = await fetch(`${API_URL}/catalog/stats`);
        const data = await response.json();

        if (!alive) return;

        if (data?.ok) {
          setAdminCatalogStats(data);
        } else {
          setAdminCatalogStatsError(data?.error || "Nu am putut încărca /catalog/stats");
        }
      } catch (error) {
        if (alive) setAdminCatalogStatsError(String(error?.message || error));
      }
    }

    loadAdminCatalogStats();

    return () => {
      alive = false;
    };
  }, []);

  const adminD1Total = Number(adminCatalogStats?.total || 0);
  const adminUploadTotal = adminD1Total || uploads.length;
  const adminStatsMode = adminD1Total ? "D1 server-side" : "local fallback";

  const [bulkCatalogAuditItems, setBulkCatalogAuditItems] = useState([]);
  const [bulkCatalogAuditError, setBulkCatalogAuditError] = useState("");
  const [bulkCatalogAuditLoading, setBulkCatalogAuditLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadBulkCatalogAuditItems() {
      try {
        setBulkCatalogAuditLoading(true);
        setBulkCatalogAuditError("");

        const data = await apiCatalog({
          page: 1,
          limit: 100,
          sort: "newest"
        });

        if (!alive) return;

        setBulkCatalogAuditItems(Array.isArray(data?.items) ? data.items : []);
      } catch (error) {
        if (alive) setBulkCatalogAuditError(String(error?.message || error));
      } finally {
        if (alive) setBulkCatalogAuditLoading(false);
      }
    }

    loadBulkCatalogAuditItems();

    return () => {
      alive = false;
    };
  }, []);

  const bulkAuditSourceItems = bulkCatalogAuditItems.length ? bulkCatalogAuditItems : uploads;

  const bulkQualityAuditItems = (bulkAuditSourceItems || []).filter((item) => {
    const title = String(item?.title || "").toLowerCase();
    return title.startsWith("bulk youtube") ||
      title.startsWith("bulk tiktok") ||
      title.startsWith("bulk rumble") ||
      title.startsWith("bulk url");
  });

  const bulkQualityAuditLimit = 50;
  const bulkQualityAuditPreview = bulkQualityAuditItems.slice(0, bulkQualityAuditLimit);
  const bulkQualityTitleCounts = bulkQualityAuditItems.reduce((acc, item) => {
    const title = String(item?.title || "").trim();
    if (!title) return acc;
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});

  const bulkDuplicateTitleSet = new Set(
    Object.entries(bulkQualityTitleCounts)
      .filter(([, count]) => count > 1)
      .map(([title]) => title)
  );

  const bulkDuplicateTitleCount = bulkDuplicateTitleSet.size;

  const bulkAuditSourceCounts = bulkQualityAuditItems.reduce((acc, item) => {
    const source = String(item?.source_type || item?.sourceType || "").toLowerCase();

    if (source.includes("youtube")) acc.youtube += 1;
    else if (source.includes("tiktok")) acc.tiktok += 1;
    else if (source.includes("rumble")) acc.rumble += 1;
    else if (source.includes("url")) acc.url += 1;
    else acc.other += 1;

    return acc;
  }, { youtube: 0, tiktok: 0, rumble: 0, url: 0, other: 0 });




  const [bulkAuditActionMessage, setBulkAuditActionMessage] = useState("");
  const [bulkAutoFixEnabled, setBulkAutoFixEnabled] = useState(() => {
    try {
      return localStorage.getItem("cineverse_bulk_auto_fix_enabled") !== "off";
    } catch {
      return true;
    }
  });
  const [bulkAutoFixRan, setBulkAutoFixRan] = useState(false);

  const handleCopyBulkAuditValue = async (item) => {
    const value = item?.value || item?.url || "";
    if (!value) {
      setBulkAuditActionMessage("Nu există link de copiat pentru " + (item?.title || "item"));
      return;
    }

    try {
      await navigator.clipboard?.writeText(value);
      setBulkAuditActionMessage("Link copiat: " + (item?.title || value));
    } catch {
      setBulkAuditActionMessage("Link pregătit: " + value);
    }
  };

  const isMissingBulkMetaValue = (value) => {
    const v = String(value || "").trim().toLowerCase();
    return !v || v === "all" || v === "general" || v === "unknown" || v === "nespecificat";
  };


  function extractBulkVideoId(value = "") {
    const raw = String(value || "");

    try {
      const url = new URL(raw);
      if (url.hostname.includes("youtu.be")) {
        return url.pathname.replace("/", "").split(/[?&/]/)[0] || "";
      }

      if (url.hostname.includes("youtube.com")) {
        return url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || "";
      }
    } catch {}

    const match = raw.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] || "";
  }

  function getFixedBulkTitle(item = {}) {
    const title = String(item.title || "").trim();
    const value = item.value || item.url || item.playableUrl || "";
    const videoId = extractBulkVideoId(value);

    if (/^bulk youtube 001$/i.test(title) && videoId) {
      return `Bulk YouTube ${videoId}`;
    }

    if (/^bulk youtube$/i.test(title) && videoId) {
      return `Bulk YouTube ${videoId}`;
    }

    return title || (videoId ? `Bulk YouTube ${videoId}` : "Bulk Upload");
  }

  const handleFixBulkMissingMetadata = async ({ silent = false } = {}) => {
    const targets = bulkQualityAuditPreview.filter((item) => item?.id);

    if (!targets.length) {
      if (!silent) setBulkAuditActionMessage("Nu există itemuri Bulk de completat.");
      return;
    }

    if (!silent) setBulkAuditActionMessage("Completez metadata lipsă pentru " + targets.length + " itemuri Bulk...");

    let updated = 0;
    let failed = 0;

    for (const item of targets) {
      try {
        const metadata = item.metadata || {};
        const qualityValue = metadata.videoQuality || metadata.quality;

        const nextMetadata = {
          ...metadata,
          category: isMissingBulkMetaValue(metadata.category) ? "Filme" : metadata.category,
          genre: isMissingBulkMetaValue(metadata.genre) ? "General" : metadata.genre,
          country: isMissingBulkMetaValue(metadata.country) ? "Statele Unite" : metadata.country,
          language: isMissingBulkMetaValue(metadata.language) ? "Engleză" : metadata.language,
          videoQuality: isMissingBulkMetaValue(qualityValue) ? "HD" : qualityValue,
          quality: isMissingBulkMetaValue(qualityValue) ? "HD" : qualityValue,
          tags: Array.isArray(metadata.tags) && metadata.tags.length
            ? metadata.tags
            : ["Bulk", item.sourceType || item.source_type || "YouTube", "HD"]
        };

        await apiPut(`/uploads/${item.id}`, {
          title: getFixedBulkTitle(item),
          inputType: item.inputType || item.input_type || "url",
          sourceType: item.sourceType || item.source_type || "YouTube",
          value: item.value || item.url || "",
          posterUrl: item.posterUrl || item.poster_url || "",
          metadata: nextMetadata
        });

        updated += 1;
      } catch (error) {
        console.error(error);
        failed += 1;
      }
    }

    setBulkAuditActionMessage("Bulk metadata completată: " + updated + " actualizate, " + failed + " eșuate. Reîncarc datele...");

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  const isWeakReprocessCandidate = (metadata = {}) => {
    const category = String(metadata.category || "").toLowerCase();
    const genre = String(metadata.genre || "").toLowerCase();
    const country = String(metadata.country || "").toLowerCase();
    const language = String(metadata.language || "").toLowerCase();

    return (
      !metadata.metadataRule ||
      metadata.metadataRule === "fallback-default" ||
      category === "filme" ||
      category === "movies" ||
      genre === "general" ||
      country === "statele unite" ||
      country === "unknown" ||
      language === "engleză" ||
      language === "unknown"
    );
  };

  useEffect(() => {
    if (!bulkAutoFixEnabled) return;
    if (bulkAutoFixRan) return;
    if (!bulkQualityAuditPreview.length) return;

    const sessionKey = "cineverse_bulk_auto_fix_ran_session";

    try {
      if (sessionStorage.getItem(sessionKey) === "yes") return;
      sessionStorage.setItem(sessionKey, "yes");
    } catch {}

    setBulkAutoFixRan(true);
    handleFixBulkMissingMetadata({ silent: true });
  }, [bulkAutoFixEnabled, bulkAutoFixRan, bulkQualityAuditPreview.length]);

  function toggleBulkAutoFix() {
    const next = !bulkAutoFixEnabled;
    setBulkAutoFixEnabled(next);

    try {
      localStorage.setItem("cineverse_bulk_auto_fix_enabled", next ? "on" : "off");
      sessionStorage.removeItem("cineverse_bulk_auto_fix_ran_session");
    } catch {}

    setBulkAutoFixRan(false);
    setBulkAuditActionMessage(next ? "Auto Bulk Fix activat." : "Auto Bulk Fix dezactivat.");
  }

  const handleReprocessOldAiMetadata = async () => {
    const targets = (uploads || [])
      .filter((item) => item?.id)
      .filter((item) => isWeakReprocessCandidate(item.metadata || {}))
      .slice(0, 50);

    if (!targets.length) {
      setBulkAuditActionMessage("Nu există upload-uri vechi potrivite pentru re-procesare AI.");
      return;
    }

    setBulkAuditActionMessage("Reprocesez AI metadata pentru " + targets.length + " upload-uri vechi...");

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const item of targets) {
      try {
        const metadata = item.metadata || {};
        const nextMetadata = completeMetadataWithIntelligence(metadata, {
          title: item.title,
          movieTitle: metadata.movieTitle || item.title,
          category: metadata.category,
          genre: metadata.genre,
          sourceType: item.sourceType || item.source_type,
          url: item.value || item.url,
          notes: metadata.notes,
          description: metadata.description,
          originalTitle: metadata.originalTitle
        });

        if (!nextMetadata.metadataRule || nextMetadata.metadataRule === "fallback-default") {
          skipped += 1;
          continue;
        }

        if (nextMetadata.metadataRule === metadata.metadataRule) {
          skipped += 1;
          continue;
        }

        await apiPut(`/uploads/${item.id}`, {
          title: item.title || "",
          inputType: item.inputType || item.input_type || "url",
          sourceType: item.sourceType || item.source_type || "Other URL",
          value: item.value || item.url || "",
          posterUrl: item.posterUrl || item.poster_url || "",
          metadata: nextMetadata
        });

        updated += 1;
      } catch (error) {
        console.error(error);
        failed += 1;
      }
    }

    setBulkAuditActionMessage(
      "AI reprocess finalizat: " +
      updated + " actualizate, " +
      skipped + " ignorate, " +
      failed + " eșuate. Reîncarc datele..."
    );

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  };

  return (
    <main>
      <section className={`section admin ${adminCompactMode ? "adminCompactMode" : ""}`}>
        <div className="sectionHeader adminCompactHeader">
          <div>
            <h2>Admin Center</h2>
            <p>Audit, bulk fix, token, Algolia și diagnostic platformă.</p>
          </div>
          <button type="button" className="secondary" onClick={toggleAdminCompactMode}>
            Compact Mode: {adminCompactMode ? "ON" : "OFF"}
          </button>
        </div>
        <AdminMetadataSearch />
        <AdminMetadataAuditPanel uploads={uploads} onEdit={onEdit} onGoToLibrary={() => setPage?.("library")} />

        <div className="details">
          <div>
            <div className="changelogBox">
              <h4>Bulk Import Stability Snapshot</h4>
              <p>Stare modul Bulk Import AI Metadata după validare manuală.</p>
              <ul>
                <li>Bulk Import: v19.1 stabil</li>
                <li>YouTube bulk: OK</li>
                <li>TikTok bulk: OK</li>
                <li>Apply metadata pe Bulk: OK</li>
                <li>AI Queue complete state: OK</li>
                <li>Protecție formular gol: OK</li>
              </ul>
            </div>

            <div className="changelogBox">
              <h4>Bulk Import Quality Audit v2</h4>
              <p>Itemuri Bulk rămase cu titlu temporar. Nu se șterge nimic automat.</p>
              <p className="mutedText">
                Sursă audit: {bulkCatalogAuditItems.length ? `/catalog (${bulkCatalogAuditItems.length} itemuri)` : `uploads local (${uploads.length} itemuri)`}
                {bulkCatalogAuditLoading ? " · se încarcă..." : ""}
                {bulkCatalogAuditError ? ` · ${bulkCatalogAuditError}` : ""}
              </p>
              <ul>
                <li>Total Bulk temporare: {bulkQualityAuditItems.length}</li>
                <li>Afișate: {bulkQualityAuditPreview.length}</li>
                <li>Mod: audit scalabil limitat</li>
                <li>Limită afișare: {bulkQualityAuditLimit}</li>
                <li>Titluri duplicate temporare: {bulkDuplicateTitleCount}</li>
                <li>Surse temporare:</li>
                <li>YouTube: {bulkAuditSourceCounts.youtube}</li>
                <li>TikTok: {bulkAuditSourceCounts.tiktok}</li>
                <li>Rumble: {bulkAuditSourceCounts.rumble}</li>
                <li>URL: {bulkAuditSourceCounts.url}</li>
                <li>Other: {bulkAuditSourceCounts.other}</li>
              </ul>
              <div className="quickActions">
                <button type="button" className="secondary" onClick={() => handleFixBulkMissingMetadata()}>
                  Completează Bulk lipsuri
                </button>
                <button type="button" className="secondary" onClick={toggleBulkAutoFix}>
                  Auto Bulk Fix: {bulkAutoFixEnabled ? "ON" : "OFF"}
                </button>
                <button type="button" className="secondary" onClick={handleReprocessOldAiMetadata}>
                  Reprocesează AI metadata vechi
                </button>
              </div>
              {bulkAuditActionMessage && <p className="mutedText">{bulkAuditActionMessage}</p>}
              {bulkQualityAuditItems.length > bulkQualityAuditLimit && (
                <p className="mutedText">
                  Sunt afișate primele {bulkQualityAuditLimit} itemuri din {bulkQualityAuditItems.length}. Pentru biblioteci mari, folosește procesare pe loturi.
                </p>
              )}
              {bulkQualityAuditPreview.length > 0 ? (
                <div className="bulkAuditActionList">
                  {bulkQualityAuditPreview.map((item, index) => (
                    <div className="bulkAuditActionItem" key={item.id || item.title}>
                      <strong>#{index + 1} {item.title}</strong>
                      {bulkDuplicateTitleSet.has(item.title) && (
                        <span className="bulkDuplicateWarning">Titlu temporar duplicat</span>
                      )}
                      <span className="mutedText">{item.source_type || item.sourceType || "sursă necunoscută"}</span>
                      <span className="mutedText">{item.value || item.url || "fără link"}</span>
                      <button type="button" className="secondary" onClick={() => handleCopyBulkAuditValue(item)}>
                        Copiază link
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nu există itemuri Bulk temporare în audit.</p>
              )}
            </div>

            <AdminAutoMetadataQueuePanel catalogItems={bulkAuditSourceItems} onEdit={onEdit} />

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
        <AdminTokenPanel />
        <p className="mutedText">Stats Admin: {adminStatsMode}{adminCatalogStatsError ? ` · ${adminCatalogStatsError}` : ""}</p>
        <div className="stats">
          <div><strong>{movies.length}</strong><span>Filme</span></div>
          <div><strong>{adminUploadTotal}</strong><span>Upload-uri</span></div>
          <div><strong>ON</strong><span>D1</span></div>
        </div>

        <div className="details">
          <div>
            <span className="pill">Algolia</span>
            <h3>Algolia Status Panel</h3>
            <p>Indexează toate upload-urile din Cloudflare D1 în Algolia uploads și verifică statusul ultimului sync.</p>

            <div className="stats">
              <div><strong>{adminUploadTotal}</strong><span>Upload-uri D1</span></div>
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
        <div className="details">
          <div>
            <h2>Gestionare conținut</h2>
            <p>Adăugarea filmelor și completarea metadata se fac acum din pagina Upload și din Edit metadata.</p>
            <p className="mutedText">Formularul vechi „Adaugă film” din Admin a fost retras ca să nu dubleze fluxul principal de upload-uri.</p>
            <button type="button" className="secondary" onClick={() => setPage?.("upload")}>Mergi la Upload</button>
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
