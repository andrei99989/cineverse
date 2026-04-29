import React, { useEffect, useState } from "react";
import {
  LANGUAGES,
  VIDEO_QUALITIES,
  VIDEO_QUALITY_LABELS
} from "./taxonomy";

const STORAGE_KEY = "cineverse_settings_v1";

const DEFAULT_SETTINGS = {
  interfaceLanguage: "Română",
  subtitleLanguage: "Română",
  dubbingLanguage: "Română",
  videoQuality: "1080p",
  audioMode: "stereo",
  watchMode: "normal",
  theme: "dark",
  notifications: true,
  parentalEnabled: false,
  parentalAge: "16+",
  explicitFilter: false,
  kidsProfile: false,
  twoFactor: false,
  autoLogout: false,
  accessibilityText: "normal",
  highContrast: false,
  screenReader: false,
  socialGoogle: false,
  socialFacebook: false,
  socialTwitter: false,
  socialYoutube: false,
  socialTiktok: false,
  socialDailymotion: false,
  socialVimeo: false
};

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function settingBoolLabel(value) {
  return value ? "Activat" : "Dezactivat";
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent("cineverse-settings-changed", { detail: settings }));
    } catch {}
  }, [settings]);

  function update(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveNow() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedMessage("Setările au fost salvate local.");
      window.setTimeout(() => setSavedMessage(""), 2200);
    } catch {
      setSavedMessage("Nu am putut salva setările local.");
    }
  }

  function resetSettings() {
    if (!window.confirm("Resetezi toate setările la valorile default?")) return;
    setSettings(DEFAULT_SETTINGS);
    setSavedMessage("Setările au fost resetate.");
  }

  function applyToLibraryFilters() {
    const params = new URLSearchParams();
    params.set("page", "library");

    if (settings.dubbingLanguage) params.set("aiLanguage", settings.dubbingLanguage);
    if (settings.videoQuality) params.set("aiVideoQuality", settings.videoQuality);

    window.history.pushState({}, "", `/?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setSavedMessage("Preferințele au fost aplicate în AI Library.");
  }

  function copyViewingPreferences() {
    const payload = {
      subtitleLanguage: settings.subtitleLanguage,
      dubbingLanguage: settings.dubbingLanguage,
      videoQuality: settings.videoQuality,
      audioMode: settings.audioMode,
      watchMode: settings.watchMode
    };

    const text = JSON.stringify(payload, null, 2);

    navigator.clipboard?.writeText(text)
      .then(() => setSavedMessage("Preferințele video/subtitrări/dublaj au fost copiate."))
      .catch(() => setSavedMessage(text));
  }


  return (
    <section className="section settingsPage">
      <div className="settingsHero">
        <span className="pill">Setări CineVerse</span>
        <h2>Cont, preferințe, video, securitate și personalizare</h2>
        <p>
          Această pagină implementează meniul Setări cerut în prompt. Momentan salvează
          preferințele local în browser, iar modulele de cont, plăți și dispozitive sunt pregătite ca interfață.
        </p>
      </div>

      {savedMessage && <div className="settingsSavedMessage">{savedMessage}</div>}

      <div className="settingsActions">
        <button type="button" onClick={saveNow}>Salvează setările</button>
        <button type="button" onClick={applyToLibraryFilters}>Aplică în AI Library</button>
        <button type="button" className="secondary" onClick={copyViewingPreferences}>Copiază preferințe video</button>
        <button type="button" className="secondary" onClick={resetSettings}>Resetează</button>
      </div>

      <div className="settingsPreferencePreview">
        <strong>Preferințe active pentru filtrare:</strong>
        <span>Limba interfeței: {settings.interfaceLanguage}</span>
        <span>Subtitrări: {settings.subtitleLanguage}</span>
        <span>Dublaj / limbă conținut: {settings.dubbingLanguage}</span>
        <span>Calitate video: {settings.videoQuality}</span>
      </div>

      <div className="subtitleDubbingStatus">
        <div>
          <span className="pill">Subtitrări + Dublaj</span>
          <h3>Preferințe active pentru redare</h3>
          <p>
            Subtitrarea și dublajul sunt salvate stabil în Setări. AI Library folosește momentan
            filtrul general de limbă, iar filtrele separate Subtitrare/Dublaj vor fi conectate
            într-un pas următor, fără să stricăm pagina.
          </p>
        </div>

        <div className="subtitleDubbingPills">
          <span>Subtitrare: <strong>{settings.subtitleLanguage}</strong></span>
          <span>Dublaj: <strong>{settings.dubbingLanguage}</strong></span>
          <span>Calitate: <strong>{settings.videoQuality}</strong></span>
          <span>Audio: <strong>{settings.audioMode}</strong></span>
          <span>Mod vizionare: <strong>{settings.watchMode}</strong></span>
        </div>
      </div>

      <div className="settingsGrid">
        <article className="settingsCard">
          <h3>1. Cont și Preferințe Utilizator</h3>
          <p className="mutedText">Gestionare cont, preferințe de vizionare, istoric și profiluri.</p>

          <label>
            Limba interfeței
            <select value={settings.interfaceLanguage} onChange={(e) => update("interfaceLanguage", e.target.value)}>
              {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>

          <label>
            Limba subtitrărilor
            <select value={settings.subtitleLanguage} onChange={(e) => update("subtitleLanguage", e.target.value)}>
              {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>

          <label>
            Limba dublajului
            <select value={settings.dubbingLanguage} onChange={(e) => update("dubbingLanguage", e.target.value)}>
              {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>

          <div className="settingsInfoList">
            <span>Email / parolă: pregătit pentru autentificare</span>
            <span>Abonamente: pregătit pentru plăți</span>
            <span>Istoric vizionări: implementat local</span>
            <span>Liste salvate: watchlist local</span>
            <span>Profiluri multiple: în pregătire</span>
          </div>
        </article>

        <article className="settingsCard">
          <h3>2. Setări Video și Audio</h3>

          <label>
            Calitate video preferată
            <select value={settings.videoQuality} onChange={(e) => update("videoQuality", e.target.value)}>
              {VIDEO_QUALITIES.map((quality) => (
                <option key={quality} value={quality}>
                  {quality} {VIDEO_QUALITY_LABELS?.[quality] ? `- ${VIDEO_QUALITY_LABELS[quality]}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Audio
            <select value={settings.audioMode} onChange={(e) => update("audioMode", e.target.value)}>
              <option value="stereo">Stereo</option>
              <option value="surround">Surround</option>
              <option value="auto">Auto</option>
            </select>
          </label>

          <label>
            Mod de vizionare
            <select value={settings.watchMode} onChange={(e) => update("watchMode", e.target.value)}>
              <option value="normal">Normal</option>
              <option value="fullscreen">Ecran complet</option>
              <option value="mini-player">Mini-player</option>
            </select>
          </label>
        </article>

        <article className="settingsCard">
          <h3>3. Control Parental</h3>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.parentalEnabled}
              onChange={(e) => update("parentalEnabled", e.target.checked)}
            />
            Control parental: {settingBoolLabel(settings.parentalEnabled)}
          </label>

          <label>
            Limită vârstă
            <select value={settings.parentalAge} onChange={(e) => update("parentalAge", e.target.value)}>
              <option>7+</option>
              <option>12+</option>
              <option>16+</option>
              <option>18+</option>
            </select>
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.explicitFilter}
              onChange={(e) => update("explicitFilter", e.target.checked)}
            />
            Filtru conținut explicit: {settingBoolLabel(settings.explicitFilter)}
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.kidsProfile}
              onChange={(e) => update("kidsProfile", e.target.checked)}
            />
            Profil copii: {settingBoolLabel(settings.kidsProfile)}
          </label>
        </article>

        <article className="settingsCard">
          <h3>4. Interfață și Personalizare</h3>

          <label>
            Temă vizuală
            <select value={settings.theme} onChange={(e) => update("theme", e.target.value)}>
              <option value="dark">Mod întunecat</option>
              <option value="light">Mod luminos</option>
              <option value="red-cinema">Cinema roșu</option>
              <option value="blue-stream">Stream albastru</option>
            </select>
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => update("notifications", e.target.checked)}
            />
            Notificări filme noi: {settingBoolLabel(settings.notifications)}
          </label>

          <div className="settingsInfoList">
            <span>Personalizare homepage: în pregătire</span>
            <span>Aranjare carduri: în pregătire</span>
            <span>Teme vizuale: setare salvată local</span>
          </div>
        </article>

        <article className="settingsCard">
          <h3>5. Conectivitate și Dispozitive</h3>
          <div className="settingsInfoList">
            <span>Aplicații mobile: PWA disponibil</span>
            <span>Smart TV: pregătit pentru web app</span>
            <span>Chromecast / AirPlay: în pregătire</span>
            <span>Dispozitive conectate: în pregătire</span>
            <span>Console jocuri: web compatibility</span>
          </div>
        </article>

        <article className="settingsCard">
          <h3>6. Plăți și Abonamente</h3>
          <div className="settingsInfoList">
            <span>Gestionare abonament: placeholder</span>
            <span>Metode de plată: placeholder</span>
            <span>Facturi: placeholder</span>
            <span>Opțiuni premium: placeholder</span>
            <span>Coduri promoționale: placeholder</span>
          </div>
        </article>

        <article className="settingsCard">
          <h3>7. Asistență și Feedback</h3>
          <textarea placeholder="Scrie feedback sau sugestii pentru platformă..." />
          <div className="settingsInfoList">
            <span>Suport tehnic: pregătit</span>
            <span>Politică de confidențialitate: de adăugat</span>
            <span>Termeni de utilizare: de adăugat</span>
            <span>FAQ: de adăugat</span>
          </div>
        </article>

        <article className="settingsCard">
          <h3>8. Securitate și Confidențialitate</h3>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={(e) => update("twoFactor", e.target.checked)}
            />
            Autentificare în doi pași: {settingBoolLabel(settings.twoFactor)}
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.autoLogout}
              onChange={(e) => update("autoLogout", e.target.checked)}
            />
            Deconectare automată: {settingBoolLabel(settings.autoLogout)}
          </label>

          <div className="settingsInfoList">
            <span>Permisiuni date personale: pregătit</span>
            <span>Protecția datelor: pregătit</span>
          </div>
        </article>

        <article className="settingsCard">
          <h3>9. Accesibilitate</h3>

          <label>
            Dimensiune text
            <select value={settings.accessibilityText} onChange={(e) => update("accessibilityText", e.target.value)}>
              <option value="small">Mic</option>
              <option value="normal">Normal</option>
              <option value="large">Mare</option>
              <option value="extra-large">Foarte mare</option>
            </select>
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => update("highContrast", e.target.checked)}
            />
            Contrast ridicat: {settingBoolLabel(settings.highContrast)}
          </label>

          <label className="switchLine">
            <input
              type="checkbox"
              checked={settings.screenReader}
              onChange={(e) => update("screenReader", e.target.checked)}
            />
            Suport cititoare ecran: {settingBoolLabel(settings.screenReader)}
          </label>
        </article>

        <article className="settingsCard">
          <h3>10. Integrare cu Rețele Sociale</h3>

          {[
            ["socialFacebook", "Facebook"],
            ["socialGoogle", "Google"],
            ["socialTwitter", "Twitter"],
            ["socialYoutube", "YouTube"],
            ["socialTiktok", "TikTok"],
            ["socialDailymotion", "Dailymotion"],
            ["socialVimeo", "Vimeo"]
          ].map(([key, label]) => (
            <label className="switchLine" key={key}>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => update(key, e.target.checked)}
              />
              Conectare {label}: {settingBoolLabel(settings[key])}
            </label>
          ))}

          <div className="settingsInfoList">
            <span>Partajare filme: pregătit</span>
            <span>Recenzii și comentarii: în pregătire</span>
            <span>Activitatea prietenilor: în pregătire</span>
          </div>
        </article>
      </div>
    </section>
  );
}
