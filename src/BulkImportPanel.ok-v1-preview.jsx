import React, { useMemo, useState } from "react";

function detectBulkSource(value) {
  const text = String(value || "").toLowerCase();

  if (text.includes("youtube.com") || text.includes("youtu.be")) return "YouTube";
  if (text.includes("tiktok.com") || text.includes("vm.tiktok.com")) return "TikTok";
  if (text.includes("terabox.com") || text.includes("1024tera.com") || text.includes("teraboxapp.com")) return "Terabox";
  if (text.includes("vimeo.com")) return "Vimeo";
  if (text.includes("dailymotion.com")) return "Dailymotion";
  if (text.includes("rumble.com")) return "Rumble";
  if (text.includes("drive.google.com")) return "Google Drive";
  if (text.includes("facebook.com")) return "Facebook";
  if (text.includes("instagram.com")) return "Instagram";

  return "Other URL";
}

function parseBulkImportText(rawText, defaults) {
  const raw = String(rawText || "");

  const iframeItems = [...raw.matchAll(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/gi)].map((match) => ({
    value: match[1],
    inputType: "iframe",
    raw: match[0]
  }));

  const rumbleItems = [...raw.matchAll(/Rumble\(["']play["'],\s*\{[^}]*["']video["']\s*:\s*["']([^"']+)["']/gi)].map((match) => ({
    value: "https://rumble.com/embed/" + match[1],
    inputType: "embed",
    raw: "Rumble embed video: " + match[1]
  }));

  const urlItems = [...raw.matchAll(/https?:\/\/[^\s"'<>]+/gi)].map((match) => ({
    value: match[0],
    inputType: "url",
    raw: match[0]
  }));

  const unique = [];
  const seen = new Set();

  for (const item of [...iframeItems, ...rumbleItems, ...urlItems]) {
    if (!item.value || seen.has(item.value)) continue;
    seen.add(item.value);
    unique.push(item);
  }

  return unique.map((item, index) => ({
    id: "bulk-preview-" + index,
    index: index + 1,
    title: "Bulk Import " + String(index + 1).padStart(3, "0"),
    inputType: item.inputType,
    sourceType: detectBulkSource(item.value),
    value: item.value,
    raw: item.raw,
    valid: item.value.startsWith("http") || item.value.startsWith("//"),
    metadata: {
      category: defaults.category,
      genre: defaults.genre,
      country: defaults.country,
      language: defaults.language,
      quality: defaults.quality,
      tags: ["bulk-import"]
    }
  }));
}

export default function BulkImportPanel() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState([]);
  const [category, setCategory] = useState("Filme");
  const [genre, setGenre] = useState("General");
  const [country, setCountry] = useState("All");
  const [language, setLanguage] = useState("All");
  const [quality, setQuality] = useState("HD");

  const defaults = useMemo(() => ({
    category,
    genre,
    country,
    language,
    quality
  }), [category, genre, country, language, quality]);

  const detectedCount = useMemo(() => {
    return parseBulkImportText(text, defaults).length;
  }, [text, defaults]);

  const handlePreview = () => {
    setPreview(parseBulkImportText(text, defaults));
  };

  const handleClear = () => {
    setText("");
    setPreview([]);
  };

  return (
    <div className="bulkImportPanel" data-bulk-import-panel="component-v1">
      <div className="bulkImportHeader">
        <div>
          <span className="pill">Bulk Import v1</span>
          <h3>Bulk Import URL/iframe</h3>
          <p className="mutedText">Lipește multe linkuri sau iframe-uri. v1 face preview, fără salvare în D1.</p>
        </div>
      </div>

      <div className="bulkImportDefaults">
        <label>
          Categorie default
          <input value={category} onChange={(event) => setCategory(event.target.value)} />
        </label>
        <label>
          Gen default
          <input value={genre} onChange={(event) => setGenre(event.target.value)} />
        </label>
        <label>
          Țară default
          <input value={country} onChange={(event) => setCountry(event.target.value)} />
        </label>
        <label>
          Limbă default
          <input value={language} onChange={(event) => setLanguage(event.target.value)} />
        </label>
        <label>
          Calitate default
          <input value={quality} onChange={(event) => setQuality(event.target.value)} />
        </label>
      </div>

      <textarea
        className="bulkImportTextarea"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setPreview([]);
        }}
        placeholder={"Lipește aici linkuri sau iframe-uri...\nhttps://youtube.com/watch?v=...\nhttps://rumble.com/shorts/...\nhttps://vm.tiktok.com/..."}
      />

      <div className="bulkImportActions">
        <button type="button" className="secondary" onClick={handlePreview}>Recalculează preview</button>
        <button type="button" className="secondary" onClick={handleClear}>Curăță</button>
        <span className="mutedText">Linkuri găsite text: {detectedCount}</span>
        <span className="mutedText">Detectate preview: {preview.length}</span>
      </div>

      {preview.length > 0 && (
        <div className="bulkImportPreview">
          <div className="bulkImportStats">
            <span className="pill">Total: {preview.length}</span>
            <span className="pill">Valide: {preview.filter((item) => item.valid).length}</span>
            <span className="pill">Eșuate: {preview.filter((item) => !item.valid).length}</span>
          </div>

          <div className="bulkImportPreviewList">
            {preview.slice(0, 50).map((item) => (
              <div className={item.valid ? "bulkImportPreviewItem" : "bulkImportPreviewItem invalid"} key={item.id}>
                <strong>#{item.index} {item.title}</strong>
                <span>{item.inputType} · {item.sourceType}</span>
                <small>{item.value}</small>
              </div>
            ))}
          </div>

          {preview.length > 50 && (
            <p className="mutedText">Se afișează primele 50 din {preview.length} itemuri.</p>
          )}
        </div>
      )}
    </div>
  );
}
