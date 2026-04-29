import React, { useEffect, useMemo, useState } from "react";
import {
  Settings,
  User,
  MonitorPlay,
  Shield,
  Palette,
  Cast,
  CreditCard,
  HelpCircle,
  Lock,
  Accessibility,
  Share2,
  Save,
  RotateCcw
} from "lucide-react";
import {
  LANGUAGES,
  VIDEO_QUALITIES,
  VIDEO_QUALITY_LABELS
} from "./taxonomy";

const STORAGE_KEY = "cineverse.settings.center.v1";

const DEFAULT_SETTINGS = {
  accountEmail: "",
  subscriptionPlan: "Free",
  subtitleLanguage: "Română",
  audioLanguage: "Română",
  videoQuality: "1080p",
  audioMode: "Stereo",
  watchMode: "Normal",
  parentalAge: "18+",
  parentalPin: "",
  explicitFilter: true,
  kidsProfile: false,
  themeMode: "Dark",
  homeLayout: "Standard",
  notifications: true,
  visualTheme: "CineVerse Red",
  syncMobile: true,
  chromecast: true,
  airplay: false,
  connectedDevices: "Telefon Android",
  paymentMethod: "",
  premiumOptions: false,
  supportEmail: "",
  privacyAccepted: false,
  twoFactor: false,
  autoLogout: "Niciodată",
  dataProtection: true,
  textSize: "Normal",
  contrast: "Normal",
  keyboardShortcuts: true,
  screenReader: false,
  facebook: false,
  google: false,
  twitter: false,
  youtube: true,
  tiktok: true,
  dailymotion: false,
  vimeo: false,
  socialSharing: true,
  reviews: true,
  friendsActivity: false
};

