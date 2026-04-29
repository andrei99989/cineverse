import React, { useMemo, useState } from "react";
import { Save, X, Wand2 } from "lucide-react";

function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function stringToTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function safeParseJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function getNotesMetadata(metadata = {}) {
  if (!metadata.notes) return {};
  if (typeof metadata.notes === "object") return metadata.notes;
  if (typeof metadata.notes !== "string") return {};

  try {
    return JSON.parse(metadata.notes);
  } catch {
    return {};
  }
}

function guessCategory(metadata = {}, notes = {}) {
  const value = metadata.category || metadata.contentType || "";
  if (value && value !== "Other") return value;
  return "Movies";
}

function buildAiQuickMetadata(metadata = {}) {
  const notes = getNotesMetadata(metadata);
  const originalTitle = notes.originalTitle || metadata.originalTitle || metadata.movieTitle || "";
  const title = metadata.movieTitle || originalTitle || "";

  const franchise =
    metadata.franchise ||
    (title.toLowerCase().includes("harry potter") ? "Harry Potter" : "") ||
    (title.toLowerCase().includes("avatar") ? "Avatar" : "") ||
    (title.toLowerCase().includes("naruto") ? "Naruto" : "") ||
    (title.toLowerCase().includes("lord of the rings") || title.toLowerCase().includes("stăpânul inelelor") ? "Lord of the Rings" : "") ||
    (title.toLowerCase().includes("spider") ? "Spider-Man" : "");

  const collection =
    metadata.collection ||
    (franchise ? `${franchise} Collection` : "");

  const genre =
    metadata.genre && metadata.genre !== "General"
      ? metadata.genre
      : title.toLowerCase().includes("harry potter")
        ? "Fantasy"
        : title.toLowerCase().includes("avatar")
          ? "Sci-Fi"
          : title.toLowerCase().includes("naruto")
            ? "Anime"
            : metadata.genre || "";

  const tags = Array.from(new Set([
    metadata.sourceType || "YouTube",
    metadata.contentType || "Trailer",
    genre,
    franchise,
    ...(Array.isArray(metadata.tags) ? metadata.tags : [])
  ].filter(Boolean)));

  return {
    year: metadata.year || notes.year || "",
    genre,
    category: guessCategory(metadata, notes),
    collection,
    franchise,
    tags
  };
}

