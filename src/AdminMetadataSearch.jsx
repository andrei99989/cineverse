import React, { useState } from "react";
import { Search, Sparkles, Wand2 } from "lucide-react";
import { apiGet } from "./api";

export default function AdminMetadataSearch() {
  const [query, setQuery] = useState("avatar");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  async function searchMetadata(event) {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    try {
      const data = await apiGet(`/search-metadata?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch (error) {
      setResults({ ok: false, error: error.message });
    }

    setLoading(false);
  }

  function fillField(name, value) {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) element.value = value || "";
  }

  function fillFormFromTmdb(item) {
    fillField("title", item.title);
    fillField("originalTitle", item.original_title || item.title);
    fillField("year", item.release_date ? item.release_date.slice(0, 4) : "");
    fillField("genre", "Movie");
    fillField("rating", item.vote_average ? Number(item.vote_average).toFixed(1) : "");
    fillField("duration", "N/A");
    fillField("posterUrl", item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "");
    fillField("language", item.original_language || "");
    fillField("country", "");
    fillField("director", "");
    fillField("description", item.overview || "");
    alert("Metadata TMDB completată în formular.");
  }

  function fillFormFromOmdb(item) {
    fillField("title", item.Title);
    fillField("originalTitle", item.Title);
    fillField("year", String(item.Year || "").slice(0, 4));
    fillField("genre", item.Type || "Movie");
    fillField("rating", "");
    fillField("duration", "N/A");
    fillField("posterUrl", item.Poster && item.Poster !== "N/A" ? item.Poster : "");
    fillField("language", "");
    fillField("country", "");
    fillField("director", "");
    fillField("description", `IMDb ID: ${item.imdbID || ""}`);
    alert("Metadata OMDb/IMDb completată în formular.");
  }

  return (
    <section className="section metadataSearchBox">
      <h2><Sparkles size={24} /> AI Metadata Search</h2>
      <p>Caută metadata din TMDB și OMDb/IMDb, apoi apasă „Folosește” ca să completezi formularul de film.</p>

      <form className="toolbar" onSubmit={searchMetadata}>
        <div className="searchBox compact">
          <Search size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: Avatar, RRR, Squid Game..."
          />
        </div>

        <button type="submit">
          {loading ? "Se caută..." : "Caută metadata"}
        </button>
      </form>

      {results?.ok === false && <p className="empty">{results.error}</p>}

      {results?.tmdb?.length > 0 && (
        <div className="metadataResults">
          <h3>TMDB</h3>
          <div className="resultGrid">
            {results.tmdb.slice(0, 8).map((item) => (
              <article className="resultCard" key={`tmdb-${item.id}`}>
                {item.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.title}</h3>
                  <p className="resultSubtitle">{item.release_date || "N/A"} · ⭐ {item.vote_average || "-"}</p>
                  <p>{item.overview?.slice(0, 180) || "Fără descriere."}</p>

                  <button type="button" onClick={() => fillFormFromTmdb(item)}>
                    <Wand2 size={16} />
                    Folosește
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {results?.omdb?.length > 0 && (
        <div className="metadataResults">
          <h3>OMDb / IMDb</h3>
          <div className="resultGrid">
            {results.omdb.slice(0, 8).map((item) => (
              <article className="resultCard" key={`omdb-${item.imdbID}`}>
                {item.Poster && item.Poster !== "N/A" ? (
                  <img src={item.Poster} alt={item.Title} />
                ) : (
                  <div className="resultNoImage">No image</div>
                )}

                <div className="resultBody">
                  <h3>{item.Title}</h3>
                  <p className="resultSubtitle">{item.Year} · {item.Type} · {item.imdbID}</p>

                  <button type="button" onClick={() => fillFormFromOmdb(item)}>
                    <Wand2 size={16} />
                    Folosește
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
