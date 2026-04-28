import React, { useEffect, useState } from "react";
import { Search, Sparkles, Wand2 } from "lucide-react";
import { apiGet, apiPut } from "./api";

export default function UploadMetadataSearch({
  metadataSearchSeed,
  clearMetadataSearchSeed,
  selectedBulkMetadataTarget,
  clearSelectedBulkMetadataTarget,
  onDataChanged
} = {}) {
  const [query, setQuery] = useState("avatar");

  useEffect(() => {
    if (metadataSearchSeed && metadataSearchSeed !== query) {
      setBulkApplyFeedback(null);
      setQuery(metadataSearchSeed);
      clearMetadataSearchSeed?.();
    }
  }, [metadataSearchSeed, query, clearMetadataSearchSeed]);
  const [type, setType] = useState("movie");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [bulkApplyFeedback, setBulkApplyFeedback] = useState(null);

  async function search(event) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      let path = `/search-metadata?q=${encodeURIComponent(query)}`;

      if (type === "anime") {
        path = `/anime?q=${encodeURIComponent(query)}`;
      }

      if (type === "imdb") {
        path = `/imdb?q=${encodeURIComponent(query)}`;
      }

      const data = await apiGet(path);
      setResults(data);
    } catch (error) {
      setResults({ ok: false, error: error.message });
    }

    setLoading(false);
  }

  function readField(name) {
    const element = document.querySelector(`[name="${name}"]`);
    return element ? element.value || "" : "";
  }

  function getBulkApplyReadiness() {
    const form = readUploadFormForBulkApply();
    const validation = validateBulkApplyForm(form);

    return {
      ready: validation.ok,
      title: form.title || form.movieTitle || "",
      posterApplied: Boolean(form.posterUrl && form.posterUrl !== "https://site.com/poster.jpg"),
      trailerApplied: Boolean(form.value && form.value !== "https://youtube.com/watch?v=..."),
      message: validation.ok
        ? "Metadata pregătită. Poți aplica pe Bulk selectat."
        : "Întâi caută metadata și apasă Folosește + trailer."
    };
  }

  function validateBulkApplyForm(form) {
    const title = String(form.title || form.movieTitle || "").trim();
    const poster = String(form.posterUrl || "").trim();
    const value = String(form.value || "").trim();
    const notes = String(form.notes || "").trim();

    const titleLooksDefault =
      !title ||
      title.includes("Ex:") ||
      title.toLowerCase().includes("bulk youtube");

    const posterLooksDefault =
      !poster ||
      poster === "https://site.com/poster.jpg";

    const valueLooksDefault =
      !value ||
      value === "https://youtube.com/watch?v=..." ||
      value === "<iframe src=\"...\"></iframe>";

    if (titleLooksDefault) {
      return {
        ok: false,
        message: "Nu poți aplica metadata: titlul nu este completat cu un rezultat real."
      };
    }

    if (posterLooksDefault && valueLooksDefault && !notes) {
      return {
        ok: false,
        message: "Nu poți aplica metadata: formularul pare gol/default. Apasă întâi Folosește + trailer pe un rezultat."
      };
    }

    return { ok: true, message: "OK" };
  }

  function readUploadFormForBulkApply() {
    const notes = readField("notes");
    let parsedNotes = {};

    try {
      parsedNotes = notes ? JSON.parse(notes) : {};
    } catch {
      parsedNotes = { notes };
    }

    return {
      title: readField("title"),
      movieTitle: readField("movieTitle"),
      posterUrl: readField("posterUrl"),
      sourceType: readField("sourceType"),
      inputType: readField("inputType"),
      value: readField("value"),
      season: readField("season"),
      episode: readField("episode"),
      quality: readField("quality"),
      notes,
      parsedNotes
    };
  }

  function fillField(name, value) {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) element.value = value || "";
  }

  async function applyMetadataToSelectedBulk() {
    if (!selectedBulkMetadataTarget?.id) {
      alert("Nu există Bulk selectat pentru aplicare metadata.");
      return;
    }

    const form = readUploadFormForBulkApply();
    const validation = validateBulkApplyForm(form);

    if (!validation.ok) {
      setBulkApplyFeedback({
        status: "error",
        oldTitle: selectedBulkMetadataTarget.title,
        newTitle: form.title || form.movieTitle || "",
        posterApplied: Boolean(form.posterUrl),
        trailerApplied: Boolean(form.value),
        message: validation.message
      });
      alert(validation.message);
      return;
    }

    const okConfirm = window.confirm(`Aplici metadata pe "${selectedBulkMetadataTarget.title}"?`);
    if (!okConfirm) return;

    const currentMetadataRaw = selectedBulkMetadataTarget.metadata;
    let currentMetadata = {};

    try {
      currentMetadata = typeof currentMetadataRaw === "string"
        ? JSON.parse(currentMetadataRaw)
        : currentMetadataRaw || {};
    } catch {
      currentMetadata = {};
    }

    const nextMetadata = {
      ...currentMetadata,
      ...form.parsedNotes,
      movieTitle: form.movieTitle || form.title || currentMetadata.movieTitle || selectedBulkMetadataTarget.title,
      season: form.season,
      episode: form.episode,
      quality: form.quality,
      notes: form.notes,
      bulkImport: true,
      aiMetadata: true,
      needsAiMetadata: false,
      aiMetadataStatus: "applied-from-search",
      aiMetadataAppliedAt: new Date().toISOString()
    };

    const payload = {
      title: form.title || form.movieTitle || selectedBulkMetadataTarget.title,
      input_type: form.inputType || selectedBulkMetadataTarget.input_type || "url",
      source_type: form.sourceType || selectedBulkMetadataTarget.source_type || "YouTube",
      value: form.value || selectedBulkMetadataTarget.value || "",
      poster_url: form.posterUrl || selectedBulkMetadataTarget.poster_url || "",
      metadata: nextMetadata
    };

    try {
      await apiPut("/uploads/" + encodeURIComponent(selectedBulkMetadataTarget.id), payload);

      setBulkApplyFeedback({
        status: "ok",
        oldTitle: selectedBulkMetadataTarget.title,
        newTitle: payload.title,
        posterApplied: Boolean(payload.poster_url),
        trailerApplied: Boolean(payload.value),
        message: "Metadata aplicată pe Bulk selectat."
      });

      alert("Metadata aplicată pe Bulk selectat.");
      clearSelectedBulkMetadataTarget?.();
      await onDataChanged?.();
    } catch (error) {
      alert("Eroare la aplicarea metadata pe Bulk: " + (error?.message || "necunoscută"));
    }
  }

  async function fillFromTmdb(item) {
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : "";

    let trailerUrl = "";

    try {
      const videos = await apiGet(`/tmdb-videos?id=${encodeURIComponent(item.id)}`);
      trailerUrl = videos.youtubeUrl || videos.embedUrl || "";
    } catch {
      trailerUrl = "";
    }

    fillField("title", item.title || "");
    fillField("movieTitle", item.title || "");
    fillField("posterUrl", poster);

    if (trailerUrl) {
      fillField("value", trailerUrl);
    }

    fillField(
      "notes",
      JSON.stringify(
        {
          source: "TMDB",
          originalTitle: item.original_title,
          year: item.release_date ? item.release_date.slice(0, 4) : "",
          rating: item.vote_average,
          description: item.overview,
          tmdbId: item.id,
          trailerUrl
        },
        null,
        2
      )
    );

    alert(
      trailerUrl
        ? "Metadata TMDB + trailer completate în Upload."
        : "Metadata TMDB completată. Nu am găsit trailer automat, pune manual URL/iframe."
    );
  }

  function fillFromOmdb(item) {
    fillField("title", item.Title || "");
    fillField("movieTitle", item.Title || "");
    fillField("posterUrl", item.Poster && item.Poster !== "N/A" ? item.Poster : "");
    fillField(
      "notes",
      JSON.stringify(
        {
          source: "OMDb / IMDb",
          year: item.Year,
          imdbID: item.imdbID,
          type: item.Type
        },
        null,
        2
      )
    );

    alert("Metadata OMDb/IMDb completată în Upload. Pentru video, pune manual URL/iframe.");
  }

  function fillFromAnime(item, source) {
    let title = "";
    let poster = "";
    let description = "";
    let year = "";
    let score = "";
    let trailerUrl = "";

    if (source === "jikan") {
      title = item.title || "";
      poster = item.images?.jpg?.image_url || "";
      description = item.synopsis || "";
      year = item.year || "";
      score = item.score || "";
      trailerUrl = item.trailer?.url || item.trailer?.embed_url || "";
    }

    if (source === "anilist") {
      title = item.title?.romaji || item.title?.english || "";
      poster = item.coverImage?.large || "";
      description = item.description || "";
      year = item.seasonYear || "";
      score = item.averageScore || "";
    }

    if (source === "kitsu") {
      title = item.attributes?.canonicalTitle || "";
      poster = item.attributes?.posterImage?.medium || "";
      description = item.attributes?.synopsis || "";
      year = item.attributes?.startDate || "";
      score = item.attributes?.averageRating || "";
    }

    fillField("title", title);
    fillField("movieTitle", title);
    fillField("posterUrl", poster);

    if (trailerUrl) {
      fillField("value", trailerUrl);
    }

    fillField(
      "notes",
      JSON.stringify(
        {
          source,
          category: "Anime",
          year,
          score,
          description,
          trailerUrl
        },
        null,
        2
      )
    );

    alert(
      trailerUrl
        ? "Metadata Anime + trailer completate în Upload."
        : "Metadata Anime completată. Pentru video, pune manual URL/iframe."
    );
  }

  const bulkApplyReadiness = selectedBulkMetadataTarget
    ? getBulkApplyReadiness()
    : null;

  const tmdb = results?.tmdb || [];
  const omdb = results?.omdb || results?.results || [];
  const jikan = results?.jikan || results?.results || [];
  const anilist = results?.anilist || [];
  const kitsu = results?.kitsu || [];

  return (
    <section className="section metadataSearchBox">
      <h2><Sparkles size={24} /> Upload AI Metadata</h2>
      <p>Caută metadata și completează automat formularul Upload. TMDB poate completa și trailer YouTube automat.</p>

      <form className="toolbar" onSubmit={search}>
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="movie">TMDB + OMDb</option>
          <option value="imdb">IMDb / OMDb</option>
          <option value="anime">Anime</option>
        </select>

        <div className="searchBox compact">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: Avatar, Naruto, Squid Game..."
          />
        </div>

        <button type="submit">
          {loading ? "Se caută..." : "Caută metadata"}
        </button>

        {bulkApplyFeedback && (
          <div className="bulkApplyFeedbackBox">
            <span className="pill">{bulkApplyFeedback.status === "error" ? "Bulk apply blocat" : "Bulk apply OK"}</span>
            <strong>{bulkApplyFeedback.message}</strong>
            <span className="mutedText">Titlu vechi: {bulkApplyFeedback.oldTitle}</span>
            <span className="mutedText">Titlu nou: {bulkApplyFeedback.newTitle}</span>
            <span className="mutedText">Poster aplicat: {bulkApplyFeedback.posterApplied ? "DA" : "NU"}</span>
            <span className="mutedText">Trailer/URL aplicat: {bulkApplyFeedback.trailerApplied ? "DA" : "NU"}</span>
            {bulkApplyFeedback.status !== "error" && (
              <span className="mutedText">Apasă Scanează AI queue pentru lista actualizată.</span>
            )}
            <button type="button" className="secondary" onClick={() => setBulkApplyFeedback(null)}>
              Închide feedback
            </button>
          </div>
        )}

        {selectedBulkMetadataTarget && (
          <div className="bulkMetadataApplyBox">
            <span className="pill">Bulk selectat</span>
            <strong>{selectedBulkMetadataTarget.title}</strong>
            <small>{selectedBulkMetadataTarget.value}</small>
            <div className={bulkApplyReadiness?.ready ? "bulkApplyReadyBox" : "bulkApplyHelpBox"}>
              <span className="mutedText">{bulkApplyReadiness?.message}</span>
              <span className="mutedText">Titlu detectat: {bulkApplyReadiness?.title || "-"}</span>
              <span className="mutedText">Poster pregătit: {bulkApplyReadiness?.posterApplied ? "DA" : "NU"}</span>
              <span className="mutedText">Trailer/URL pregătit: {bulkApplyReadiness?.trailerApplied ? "DA" : "NU"}</span>
            </div>
            <button
              type="button"
              className="secondary"
              onClick={applyMetadataToSelectedBulk}
              disabled={!bulkApplyReadiness?.ready}
              title={bulkApplyReadiness?.ready ? "Aplică metadata pe Bulk selectat" : "Întâi apasă Folosește + trailer pe un rezultat"}
            >
              Aplică metadata pe Bulk selectat
            </button>
            <button type="button" className="secondary" onClick={clearSelectedBulkMetadataTarget}>
              Renunță Bulk selectat
            </button>
          </div>
        )}
      </form>

      {results?.ok === false && <p className="empty">{results.error}</p>}

      {tmdb.length > 0 && (
        <div className="metadataResults">
          <h3>TMDB</h3>
          <div className="resultGrid">
            {tmdb.slice(0, 8).map((item) => (
              <article className="resultCard" key={`upload-tmdb-${item.id}`}>
                {item.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.title}</h3>
                  <p className="resultSubtitle">{item.release_date || "N/A"} · ⭐ {item.vote_average || "-"}</p>
                  <p>{item.overview?.slice(0, 160) || "Fără descriere."}</p>

                  <button type="button" onClick={() => fillFromTmdb(item)}>
                    <Wand2 size={16} />
                    Folosește + trailer
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {omdb.length > 0 && type !== "anime" && (
        <div className="metadataResults">
          <h3>OMDb / IMDb</h3>
          <div className="resultGrid">
            {omdb.slice(0, 8).map((item) => (
              <article className="resultCard" key={`upload-omdb-${item.imdbID}`}>
                {item.Poster && item.Poster !== "N/A" ? (
                  <img src={item.Poster} alt={item.Title} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.Title}</h3>
                  <p className="resultSubtitle">{item.Year} · {item.Type} · {item.imdbID}</p>

                  <button type="button" onClick={() => fillFromOmdb(item)}>
                    <Wand2 size={16} />
                    Folosește în Upload
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {type === "anime" && jikan.length > 0 && (
        <div className="metadataResults">
          <h3>Anime / Jikan</h3>
          <div className="resultGrid">
            {jikan.slice(0, 8).map((item) => (
              <article className="resultCard" key={`upload-jikan-${item.mal_id}`}>
                {item.images?.jpg?.image_url ? (
                  <img src={item.images.jpg.image_url} alt={item.title} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.title}</h3>
                  <p className="resultSubtitle">{item.year || "N/A"} · ⭐ {item.score || "-"}</p>
                  <p>{item.synopsis?.slice(0, 160) || "Fără descriere."}</p>

                  <button type="button" onClick={() => fillFromAnime(item, "jikan")}>
                    <Wand2 size={16} />
                    Folosește în Upload
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {type === "anime" && anilist.length > 0 && (
        <div className="metadataResults">
          <h3>AniList</h3>
          <div className="resultGrid">
            {anilist.slice(0, 8).map((item) => (
              <article className="resultCard" key={`upload-anilist-${item.id}`}>
                {item.coverImage?.large ? (
                  <img src={item.coverImage.large} alt={item.title?.romaji} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.title?.romaji || item.title?.english}</h3>
                  <p className="resultSubtitle">{item.seasonYear || "N/A"} · {item.averageScore || "-"}%</p>

                  <button type="button" onClick={() => fillFromAnime(item, "anilist")}>
                    <Wand2 size={16} />
                    Folosește în Upload
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {type === "anime" && kitsu.length > 0 && (
        <div className="metadataResults">
          <h3>Kitsu</h3>
          <div className="resultGrid">
            {kitsu.slice(0, 8).map((item) => (
              <article className="resultCard" key={`upload-kitsu-${item.id}`}>
                {item.attributes?.posterImage?.medium ? (
                  <img src={item.attributes.posterImage.medium} alt={item.attributes?.canonicalTitle} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.attributes?.canonicalTitle}</h3>
                  <p className="resultSubtitle">{item.attributes?.startDate || "N/A"} · {item.attributes?.averageRating || "-"}</p>

                  <button type="button" onClick={() => fillFromAnime(item, "kitsu")}>
                    <Wand2 size={16} />
                    Folosește în Upload
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
