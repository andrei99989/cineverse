import React from "react";
import { Copy, X } from "lucide-react";

export default function UploadInfoModal({ upload, onClose }) {
  if (!upload) return null;

  const metadata = upload.metadata || {};
  const value = String(upload.value || "");
  const poster = upload.posterUrl || "";

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      alert("Copiat.");
    } catch {
      alert("Nu s-a putut copia.");
    }
  }

  return (
    <div className="playerOverlay">
      <div className="playerShell editModal">
        <div className="playerTop">
          <div>
            <span className="pill">Info</span>
            <h2>{upload.title || "Fără titlu"}</h2>
          </div>

          <button className="danger" type="button" onClick={onClose}>
            <X size={18} />
            Închide
          </button>
        </div>

        <div className="infoGrid">
          <div className="infoPoster">
            {poster ? (
              <img src={poster} alt={upload.title || "Poster"} />
            ) : (
              <div className="resultNoImage">No poster</div>
            )}
          </div>

          <div className="infoPanel">
            <h3>Detalii postare</h3>
            <p><strong>ID:</strong> {upload.id || "-"}</p>
            <p><strong>Titlu:</strong> {upload.title || "-"}</p>
            <p><strong>Input:</strong> {upload.inputType || "-"}</p>
            <p><strong>Sursă:</strong> {upload.sourceType || "-"}</p>
            <p><strong>Categorie:</strong> {metadata.category || "-"}</p>
            <p><strong>Gen:</strong> {metadata.genre || "-"}</p>
            <p><strong>An:</strong> {metadata.year || "-"}</p>
            <p><strong>Franciză:</strong> {metadata.franchise || "-"}</p>
            <p><strong>Colecție:</strong> {metadata.collection || "-"}</p>
            <p><strong>Creat:</strong> {upload.createdAt || "-"}</p>

            <div className="row">
              <button type="button" onClick={() => copyText(value)}>
                <Copy size={16} />
                Copy URL / iframe
              </button>

              <button type="button" className="secondary" onClick={() => copyText(JSON.stringify(metadata, null, 2))}>
                <Copy size={16} />
                Copy metadata
              </button>
            </div>
          </div>
        </div>

        <div className="metadataBox">
          <strong>URL / iframe</strong>
          <pre>{value || "Fără URL / iframe"}</pre>
        </div>

        <div className="metadataBox">
          <strong>Metadata JSON</strong>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
