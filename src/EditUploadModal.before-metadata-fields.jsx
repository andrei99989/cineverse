import React from "react";
import { Save, X } from "lucide-react";

export default function EditUploadModal({ upload, onClose, onSave }) {
  if (!upload) return null;

  function submit(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    let metadata = {};
    try {
      metadata = JSON.parse(form.get("metadata") || "{}");
    } catch {
      alert("Metadata trebuie să fie JSON valid.");
      return;
    }

    onSave(upload.id, {
      title: form.get("title"),
      inputType: form.get("inputType"),
      sourceType: form.get("sourceType"),
      value: form.get("value"),
      posterUrl: form.get("posterUrl"),
      metadata
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
