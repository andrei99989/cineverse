import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "./api";

function waitBulkImport(ms = 80) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function uploadLinkValue(upload) {
  return String(upload?.value || upload?.url || upload?.iframe || upload?.sourceUrl || upload?.embedUrl || "").trim();
}

function normalizeBulkUrl(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function isInvalidBulkUpload(upload) {
  const title = String(upload?.title || "").toLowerCase();
  const sourceType = String(upload?.source_type || upload?.sourceType || "").toLowerCase();
  const value = String(upload?.value || "").trim();

  const looksBulk =
    title.includes("bulk import") ||
    title.includes("bulk youtube") ||
    title.includes("bulk rumble") ||
    title.includes("bulk tiktok");

  const hasBulkSource = ["youtube", "rumble", "tiktok", "vimeo", "dailymotion", "terabox"]
    .some((source) => sourceType.includes(source));

  return !value && (looksBulk || hasBulkSource);
}

function safeBulkMetadata(upload) {
  try {
    if (!upload?.metadata) return {};
    return typeof upload.metadata === "string" ? JSON.parse(upload.metadata) : upload.metadata;
  } catch {
    return {};
  }
}

function buildAiQueueUpdatePayload(upload, metadataPatch) {
  const currentMetadata = safeBulkMetadata(upload);
  const nextMetadata = {
    ...currentMetadata,
    ...metadataPatch
  };

  return {
    title: upload.title,
    input_type: upload.input_type || upload.inputType || "url",
    source_type: upload.source_type || upload.sourceType || "Other URL",
    value: upload.value || "",
    poster_url: upload.poster_url || upload.posterUrl || "",
    metadata: nextMetadata,
    metadata_json: JSON.stringify(nextMetadata)
  };
}

function buildMetadataSearchQueryFromUpload(upload) {
  const metadata = safeBulkMetadata(upload);
  const movieTitle = metadata.movieTitle || metadata.title || "";
  const title = upload.title || "";
  const code = metadata.detectedVideoCode || extractBulkUrlCode(upload.value || "");

  return String(movieTitle || title || code || "").replace(/^Bulk\s+(YouTube|Rumble|TikTok|URL)\s+/i, "").trim();
}

function buildLocalAiMetadata(upload) {
  const currentMetadata = safeBulkMetadata(upload);
  const sourceType = upload.source_type || upload.sourceType || currentMetadata.sourceType || detectBulkSource(upload.value || "");
  const code = extractBulkUrlCode(upload.value || "");
  const title = upload.title || smartBulkTitle(sourceType, 0, upload.value || "");

  return {
    ...currentMetadata,
    movieTitle: currentMetadata.movieTitle || title,
    category: currentMetadata.category || "Filme",
    genre: currentMetadata.genre || "General",
    country: currentMetadata.country || "All",
    language: currentMetadata.language || "All",
    quality: currentMetadata.quality || "HD",
    sourceType,
    inputType: upload.input_type || upload.inputType || "url",
    bulkImport: true,
    aiMetadata: true,
    needsAiMetadata: false,
    aiMetadataStatus: "processed-local-v1",
    aiMetadataProcessedAt: new Date().toISOString(),
    aiGenerated: true,
    aiVersion: "bulk-local-v1",
    detectedVideoCode: code,
    tags: Array.from(new Set([
      ...(Array.isArray(currentMetadata.tags) ? currentMetadata.tags : []),
      "bulk-import",
      String(sourceType || "source").toLowerCase(),
      code
    ].filter(Boolean)))
  };
}

function isBulkAiMetadataPending(upload) {
  const metadata = safeBulkMetadata(upload);
  return Boolean(metadata?.bulkImport && metadata?.needsAiMetadata);
}

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

function sourceTag(sourceType) {
  return String(sourceType || "other").toLowerCase().replace(/\s+/g, "-");
}

function extractBulkUrlCode(value) {
  const raw = String(value || "").trim();

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);

    if (host.includes("youtu.be") && parts[0]) return parts[0];
    if (host.includes("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;
      const embedIndex = parts.indexOf("embed");
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      if (parts.length) return parts[parts.length - 1];
    }

    if (host.includes("rumble.com") && parts.length) {
      return parts[parts.length - 1].replace(/\.html$/i, "");
    }

    if (host.includes("tiktok.com") || host.includes("vm.tiktok.com")) {
      return parts[parts.length - 1] || host.replace(/\W+/g, "");
    }

    if (parts.length) return parts[parts.length - 1].replace(/\.html$/i, "");
    return host.replace(/^www\./, "");
  } catch {
    const match = raw.match(/([A-Za-z0-9_-]{6,})/g);
    return match ? match[match.length - 1] : "";
  }
}