export default function EditUploadModal({ upload, onClose, onSave }) {
  if (!upload) return null;

  const metadata = upload.metadata || {};
  const aiQuickMetadata = useMemo(() => buildAiQuickMetadata(metadata), [upload?.id]);
  const [aiMetadataOn, setAiMetadataOn] = useState(false);

  const [quickYear, setQuickYear] = useState(metadata.year || "");
  const [quickGenre, setQuickGenre] = useState(metadata.genre || "");
  const [quickCategory, setQuickCategory] = useState(metadata.category || "");
  const [quickCollection, setQuickCollection] = useState(metadata.collection || "");
  const [quickFranchise, setQuickFranchise] = useState(metadata.franchise || "");
  const [quickCountry, setQuickCountry] = useState(metadata.country || "");
  const [quickLanguage, setQuickLanguage] = useState(metadata.language || "");
  const [quickVideoQuality, setQuickVideoQuality] = useState(metadata.videoQuality || metadata.quality || "");
  const [quickSubtitleLanguage, setQuickSubtitleLanguage] = useState(metadata.subtitleLanguage || "");
  const [quickDubbingLanguage, setQuickDubbingLanguage] = useState(metadata.dubbingLanguage || "");
  const [quickTags, setQuickTags] = useState(tagsToString(metadata.tags));

  function applyAiMetadata() {
    setAiMetadataOn(true);
    setQuickYear(aiQuickMetadata.year || "");
    setQuickGenre(aiQuickMetadata.genre || "");
    setQuickCategory(aiQuickMetadata.category || "Movies");
    setQuickCollection(aiQuickMetadata.collection || "");
    setQuickFranchise(aiQuickMetadata.franchise || "");
    setQuickTags(tagsToString(aiQuickMetadata.tags));
  }

  function submit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const parsedMetadata = safeParseJson(form.get("metadata") || "{}");

    const quickMetadata = {
      ...parsedMetadata,
      year: quickYear || "",
      genre: quickGenre || "",
      category: quickCategory || "",
      collection: quickCollection || "",
      franchise: quickFranchise || "",
      country: quickCountry || "",
      language: quickLanguage || "",
      videoQuality: quickVideoQuality || "",
      quality: quickVideoQuality || "",
      subtitleLanguage: quickSubtitleLanguage || "",
      dubbingLanguage: quickDubbingLanguage || "",
      tags: stringToTags(quickTags),
      aiMetadataMode: aiMetadataOn ? "on" : "manual"
    };

    onSave(upload.id, {
      title: form.get("title"),
      inputType: form.get("inputType"),
      sourceType: form.get("sourceType"),
      value: form.get("value"),
      posterUrl: form.get("posterUrl"),
      metadata: quickMetadata
    });
  }

  return (
    <div className="playerOverlay">
      <div className="playerShell editModal">
        <div className="playerTop">
          <div>
            <span className="pill">Edit Upload</span>
            <h2>Editează postarea</h2>
          </div>

          <button className="danger" onClick={onClose}>
            <X size={18} />
            Închide
          </button>
        </div>

        <form className="movieForm" onSubmit={submit}>
          <label>Titlu postare</label>
          <input name="title" defaultValue={upload.title || ""} required />

          <label>Poster URL</label>
          <input name="posterUrl" defaultValue={upload.posterUrl || ""} />

          <label>Tip sursă</label>
          <select name="sourceType" defaultValue={upload.sourceType || "Other URL"}>
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
          <select name="inputType" defaultValue={upload.inputType || "url"}>
            <option value="url">URL link</option>
            <option value="iframe">Cod iframe</option>
          </select>

          <label>URL real sau iframe</label>
          <textarea name="value" defaultValue={upload.value || ""} required />

          <div className="details">
            <div>
              <h3>AI Metadata</h3>
              <p>ON completează automat câmpurile rapide din metadata detectată. OFF lasă editarea manuală.</p>

              <div className="row">
                <button type="button" className={aiMetadataOn ? "success" : "secondary"} onClick={applyAiMetadata}>
                  <Wand2 size={16} />
                  AI Metadata ON
                </button>

                <button type="button" className={!aiMetadataOn ? "success" : "secondary"} onClick={() => setAiMetadataOn(false)}>
                  AI Metadata OFF
                </button>
              </div>
            </div>
          </div>

          <div className="details">
            <div>
              <h3>Metadata rapide</h3>
              <p>Completează câmpurile principale fără să editezi manual JSON-ul.</p>

              <div className="formGrid">
                <label>
                  An
                  <input value={quickYear} onChange={(event) => setQuickYear(event.target.value)} placeholder="2025" />
                </label>

                <label>
                  Gen
                  <input value={quickGenre} onChange={(event) => setQuickGenre(event.target.value)} placeholder="Sci-Fi" />
                </label>

                <label>
                  Categorie
                  <input value={quickCategory} onChange={(event) => setQuickCategory(event.target.value)} placeholder="Movies" />
                </label>

                <label>
                  Colecție
                  <input value={quickCollection} onChange={(event) => setQuickCollection(event.target.value)} placeholder="Avatar Collection" />
                </label>

                <label>
                  Franciză
                  <input value={quickFranchise} onChange={(event) => setQuickFranchise(event.target.value)} placeholder="Avatar" />
                </label>

                <label>
                  Țară
                  <select value={quickCountry} onChange={(event) => setQuickCountry(event.target.value)}>
                    <option value="">Nespecificat</option>
                    <option value="Statele Unite">Statele Unite</option>
                    <option value="România">România</option>
                    <option value="Japonia">Japonia</option>
                    <option value="India">India</option>
                    <option value="Coreea de Sud">Coreea de Sud</option>
                    <option value="Turcia">Turcia</option>
                    <option value="Brazilia">Brazilia</option>
                    <option value="Franța">Franța</option>
                    <option value="Regatul Unit">Regatul Unit</option>
                  </select>
                </label>

                <label>
                  Limbă
                  <select value={quickLanguage} onChange={(event) => setQuickLanguage(event.target.value)}>
                    <option value="">Nespecificat</option>
                    <option value="Engleză">Engleză</option>
                    <option value="Română">Română</option>
                    <option value="Japoneză">Japoneză</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Coreeană">Coreeană</option>
                    <option value="Turcă">Turcă</option>
                    <option value="Franceză">Franceză</option>
                    <option value="Germană">Germană</option>
                  </select>
                </label>

                <label>
                  Calitate video
                  <select value={quickVideoQuality} onChange={(event) => setQuickVideoQuality(event.target.value)}>
                    <option value="">Nespecificat</option>
                    <option value="HD">HD</option>
                    <option value="Full HD">Full HD</option>
                    <option value="4K">4K</option>
                    <option value="CAM">CAM</option>
                    <option value="Trailer">Trailer</option>
                  </select>
                </label>

                <label>
                  Subtitrare
                  <select value={quickSubtitleLanguage} onChange={(event) => setQuickSubtitleLanguage(event.target.value)}>
                    <option value="">Fără / Nespecificat</option>
                    <option value="Română">Română</option>
                    <option value="Engleză">Engleză</option>
                  </select>
                </label>

                <label>
                  Dublaj
                  <select value={quickDubbingLanguage} onChange={(event) => setQuickDubbingLanguage(event.target.value)}>
                    <option value="">Fără / Nespecificat</option>
                    <option value="Română">Română</option>
                    <option value="Engleză">Engleză</option>
                  </select>
                </label>

                <label>
                  Tags
                  <input value={quickTags} onChange={(event) => setQuickTags(event.target.value)} placeholder="YouTube, Trailer, Sci-Fi, Avatar" />
                </label>
              </div>
            </div>
          </div>

          <label>Metadata JSON</label>
          <textarea
            name="metadata"
            defaultValue={JSON.stringify(upload.metadata || {}, null, 2)}
            rows={12}
          />

          <button type="submit">
            <Save size={18} />
            Salvează modificările
          </button>
        </form>
      </div>
    </div>
  );
}
