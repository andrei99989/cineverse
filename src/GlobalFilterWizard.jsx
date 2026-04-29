import React, { useMemo, useState } from "react";
import {
  CONTENT_CATEGORIES,
  COUNTRIES,
  LANGUAGES,
  VIDEO_QUALITIES,
  VIDEO_QUALITY_LABELS,
  YEARS,
  getGenresForCategory
} from "./taxonomy";

const STEPS = [
  { key: "country", label: "Țară" },
  { key: "genre", label: "Gen" },
  { key: "year", label: "An" },
  { key: "type", label: "Type" },
  { key: "language", label: "Limba" },
  { key: "quality", label: "Calitate" }
];

function unique(list) {
  return Array.from(new Set((list || []).filter(Boolean)));
}

function getAllGenres() {
  const all = [];
  for (const category of CONTENT_CATEGORIES) {
    all.push(...getGenresForCategory(category));
  }

  all.push(
    "Thriller",
    "Istoric",
    "Polițist",
    "Biografic",
    "Social",
    "Mitologic",
    "Satiră",
    "Psihologic",
    "Familie",
    "Suspans",
    "Crime",
    "Epice",
    "Slice of Life",
    "Mecha",
    "Supernatural",
    "Psychological",
    "Historical",
    "Gore",
    "Ecchi",
    "Isekai",
    "Josei",
    "Seinen",
    "Shoujo-ai",
    "Shounen-ai",
    "Cyberpunk",
    "Post-apocaliptic",
    "Steampunk",
    "Harem",
    "Yuri",
    "Yaoi",
    "WWE",
    "UFC",
    "MMA",
    "NBA",
    "F1",
    "Football",
    "Box",
    "Manele",
    "RNB",
    "Hip Hop",
    "Jazz",
    "Trap",
    "Rapp",
    "Reggaeton",
    "Entertainment",
    "Reality Show",
    "Talk Show",
    "Documentar",
    "Game Show",
    "Revelion",
    "Culinare",
    "Știri",
    "Supranatural"
  );

  return unique(all).sort((a, b) => a.localeCompare(b, "ro"));
}

function toFilterUrl(selection) {
  const params = new URLSearchParams();
  params.set("page", "library");

  if (selection.country) params.set("aiCountry", selection.country);
  if (selection.genre) params.set("aiGenre", selection.genre);
  if (selection.year) params.set("aiYear", selection.year);
  if (selection.type) params.set("aiCategory", selection.type);
  if (selection.language) params.set("aiLanguage", selection.language);
  if (selection.quality) params.set("aiVideoQuality", selection.quality);

  return `/?${params.toString()}`;
}

export default function GlobalFilterWizard({ onGoToLibrary }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState({
    country: "",
    genre: "",
    year: "",
    type: "",
    language: "",
    quality: ""
  });

  const genres = useMemo(() => getAllGenres(), []);
  const current = STEPS[stepIndex];

  function setValue(key, value) {
    const next = { ...selection, [key]: value };
    setSelection(next);

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  function resetWizard() {
    setSelection({
      country: "",
      genre: "",
      year: "",
      type: "",
      language: "",
      quality: ""
    });
    setStepIndex(0);
  }

  function openResults() {
    const url = toFilterUrl(selection);
    window.history.pushState({}, "", url);
    onGoToLibrary?.();
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const options = {
    country: COUNTRIES,
    genre: genres,
    year: YEARS,
    type: CONTENT_CATEGORIES,
    language: LANGUAGES,
    quality: VIDEO_QUALITIES
  }[current.key];

  return (
    <section className="section globalFilterWizard">
      <div className="wizardHero">
        <span className="pill">Filtru Global</span>
        <h2>Meniu pas cu pas: Țară → Gen → An → Type → Limba → Calitate</h2>
        <p>
          Alege criteriile în ordinea cerută în prompt. Țara selectată rămâne afișată sus
          ca referință pentru pașii următori.
        </p>
      </div>

      <div className="wizardSelectedBar">
        <strong>Selecție curentă:</strong>
        <span>Țară: {selection.country || "-"}</span>
        <span>Gen: {selection.genre || "-"}</span>
        <span>An: {selection.year || "-"}</span>
        <span>Type: {selection.type || "-"}</span>
        <span>Limba: {selection.language || "-"}</span>
        <span>Calitate: {selection.quality || "-"}</span>
      </div>

      <div className="wizardSteps">
        {STEPS.map((step, index) => (
          <button
            key={step.key}
            type="button"
            className={index === stepIndex ? "active" : selection[step.key] ? "done" : ""}
            onClick={() => setStepIndex(index)}
          >
            {index + 1}. {step.label}
          </button>
        ))}
      </div>

      <div className="wizardPanel">
        {selection.country && current.key !== "country" && (
          <div className="wizardReference">
            Țara selectată: <strong>{selection.country}</strong>
          </div>
        )}

        <h3>{current.label}</h3>
        <p className="mutedText">
          Pasul {stepIndex + 1} din {STEPS.length}. Selectează o opțiune ca să mergi mai departe.
        </p>

        <div className="wizardOptionsGrid">
          {options.map((item) => (
            <button
              key={item}
              type="button"
              className={selection[current.key] === item ? "selected" : ""}
              onClick={() => setValue(current.key, item)}
            >
              {current.key === "quality"
                ? `${item} ${VIDEO_QUALITY_LABELS?.[item] ? "· " + VIDEO_QUALITY_LABELS[item] : ""}`
                : item}
            </button>
          ))}
        </div>
      </div>

      <div className="wizardActions">
        <button
          type="button"
          className="secondary"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((x) => Math.max(0, x - 1))}
        >
          Înapoi
        </button>

        <button
          type="button"
          className="secondary"
          disabled={stepIndex === STEPS.length - 1}
          onClick={() => setStepIndex((x) => Math.min(STEPS.length - 1, x + 1))}
        >
          Înainte
        </button>

        <button type="button" className="secondary" onClick={resetWizard}>
          Resetează
        </button>

        <button type="button" onClick={openResults}>
          Vezi rezultate filtrate
        </button>
      </div>
    </section>
  );
}