function smartBulkTitle(sourceType, index, value) {
  const cleanSource = sourceType && sourceType !== "Other URL" ? sourceType : "URL";
  const code = extractBulkUrlCode(value);
  return code ? `Bulk ${cleanSource} ${code}` : "Bulk " + cleanSource + " " + String(index + 1).padStart(3, "0");
}

function smartBulkNotes(item) {
  return [
    "Bulk import",
    "Sursă: " + item.sourceType,
    "Tip input: " + item.inputType,
    "URL: " + item.value
  ].join(" · ");
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
    title: smartBulkTitle(detectBulkSource(item.value), index, item.value),
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
      aiMetadataEnabled: defaults.aiMetadataEnabled,
      tags: ["bulk-import", sourceTag(detectBulkSource(item.value))]
    }
  }));
}

export default function BulkImportPanel({ onDataChanged, onSendToMetadataSearch, onSelectBulkMetadataTarget, queueRefreshSignal }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState([]);
  const [category, setCategory] = useState("Filme");
  const [genre, setGenre] = useState("General");
  const [country, setCountry] = useState("All");
  const [language, setLanguage] = useState("All");
  const [quality, setQuality] = useState("HD");
  const [importLimit, setImportLimit] = useState("all");
  const [bulkAiMetadataEnabled, setBulkAiMetadataEnabled] = useState(false);
  const [importRunning, setImportRunning] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    ok: 0,
    duplicate: 0,
    failed: 0
  });
  const [cleanupRunning, setCleanupRunning] = useState(false);
  const [cleanupReport, setCleanupReport] = useState(null);
  const [aiQueueLoading, setAiQueueLoading] = useState(false);
  const [aiQueueReport, setAiQueueReport] = useState(null);
  const [aiQueueActionMessage, setAiQueueActionMessage] = useState("");
  const [metadataHandoffMessage, setMetadataHandoffMessage] = useState("");

  const lastQueueRefreshSignalRef = useRef(queueRefreshSignal);

  useEffect(() => {
    if (!queueRefreshSignal || lastQueueRefreshSignalRef.current === queueRefreshSignal) return;
    lastQueueRefreshSignalRef.current = queueRefreshSignal;
    handleScanAiMetadataQueue();
  }, [queueRefreshSignal]);

  const isAiQueueComplete = aiQueueReport && Number(aiQueueReport.total || 0) === 0;
  const hasAiQueueItems = aiQueueReport && Number(aiQueueReport.total || 0) > 0;

  const defaults = useMemo(() => ({
    category,
    genre,
    country,
    language,
    quality,
    aiMetadataEnabled: bulkAiMetadataEnabled
  }), [category, genre, country, language, quality, bulkAiMetadataEnabled]);

  const detectedCount = useMemo(() => {
    return parseBulkImportText(text, defaults).length;
  }, [text, defaults]);

  const handlePreview = () => {
    setPreview(parseBulkImportText(text, defaults));
  };

  const handleClear = () => {
    setText("");
    setPreview([]);
    setImportReport(null);
  };

  const loadInvalidBulkUploads = async () => {
    const data = await apiGet("/uploads");
    const uploads = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    return uploads.filter(isInvalidBulkUpload);
  };

  const refreshAiMetadataQueue = async () => {
    const data = await apiGet("/uploads");
    const uploads = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    const pending = uploads.filter(isBulkAiMetadataPending);

    setAiQueueReport({
      status: "ok",
      total: pending.length,
      items: pending.slice(0, 10),
      message: pending.length ? "AI Metadata queue are itemuri în așteptare." : "Nu există itemuri în AI Metadata queue."
    });

    return pending;
  };

  const handleSendToMetadataSearch = async (item) => {
    const query = buildMetadataSearchQueryFromUpload(item);

    if (!query) {
      setMetadataHandoffMessage("Nu am găsit query pentru AI Metadata Search.");
      return;
    }

    onSelectBulkMetadataTarget?.(item);
    onSendToMetadataSearch?.(query);

    try {
      await navigator.clipboard?.writeText(query);
      setMetadataHandoffMessage("Query trimis în AI Metadata Search și copiat: " + query);
    } catch {
      setMetadataHandoffMessage("Query trimis în AI Metadata Search: " + query);
    }
  };

  const handleProcessFirstAiMetadata = async () => {
    setAiQueueLoading(true);
    setAiQueueActionMessage("Se procesează primul item din AI queue...");

    try {
      const pending = await refreshAiMetadataQueue();
      const item = pending[0];

      if (!item) {
        setAiQueueActionMessage("Nu există itemuri de procesat.");
        setAiQueueLoading(false);
        return;
      }

      const nextMetadata = buildLocalAiMetadata(item);

      const payload = {
        title: item.title,
        input_type: item.input_type || item.inputType || "url",
        source_type: item.source_type || item.sourceType || nextMetadata.sourceType || "Other URL",
        value: item.value || "",
        poster_url: item.poster_url || item.posterUrl || "",
        metadata: nextMetadata
      };

      await apiPut("/uploads/" + encodeURIComponent(item.id), payload);

      setAiQueueActionMessage("AI Metadata local procesat pentru: " + item.title);

      const nextPending = await refreshAiMetadataQueue();
      setAiQueueReport((current) => ({
        ...(current || {}),
        total: nextPending.length,
        items: nextPending.slice(0, 10),
        message: nextPending.length ? "AI Metadata queue are itemuri în așteptare." : "Nu există itemuri în AI Metadata queue."
      }));

      await onDataChanged?.();
    } catch (error) {
      setAiQueueActionMessage("Eroare procesare AI local: " + (error?.message || "necunoscută"));
      setAiQueueReport((current) => ({
        ...(current || {}),
        status: "error",
        message: error?.message || "Procesare AI Metadata local eșuată."
      }));
    } finally {
      setAiQueueLoading(false);
    }
  };

  const handleMarkAiMetadataProcessed = async (item) => {
    setAiQueueActionMessage("Se marchează ca procesat: " + item.title);

    const okConfirm = window.confirm(`Marchezi "${item.title}" ca procesat AI Metadata?`);
    if (!okConfirm) {
      setAiQueueActionMessage("Acțiune anulată.");
      return;
    }

    setAiQueueLoading(true);

    try {
      const currentMetadata = safeBulkMetadata(item);
      const nextMetadata = {
        ...currentMetadata,
        needsAiMetadata: false,
        aiMetadata: true,
        aiMetadataProcessedAt: new Date().toISOString(),
        aiMetadataStatus: "processed-manual"
      };

      const payload = {
        title: item.title,
        input_type: item.input_type || item.inputType || "url",
        source_type: item.source_type || item.sourceType || "Other URL",
        value: item.value || "",
        poster_url: item.poster_url || item.posterUrl || "",
        metadata: nextMetadata
      };

      await apiPut("/uploads/" + encodeURIComponent(item.id), payload);

      setAiQueueActionMessage("Item marcat ca procesat: " + item.title);

      const pending = await refreshAiMetadataQueue();
      setAiQueueReport((current) => ({
        ...(current || {}),
        total: pending.length,
        items: pending.slice(0, 10),
        message: pending.length ? "AI Metadata queue are itemuri în așteptare." : "Nu există itemuri în AI Metadata queue."
      }));

      await onDataChanged?.();
    } catch (error) {
      setAiQueueActionMessage("Eroare la marcare: " + (error?.message || "necunoscută"));
      setAiQueueReport((current) => ({
        ...(current || {}),
        status: "error",
        message: error?.message || "Nu pot marca itemul ca procesat."
      }));
    } finally {
      setAiQueueLoading(false);
    }
  };

  const handleDisableAiMetadataForItem = async (item) => {
    setAiQueueActionMessage("Se dezactivează AI Metadata pentru: " + item.title);

    const okConfirm = window.confirm(`Dezactivezi AI Metadata pentru "${item.title}"?`);
    if (!okConfirm) {
      setAiQueueActionMessage("Acțiune anulată.");
      return;
    }

    setAiQueueLoading(true);

    try {
      const currentMetadata = safeBulkMetadata(item);
      const nextMetadata = {
        ...currentMetadata,
        needsAiMetadata: false,
        aiMetadata: false,
        aiMetadataDisabledAt: new Date().toISOString(),
        aiMetadataStatus: "disabled"
      };

      const payload = {
        title: item.title,
        input_type: item.input_type || item.inputType || "url",
        source_type: item.source_type || item.sourceType || "Other URL",
        value: item.value || "",
        poster_url: item.poster_url || item.posterUrl || "",
        metadata: nextMetadata
      };

      await apiPut("/uploads/" + encodeURIComponent(item.id), payload);

      setAiQueueActionMessage("AI Metadata dezactivat pentru: " + item.title);

      const pending = await refreshAiMetadataQueue();
      setAiQueueReport((current) => ({
        ...(current || {}),
        total: pending.length,
        items: pending.slice(0, 10),
        message: pending.length ? "AI Metadata queue are itemuri în așteptare." : "Nu există itemuri în AI Metadata queue."
      }));

      await onDataChanged?.();
    } catch (error) {
      setAiQueueActionMessage("Eroare la dezactivare: " + (error?.message || "necunoscută"));
      setAiQueueReport((current) => ({
        ...(current || {}),
        status: "error",
        message: error?.message || "Nu pot dezactiva AI Metadata."
      }));
    } finally {
      setAiQueueLoading(false);
    }
  };

  const handleScanAiMetadataQueue = async () => {
    setAiQueueLoading(true);

    try {
      await refreshAiMetadataQueue();
    } catch (error) {
      setAiQueueReport({
        status: "error",
        total: 0,
        items: [],
        message: error?.message || "Scan AI Metadata queue eșuat."
      });
    }

    setAiQueueLoading(false);
  };

  const handleScanInvalidBulk = async () => {
    setCleanupRunning(true);

    try {
      const invalid = await loadInvalidBulkUploads();
      setCleanupReport({
        status: "scan",
        found: invalid.length,
        deleted: 0,
        failed: 0,
        message: invalid.length ? "Bulk invalide găsite." : "Nu există bulk import invalid."
      });
    } catch (error) {
      setCleanupReport({
        status: "error",
        found: 0,
        deleted: 0,
        failed: 1,
        message: error?.message || "Scan bulk invalid eșuat."
      });
    }

    await onDataChanged?.();
    setCleanupRunning(false);
  };

  const handleDeleteInvalidBulk = async () => {
    setCleanupRunning(true);

    try {
      const invalid = await loadInvalidBulkUploads();

      if (!invalid.length) {
        setCleanupReport({
          status: "ok",
          found: 0,
          deleted: 0,
          failed: 0,
          message: "Nu există bulk import invalid de șters."
        });
        setCleanupRunning(false);
        return;
      }

      const okConfirm = window.confirm(`Ștergi ${invalid.length} upload-uri bulk invalide cu value gol?`);
      if (!okConfirm) {
        setCleanupRunning(false);
        return;
      }

      const results = [];

      for (const item of invalid) {
        try {
          await apiDelete("/uploads/" + encodeURIComponent(item.id));
          results.push({ ok: true, item });
        } catch (error) {
          results.push({ ok: false, item, error: error?.message || "Delete eșuat" });
        }
      }

      const deleted = results.filter((item) => item.ok).length;
      const failed = results.length - deleted;

      setCleanupReport({
        status: failed ? "warning" : "ok",
        found: invalid.length,
        deleted,
        failed,
        message: failed ? "Cleanup finalizat cu erori." : "Bulk import invalid șters."
      });
    } catch (error) {
      setCleanupReport({
        status: "error",
        found: 0,
        deleted: 0,
        failed: 1,
        message: error?.message || "Cleanup bulk invalid eșuat."
      });
    }

    setCleanupRunning(false);
  };

  const handleImportAll = async () => {
    const allItems = preview.length ? preview : parseBulkImportText(text, defaults);
    const limitNumber = importLimit === "all" ? allItems.length : Number(importLimit);
    const items = allItems.slice(0, Number.isFinite(limitNumber) ? limitNumber : allItems.length);

    if (!items.length) {
      setImportReport({
        status: "error",
        ok: 0,
        duplicate: 0,
        failed: 0,
        total: 0,
        message: "Nu există linkuri pentru import."
      });
      return;
    }

    const okConfirm = window.confirm(`Importi ${items.length} din ${allItems.length} linkuri în Cloudflare D1? Duplicatele vor fi sărite.`);
    if (!okConfirm) return;

    setImportRunning(true);
    setImportReport(null);
    setImportProgress({
      current: 0,
      total: items.length,
      ok: 0,
      duplicate: 0,
      failed: 0
    });

    const results = [];

    try {
      let existingUploads = [];

      try {
        const existingData = await apiGet("/uploads");
        existingUploads = Array.isArray(existingData?.items)
          ? existingData.items
          : Array.isArray(existingData)
            ? existingData
            : [];
      } catch (error) {
        console.error("Nu pot citi upload-urile existente pentru duplicate guard", error);
        existingUploads = [];
      }

      const existingLinks = new Set(
        existingUploads
          .map(uploadLinkValue)
          .map(normalizeBulkUrl)
          .filter(Boolean)
      );

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const normalized = normalizeBulkUrl(item.value);

        if (existingLinks.has(normalized)) {
          results.push({
            ok: false,
            duplicate: true,
            item,
            error: "Duplicat deja existent în D1"
          });
        } else {
          try {
            const payload = {
              title: item.title,
              input_type: item.inputType,
              source_type: item.sourceType,
              value: item.value,
              poster_url: "",
              metadata: {
                movieTitle: item.title,
                category: item.metadata.category,
                genre: item.metadata.genre,
                country: item.metadata.country,
                language: item.metadata.language,
                quality: item.metadata.quality,
                notes: smartBulkNotes(item),
                tags: item.metadata.tags,
                sourceType: item.sourceType,
                inputType: item.inputType,
                bulkImport: true,
                aiMetadata: item.metadata.aiMetadataEnabled,
                needsAiMetadata: item.metadata.aiMetadataEnabled
              }
            };

            const response = await apiPost("/uploads", payload);
            existingLinks.add(normalized);

            results.push({
              ok: true,
              duplicate: false,
              item,
              response
            });
          } catch (error) {
            results.push({
              ok: false,
              duplicate: false,
              item,
              error: error?.message || "Import eșuat"
            });
          }
        }

        const ok = results.filter((result) => result.ok).length;
        const duplicate = results.filter((result) => result.duplicate).length;
        const failed = results.filter((result) => !result.ok && !result.duplicate).length;

        setImportProgress({
          current: index + 1,
          total: items.length,
          ok,
          duplicate,
          failed
        });

        await waitBulkImport(80);
      }

      const ok = results.filter((result) => result.ok).length;
      const duplicate = results.filter((result) => result.duplicate).length;
      const failed = results.filter((result) => !result.ok && !result.duplicate).length;

      setImportReport({
        status: failed ? "warning" : "ok",
        ok,
        duplicate,
        failed,
        total: results.length,
        message: failed
          ? "Import finalizat cu erori."
          : duplicate
            ? "Import finalizat. Duplicatele au fost sărite."
            : "Import finalizat cu succes.",
        results
      });

      await onDataChanged?.();
    } catch (error) {
      setImportReport({
        status: "error",
        ok: results.filter((result) => result.ok).length,
        duplicate: results.filter((result) => result.duplicate).length,
        failed: Math.max(1, results.filter((result) => !result.ok && !result.duplicate).length),
        total: items.length,
        message: error?.message || "Import bulk eșuat.",
        results
      });
    } finally {
      setImportRunning(false);
    }
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
        <button type="button" className="secondary" onClick={handleScanInvalidBulk} disabled={cleanupRunning}>
          Scanează bulk invalide
        </button>
        <button type="button" className="secondary" onClick={handleDeleteInvalidBulk} disabled={cleanupRunning}>
          {cleanupRunning ? "Curăță..." : "Șterge bulk invalide"}
        </button>
        <button type="button" className="secondary" onClick={handleScanAiMetadataQueue} disabled={aiQueueLoading}>
          {aiQueueLoading ? "Scanez AI..." : "Scanează AI queue"}
        </button>
        <button type="button" className="secondary" onClick={handleImportAll} disabled={importRunning}>
          {importRunning ? "Importă..." : "Importă toate în D1"}
        </button>
        <label className="switchLine bulkAiMetadataToggle">
          <input
            type="checkbox"
            checked={bulkAiMetadataEnabled}
            onChange={(event) => setBulkAiMetadataEnabled(event.target.checked)}
          />
          <span>AI Metadata bulk {bulkAiMetadataEnabled ? "ON" : "OFF"}</span>
        </label>

        <label className="bulkImportLimitControl">
          Limită import
          <select value={importLimit} onChange={(event) => setImportLimit(event.target.value)}>
            <option value="all">Toate</option>
            <option value="10">Primele 10</option>
            <option value="20">Primele 20</option>
            <option value="50">Primele 50</option>
            <option value="100">Primele 100</option>
          </select>
        </label>
        <span className="mutedText">Linkuri găsite text: {detectedCount}</span>
        <span className="mutedText">Detectate preview: {preview.length}</span>
      </div>

      {aiQueueReport && (
        <div className="bulkAiQueueReport">
          <span className="pill">AI Metadata Queue</span>
          <strong>{aiQueueReport.message}</strong>
          <span className="mutedText">În așteptare: {aiQueueReport.total}</span>
          {isAiQueueComplete && (
            <div className="bulkQueueCompleteBox">
              <strong>Toate itemurile Bulk AI Metadata au fost procesate.</strong>
              <span className="mutedText">Queue este goală. Poți importa linkuri noi sau continua cu editarea bibliotecii.</span>
            </div>
          )}
          <button type="button" className="secondary" onClick={handleProcessFirstAiMetadata} disabled={aiQueueLoading || !hasAiQueueItems}>
            {aiQueueLoading ? "Procesez AI..." : "Procesează primul AI"}
          </button>
          {aiQueueActionMessage && <span className="mutedText">Ultima acțiune: {aiQueueActionMessage}</span>}
          {metadataHandoffMessage && <span className="mutedText">Handoff metadata: {metadataHandoffMessage}</span>}

          {hasAiQueueItems && aiQueueReport.items?.length > 0 && (
            <div className="bulkAiQueueList">
              {aiQueueReport.items.map((item) => (
                <div className="bulkAiQueueItem" key={item.id}>
                  <strong>{item.title}</strong>
                  <small>{item.source_type || item.sourceType || "-"}</small>
                  <small>{item.value || "-"}</small>
                  <div className="bulkAiQueueActions">
                    <button type="button" className="secondary" onClick={() => handleMarkAiMetadataProcessed(item)}>
                      Marchează procesat
                    </button>
                    <button type="button" className="secondary" onClick={() => handleDisableAiMetadataForItem(item)}>
                      Dezactivează AI
                    </button>
                    <button type="button" className="secondary" onClick={() => handleSendToMetadataSearch(item)}>
                      Trimite la AI Metadata Search
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {cleanupReport && (
        <div className="bulkCleanupReport">
          <span className="pill">Cleanup bulk</span>
          <strong>{cleanupReport.message}</strong>
          <span className="mutedText">Găsite: {cleanupReport.found}</span>
          <span className="mutedText">Șterse: {cleanupReport.deleted}</span>
          <span className="mutedText">Eșuate: {cleanupReport.failed}</span>
        </div>
      )}

      {importRunning && (
        <div className="bulkImportProgress">
          <span className="pill">Import progress</span>
          <strong>{importProgress.current} / {importProgress.total}</strong>
          <span className="mutedText">OK: {importProgress.ok}</span>
          <span className="mutedText">Duplicate: {importProgress.duplicate}</span>
          <span className="mutedText">Eșuate: {importProgress.failed}</span>
          <progress value={importProgress.current} max={importProgress.total || 1} />
        </div>
      )}

      {importReport && (
        <div className="bulkImportReport">
          <span className="pill">Import D1</span>
          <strong>{importReport.message}</strong>
          <span className="mutedText">Total: {importReport.total}</span>
          <span className="mutedText">Importate OK: {importReport.ok}</span>
          <span className="mutedText">Duplicate sărite: {importReport.duplicate || 0}</span>
          <span className="mutedText">Eșuate: {importReport.failed}</span>
        </div>
      )}

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
                <small>Tags: {item.metadata.tags.join(", ")}</small>
                <small>AI Metadata: {item.metadata.aiMetadataEnabled ? "ON" : "OFF"}</small>
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
