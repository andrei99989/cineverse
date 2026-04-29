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

const STEP_ORDER = ["country", "genre", "year", "type", "language", "quality"];

const STEP_LABELS = {
  country: "Țară",
  genre: "Gen",
  year: "An",
  type: "Type",
  language: "Limba",
  quality: "Calitate"
};

const DEFAULT_SELECTIONS = {
  country: "",
  genre: "",
  year: "",
  fromYear: "",
  toYear: "",
  type: "",
  language: "",
  quality: ""
};

function uniqueList(list = []) {
  return Array.from(new Set(["All", ...list.filter(Boolean)]));
}

function buildQuery(selection) {
  const params = new URLSearchParams(window.location.search);

  if (selection.country && selection.country !== "All") params.set("aiCountry", selection.country);
  else params.delete("aiCountry");

  if (selection.genre && selection.genre !== "All") params.set("aiGenre", selection.genre);
  else params.delete("aiGenre");

  if (selection.year && selection.year !== "All") params.set("aiYear", selection.year);
  else params.delete("aiYear");

  if (selection.type && selection.type !== "All") params.set("aiCategory", selection.type);
  else params.delete("aiCategory");

  if (selection.language && selection.language !== "All") params.set("aiLanguage", selection.language);
  else params.delete("aiLanguage");

  if (selection.quality && selection.quality !== "All") params.set("aiVideoQuality", selection.quality);
  else params.delete("aiVideoQuality");

  if (selection.fromYear) params.set("fromYear", selection.fromYear);
  else params.delete("fromYear");

  if (selection.toYear) params.set("toYear", selection.toYear);
  else params.delete("toYear");

  params.set("page", "ai-library");
  params.set("wizard", "1");

  return params.toString();
}

export default function FilterWizard({ onApply }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selection, setSelection] = useState(DEFAULT_SELECTIONS);

  const currentStep = STEP_ORDER[stepIndex];
  const selectedCountry = selection.country && selection.country !== "All" ? selection.country : "";

  const availableGenres = useMemo(() => {
    if (selection.type && selection.type !== "All") {
      return uniqueList(getGenresForCategory(selection.type));
    }

    const allGenres = CONTENT_CATEGORIES.flatMap((category) => getGenresForCategory(category));
    return uniqueList(allGenres);
  }, [selection.type]);

  function updateField(field, value) {
    setSelection((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function nextStep() {
    setStepIndex((prev) => Math.min(STEP_ORDER.length - 1, prev + 1));
  }

  function previousStep() {
    setStepIndex((prev) => Math.max(0, prev - 1));
  }

  function resetWizard() {
    setSelection(DEFAULT_SELECTIONS);
    setStepIndex(0);
  }

  function applyFilters() {
    const query = buildQuery(selection);

    if (typeof onApply === "function") {
      onApply(selection);
      return;
    }

    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.pushState({}, "", nextUrl);
    window.dispatchEvent(new Event("popstate"));
    window.dispatchEvent(new CustomEvent("cineverse-filter-wizard-apply", { detail: selection }));
  }

  function renderStep() {
    if (currentStep === "country") {
      return (
        <div className="wizardStep">
          <h3>Alege țara</h3>
          <p className="mutedText">Țara aleasă va rămâne afișată în pașii următori.</p>
          <select value={selection.country} onChange={(e) => updateField("country", e.target.value)}>
            {uniqueList(COUNTRIES).map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      );
    }

    if (currentStep === "genre") {
      return (
        <div className="wizardStep">
          <h3>Alege genul</h3>
          <p className="mutedText">Poți reveni după ce alegi Type, iar lista de genuri se va adapta.</p>
          <select value={selection.genre} onChange={(e) => updateField("genre", e.target.value)}>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      );
    }

    if (currentStep === "year") {
      return (
        <div className="wizardStep">
          <h3>Alege anul sau intervalul</h3>
          <div className="wizardGrid">
            <label>
              An exact
              <select value={selection.year} onChange={(e) => updateField("year", e.target.value)}>
                {uniqueList(YEARS).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label>
              De la anul
              <select value={selection.fromYear} onChange={(e) => updateField("fromYear", e.target.value)}>
                {["", ...YEARS].map((year) => (
                  <option key={`from-${year || "empty"}`} value={year}>{year || "Fără limită"}</option>
                ))}
              </select>
            </label>
            <label>
              Până la anul
              <select value={selection.toYear} onChange={(e) => updateField("toYear", e.target.value)}>
                {["", ...YEARS].map((year) => (
                  <option key={`to-${year || "empty"}`} value={year}>{year || "Fără limită"}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      );
    }

    if (currentStep === "type") {
      return (
        <div className="wizardStep">
          <h3>Alege Type</h3>
          <select value={selection.type} onChange={(e) => updateField("type", e.target.value)}>
            {uniqueList(CONTENT_CATEGORIES).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      );
    }

    if (currentStep === "language") {
      return (
        <div className="wizardStep">
          <h3>Alege limba</h3>
          <select value={selection.language} onChange={(e) => updateField("language", e.target.value)}>
            {uniqueList(LANGUAGES).map((language) => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="wizardStep">
        <h3>Alege calitatea</h3>
        <select value={selection.quality} onChange={(e) => updateField("quality", e.target.value)}>
          {uniqueList(VIDEO_QUALITIES).map((quality) => (
            <option key={quality} value={quality}>
              {quality === "All" ? "All" : VIDEO_QUALITY_LABELS?.[quality] || quality}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <section className="section filterWizardBox">
      <div className="wizardHeader">
        <div>
          <span className="pill">Filter Wizard v1</span>
          <h2>Meniu filtrare pas-cu-pas</h2>
          <p>Parcurge filtrele în ordine: Țară → Gen → An → Type → Limba → Calitate.</p>
        </div>
        {selectedCountry && (
          <div className="wizardSelectedCountry">
            <span className="mutedText">Țară selectată</span>
            <strong>{selectedCountry}</strong>
          </div>
        )}
      </div>

      <div className="wizardStepsBar">
        {STEP_ORDER.map((step, index) => (
          <button
            key={step}
            type="button"
            className={index === stepIndex ? "active" : index < stepIndex ? "done" : ""}
            onClick={() => setStepIndex(index)}
          >
            {index + 1}. {STEP_LABELS[step]}
          </button>
        ))}
      </div>

      {renderStep()}

      <div className="wizardSummary">
        <strong>Selecții curente:</strong>
        <span>Țară: {selection.country || "All"}</span>
        <span>Gen: {selection.genre || "All"}</span>
        <span>An: {selection.year || "All"}</span>
        <span>Interval: {selection.fromYear || "-"} / {selection.toYear || "-"}</span>
        <span>Type: {selection.type || "All"}</span>
        <span>Limba: {selection.language || "All"}</span>
        <span>Calitate: {selection.quality || "All"}</span>
      </div>

      <div className="wizardActions">
        <button type="button" className="secondary" onClick={previousStep} disabled={stepIndex === 0}>
          Înapoi
        </button>
        {stepIndex < STEP_ORDER.length - 1 ? (
          <button type="button" onClick={nextStep}>
            Următorul meniu
          </button>
        ) : (
          <button type="button" onClick={applyFilters}>
            Aplică filtrele
          </button>
        )}
        <button type="button" className="secondary" onClick={resetWizard}>
          Resetează
        </button>
      </div>
    </section>
  );
}