const sections = [
  {
    id: "account",
    title: "1. Cont și Preferințe Utilizator",
    icon: User,
    description: "Email, abonament, preferințe de vizionare, istoric și profiluri."
  },
  {
    id: "video",
    title: "2. Setări Video și Audio",
    icon: MonitorPlay,
    description: "Calitate video, audio, subtitrări, dublaj și mod de vizionare."
  },
  {
    id: "parental",
    title: "3. Control Parental",
    icon: Shield,
    description: "Restricții de vârstă, PIN, conținut explicit și profil copil."
  },
  {
    id: "interface",
    title: "4. Interfață și Personalizare",
    icon: Palette,
    description: "Mod întunecat/luminos, layout, notificări și temă vizuală."
  },
  {
    id: "devices",
    title: "5. Conectivitate și Dispozitive",
    icon: Cast,
    description: "Mobile, Smart TV, Chromecast, AirPlay și dispozitive conectate."
  },
  {
    id: "payments",
    title: "6. Plăți și Abonamente",
    icon: CreditCard,
    description: "Metode de plată, facturi, premium și coduri promoționale."
  },
  {
    id: "support",
    title: "7. Asistență și Feedback",
    icon: HelpCircle,
    description: "Suport tehnic, sugestii, termeni, confidențialitate și FAQ."
  },
  {
    id: "security",
    title: "8. Securitate și Confidențialitate",
    icon: Lock,
    description: "2FA, date personale, auto logout și protecția datelor."
  },
  {
    id: "accessibility",
    title: "9. Accesibilitate",
    icon: Accessibility,
    description: "Text, contrast, scurtături și cititoare de ecran."
  },
  {
    id: "social",
    title: "10. Integrare cu Rețele Sociale",
    icon: Share2,
    description: "Facebook, Google, Twitter, YouTube, TikTok, Dailymotion și Vimeo."
  }
];

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Field({ label, children }) {
  return (
    <label className="settingsField">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="settingsToggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export default function SettingsCenter() {
  const [settings, setSettings] = useState(readSettings);
  const [active, setActive] = useState("account");
  const [message, setMessage] = useState("");

  const activeSection = useMemo(
    () => sections.find((item) => item.id === active) || sections[0],
    [active]
  );

  useEffect(() => {
    try {
      document.documentElement.dataset.cineverseTheme = settings.themeMode;
      document.documentElement.dataset.cineverseContrast = settings.contrast;
      document.documentElement.dataset.cineverseTextSize = settings.textSize;
    } catch {}
  }, [settings.themeMode, settings.contrast, settings.textSize]);

  function update(key, value) {
    setSettings((old) => ({ ...old, [key]: value }));
    setMessage("");
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage("Setările au fost salvate local în CineVerse.");
  }

  function reset() {
    if (!window.confirm("Resetezi toate setările CineVerse la valorile implicite?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
    setMessage("Setările au fost resetate.");
  }

  return (
    <section className="section settingsCenter">
      <div className="sectionHeader">
        <div>
          <span className="pill">Settings Center v1</span>
          <h2><Settings size={24} /> Setări CineVerse</h2>
          <p>
            Meniu complet pentru cont, video, parental, interfață, dispozitive,
            plăți, suport, securitate, accesibilitate și rețele sociale.
          </p>
        </div>
        <div className="settingsActions">
          <button type="button" onClick={save}><Save size={17} /> Salvează</button>
          <button type="button" className="secondary" onClick={reset}><RotateCcw size={17} /> Reset</button>
        </div>
      </div>

      {message && <div className="successBox">{message}</div>}

      <div className="settingsLayout">
        <aside className="settingsSidebar">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={active === item.id ? "settingsNav active" : "settingsNav"}
                onClick={() => setActive(item.id)}
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </aside>

        <div className="settingsPanel">
          <div className="settingsPanelHeader">
            <activeSection.icon size={26} />
            <div>
              <h3>{activeSection.title}</h3>
              <p>{activeSection.description}</p>
            </div>
          </div>

          {active === "account" && (
            <div className="settingsGrid">
              <Field label="Email cont">
                <input value={settings.accountEmail} onChange={(e) => update("accountEmail", e.target.value)} placeholder="email@exemplu.com" />
              </Field>
              <Field label="Abonament">
                <select value={settings.subscriptionPlan} onChange={(e) => update("subscriptionPlan", e.target.value)}>
                  <option>Free</option>
                  <option>Premium</option>
                  <option>Family</option>
                  <option>Admin</option>
                </select>
              </Field>
              <Field label="Limba subtitrărilor">
                <select value={settings.subtitleLanguage} onChange={(e) => update("subtitleLanguage", e.target.value)}>
                  {LANGUAGES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <Field label="Limba audio/dublaj">
                <select value={settings.audioLanguage} onChange={(e) => update("audioLanguage", e.target.value)}>
                  {LANGUAGES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <div className="settingsInfo">Istoricul vizionărilor și listele salvate sunt deja active în platformă.</div>
              <div className="settingsInfo">Profiluri multiple: interfață pregătită, conturile reale se vor lega când adăugăm autentificare.</div>
            </div>
          )}

          {active === "video" && (
            <div className="settingsGrid">
              <Field label="Calitate video">
                <select value={settings.videoQuality} onChange={(e) => update("videoQuality", e.target.value)}>
                  {VIDEO_QUALITIES.map((q) => (
                    <option key={q} value={q}>{VIDEO_QUALITY_LABELS[q] || q}</option>
                  ))}
                </select>
              </Field>
              <Field label="Audio">
                <select value={settings.audioMode} onChange={(e) => update("audioMode", e.target.value)}>
                  <option>Stereo</option>
                  <option>Surround</option>
                  <option>Auto</option>
                </select>
              </Field>
              <Field label="Mod vizionare">
                <select value={settings.watchMode} onChange={(e) => update("watchMode", e.target.value)}>
                  <option>Normal</option>
                  <option>Ecran complet</option>
                  <option>Mini-player</option>
                </select>
              </Field>
              <div className="settingsInfo">Subtitrarea și dublajul folosesc limba aleasă în Cont și Preferințe.</div>
            </div>
          )}

          {active === "parental" && (
            <div className="settingsGrid">
              <Field label="Restricție vârstă">
                <select value={settings.parentalAge} onChange={(e) => update("parentalAge", e.target.value)}>
                  <option>0+</option>
                  <option>7+</option>
                  <option>12+</option>
                  <option>16+</option>
                  <option>18+</option>
                </select>
              </Field>
              <Field label="PIN parental">
                <input value={settings.parentalPin} onChange={(e) => update("parentalPin", e.target.value)} placeholder="PIN local" />
              </Field>
              <Toggle checked={settings.explicitFilter} onChange={(v) => update("explicitFilter", v)} label="Filtrare conținut explicit" />
              <Toggle checked={settings.kidsProfile} onChange={(v) => update("kidsProfile", v)} label="Profil copil activ" />
            </div>
          )}

          {active === "interface" && (
            <div className="settingsGrid">
              <Field label="Mod interfață">
                <select value={settings.themeMode} onChange={(e) => update("themeMode", e.target.value)}>
                  <option>Dark</option>
                  <option>Light</option>
                  <option>Auto</option>
                </select>
              </Field>
              <Field label="Layout pagină principală">
                <select value={settings.homeLayout} onChange={(e) => update("homeLayout", e.target.value)}>
                  <option>Standard</option>
                  <option>Compact</option>
                  <option>Cinematic</option>
                </select>
              </Field>
              <Field label="Temă vizuală">
                <select value={settings.visualTheme} onChange={(e) => update("visualTheme", e.target.value)}>
                  <option>CineVerse Red</option>
                  <option>Ocean</option>
                  <option>Galaxy</option>
                  <option>Minimal</option>
                </select>
              </Field>
              <Toggle checked={settings.notifications} onChange={(v) => update("notifications", v)} label="Notificări despre filme noi" />
            </div>
          )}

          {active === "devices" && (
            <div className="settingsGrid">
              <Toggle checked={settings.syncMobile} onChange={(v) => update("syncMobile", v)} label="Sincronizare aplicații mobile și Smart TV" />
              <Toggle checked={settings.chromecast} onChange={(v) => update("chromecast", v)} label="Chromecast activ" />
              <Toggle checked={settings.airplay} onChange={(v) => update("airplay", v)} label="AirPlay activ" />
              <Field label="Dispozitive conectate">
                <textarea value={settings.connectedDevices} onChange={(e) => update("connectedDevices", e.target.value)} />
              </Field>
              <div className="settingsInfo">Compatibilitate console: planificată pentru versiunea cu conturi reale.</div>
            </div>
          )}

          {active === "payments" && (
            <div className="settingsGrid">
              <Field label="Metodă plată">
                <input value={settings.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} placeholder="Card / PayPal / altă metodă" />
              </Field>
              <Field label="Cod promoțional">
                <input placeholder="CINEVERSE2026" />
              </Field>
              <Toggle checked={settings.premiumOptions} onChange={(v) => update("premiumOptions", v)} label="Opțiuni premium active" />
              <div className="settingsInfo">Facturile și plățile reale vor necesita autentificare + provider de plăți.</div>
            </div>
          )}

          {active === "support" && (
            <div className="settingsGrid">
              <Field label="Email suport">
                <input value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} placeholder="suport@cineverse.ro" />
              </Field>
              <Field label="Feedback / sugestii">
                <textarea placeholder="Scrie sugestia ta..." />
              </Field>
              <Toggle checked={settings.privacyAccepted} onChange={(v) => update("privacyAccepted", v)} label="Am citit politica de confidențialitate și termenii" />
              <div className="settingsInfo">FAQ și ghid de utilizare: pregătite pentru conținut static în următorul pas.</div>
            </div>
          )}

          {active === "security" && (
            <div className="settingsGrid">
              <Toggle checked={settings.twoFactor} onChange={(v) => update("twoFactor", v)} label="Autentificare în doi pași" />
              <Field label="Deconectare automată">
                <select value={settings.autoLogout} onChange={(e) => update("autoLogout", e.target.value)}>
                  <option>Niciodată</option>
                  <option>După 15 minute</option>
                  <option>După 1 oră</option>
                  <option>După 24 ore</option>
                </select>
              </Field>
              <Toggle checked={settings.dataProtection} onChange={(v) => update("dataProtection", v)} label="Protecția datelor personale" />
              <div className="settingsInfo">Permisiuni și date personale: vor fi legate de conturi reale când adăugăm autentificare.</div>
            </div>
          )}

          {active === "accessibility" && (
            <div className="settingsGrid">
              <Field label="Dimensiune text">
                <select value={settings.textSize} onChange={(e) => update("textSize", e.target.value)}>
                  <option>Mic</option>
                  <option>Normal</option>
                  <option>Mare</option>
                  <option>Foarte mare</option>
                </select>
              </Field>
              <Field label="Contrast">
                <select value={settings.contrast} onChange={(e) => update("contrast", e.target.value)}>
                  <option>Normal</option>
                  <option>Ridicat</option>
                </select>
              </Field>
              <Toggle checked={settings.keyboardShortcuts} onChange={(v) => update("keyboardShortcuts", v)} label="Comenzi rapide pentru navigare" />
              <Toggle checked={settings.screenReader} onChange={(v) => update("screenReader", v)} label="Suport cititoare de ecran" />
            </div>
          )}

          {active === "social" && (
            <div className="settingsGrid">
              <Toggle checked={settings.facebook} onChange={(v) => update("facebook", v)} label="Facebook" />
              <Toggle checked={settings.google} onChange={(v) => update("google", v)} label="Google" />
              <Toggle checked={settings.twitter} onChange={(v) => update("twitter", v)} label="Twitter/X" />
              <Toggle checked={settings.youtube} onChange={(v) => update("youtube", v)} label="YouTube" />
              <Toggle checked={settings.tiktok} onChange={(v) => update("tiktok", v)} label="TikTok" />
              <Toggle checked={settings.dailymotion} onChange={(v) => update("dailymotion", v)} label="Dailymotion" />
              <Toggle checked={settings.vimeo} onChange={(v) => update("vimeo", v)} label="Vimeo" />
              <Toggle checked={settings.socialSharing} onChange={(v) => update("socialSharing", v)} label="Partajarea filmelor preferate" />
              <Toggle checked={settings.reviews} onChange={(v) => update("reviews", v)} label="Recenzii și comentarii" />
              <Toggle checked={settings.friendsActivity} onChange={(v) => update("friendsActivity", v)} label="Activitatea prietenilor" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
