import React, { useEffect, useState } from "react";
import { LANGUAGES, VIDEO_QUALITIES, VIDEO_QUALITY_LABELS } from "./taxonomy";

const STORAGE_KEY = "cineverse_playback_preferences_v1";

const DEFAULTS = {
  contentLanguage: "Română",
  subtitleLanguage: "Română",
  dubbingLanguage: "Română",
  videoQuality: "1080p",
  audioMode: "stereo",
  watchMode: "normal",
  autoplay: false,
  rememberPerDevice: true
};

function loadPrefs() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

export default function PlaybackPreferences({ onGoToLibrary }) {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      window.dispatchEvent(new CustomEvent("cineverse-playback-preferences-changed", { detail: prefs }));
    } catch {}
  }, [prefs]);

  function update(key, value) {
    setPrefs((current) => ({ ...current, [key]: value }));
  }

  function applyLanguageToLibrary() {
    const params = new URLSearchParams();
    params.set("page", "library");

    if (prefs.contentLanguage) params.set("aiLanguage", prefs.contentLanguage);
    if (prefs.videoQuality) params.set("aiVideoQuality", prefs.videoQuality);

    window.history.pushState({}, "", `/?${params.toString()}`);
    onGoToLibrary?.();
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function copyPrefs() {
    const text = JSON.stringify(prefs, null, 2);
    navigator.clipboard?.writeText(text)
      .then(() => setMessage("Preferințele de redare au fost copiate."))
      .catch(() => setMessage(text));
  }

  function resetPrefs() {
    if (!window.confirm("Resetezi preferințele de redare?")) return;
    setPrefs(DEFAULTS);
    setMessage("Preferințele au fost resetate.");
  }

  return (
    <section className="section playbackPreferencesPage">
      <div className="playbackHero">
        <span className="pill">Preferințe Redare</span>
        <h2>Subtitrări, dublaj, calitate video și audio</h2>
        <p>
          Modul stabil pentru redare. Aceste preferințe sunt salvate local și pregătesc
          playerul pentru subtitrări, dublaj, calitate și mod de vizionare.
        </p>
      </div>

      {message && <div className="settingsSavedMessage">{message}</div>}

      <div className="playbackSummary">
        <span>Conținut: <strong>{prefs.contentLanguage}</strong></span>
        <span>Subtitrare: <strong>{prefs.subtitleLanguage}</strong></span>
        <span>Dublaj: <strong>{prefs.dubbingLanguage}</strong></span>
        <span>Calitate: <strong>{prefs.videoQuality}</strong></span>
        <span>Audio: <strong>{prefs.audioMode}</strong></span>
        <span>Vizionare: <strong>{prefs.watchMode}</strong></span>
      </div>

      <div className="playbackGrid">
        <article className="settingsCard">
          <h3>Limbi</h3>

          <label>
            Limba conținutului
            <select value={prefs.contentLanguage} onChange={(e) => update("contentLanguage", e.target.value)}>
              {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>

          <label>
            Limba subtitrării
            <select value={prefs.subtitleLanguage} onChange={(e) => update("subtitleLanguage", e.target.value)}>
              {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>

          <label>
            Limba dublajului
            <select value={prefs.dubbingLanguage} onChange={(e) => update("dubbingLanguage", e.target.value)}>
              {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>
        </article>

        <article className="settingsCard">
          <h3>Video și Audio</h3>

          <label>
            Calitate video
            <select value={prefs.videoQuality} onChange={(e) => update("videoQuality", e.target.value)}>
              {VIDEO_QUALITIES.map((quality) => (
                <option key={quality} value={quality}>
                  {quality} {VIDEO_QUALITY_LABELS?.[quality] ? `- ${VIDEO_QUALITY_LABELS[quality]}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Audio
            <select value={prefs.audioMode} onChange={(e) => update("audioMode", e.target.value)}>
              <option value="stereo">Stereo</option>
              <option value="surround">Surround</option>
              <option value="auto">Auto</option>
            </select>
          </label>

          <label>
            Mod vizionare
            <select value={prefs.watchMode} onChange={(e) => update("watchMode", e.target.value)}>
              <option value="normal">Normal</option>
              <option value="fullscreen">Ecran complet</option>
              <option value="mini-player">Mini-player</option>
            </select>
          </label>
        </article>

        <article className="settingsCard">
          <h3>Comportament player</h3>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={prefs.autoplay}
              onChange={(e) => update("autoplay", e.target.checked)}
            />
            Autoplay: {prefs.autoplay ? "Activat" : "Dezactivat"}
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={prefs.rememberPerDevice}
              onChange={(e) => update("rememberPerDevice", e.target.checked)}
            />
            Reține pe dispozitiv: {prefs.rememberPerDevice ? "Da" : "Nu"}
          </label>

          <div className="settingsInfoList">
            <span>Subtitrări: pregătit pentru player</span>
            <span>Dublaj: pregătit pentru metadata</span>
            <span>Calitate video: aplicabilă ca filtru</span>
            <span>Mini-player: pregătit ca setare</span>
          </div>
        </article>
      </div>

      <div className="wizardActions">
        <button type="button" onClick={applyLanguageToLibrary}>
          Aplică limba + calitatea în AI Library
        </button>
        <button type="button" className="secondary" onClick={copyPrefs}>
          Copiază preferințe
        </button>
        <button type="button" className="secondary" onClick={resetPrefs}>
          Resetează
        </button>
      </div>
    </section>
  );
}
