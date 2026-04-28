import React from "react";
import { Save, X } from "lucide-react";

function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function stringToTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function EditUploadModal({ upload, onClose, onSave }) {
  if (!upload) return null;

  const metadata = upload.metadata || {};

  function submit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(form.get("metadata") || "{}");
    } catch {
      alert("Metadata trebuie să fie JSON valid.");
      return;
    }

    const quickMetadata = {
      ...parsedMetadata,
      year: form.get("year") || "",
      genre: form.get("genre") || "",
      category: form.get("category") || "",
      collection: form.get("collection") || "",
      franchise: form.get("franchise") || "",
      tags: stringToTags(form.get("tags"))
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
              <h3>Metadata rapide</h3>
              <p>Completează câmpurile principale fără să editezi manual JSON-ul.</p>

              <div className="formGrid">
                <label>
                  An
                  <input name="year" defaultValue={metadata.year || ""} placeholder="2025" />
                </label>

                <label>
                  Gen
                  <input name="genre" defaultValue={metadata.genre || ""} placeholder="Sci-Fi" />
                </label>

                <label>
                  Categorie
                  <input name="category" defaultValue={metadata.category || ""} placeholder="Movies" />
                </label>

                <label>
                  Colecție
                  <input name="collection" defaultValue={metadata.collection || ""} placeholder="Avatar Collection" />
                </label>

                <label>
                  Franciză
                  <input name="franchise" defaultValue={metadata.franchise || ""} placeholder="Avatar" />
                </label>

                <label>
                  Tags
                  <input name="tags" defaultValue={tagsToString(metadata.tags)} placeholder="YouTube, Trailer, Sci-Fi, Avatar" />
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
