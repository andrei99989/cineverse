import React, { useMemo, useState } from "react";
import { COUNTRIES } from "./taxonomy";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function countryLetter(country) {
  return String(country || "").charAt(0).toUpperCase();
}

export default function CountryPage({ onGoToLibrary }) {
  const [query, setQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const filteredCountries = useMemo(() => {
    const q = normalizeText(query);
    return COUNTRIES.filter((country) => normalizeText(country).includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    return filteredCountries.reduce((acc, country) => {
      const letter = countryLetter(country);
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(country);
      return acc;
    }, {});
  }, [filteredCountries]);

  function openCountry(country) {
    setSelectedCountry(country);

    const params = new URLSearchParams();
    params.set("page", "library");
    params.set("aiCountry", country);

    window.history.pushState({}, "", `/?${params.toString()}`);
    onGoToLibrary?.();
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function copyCountryLink(country) {
    const params = new URLSearchParams();
    params.set("page", "library");
    params.set("aiCountry", country);

    const url = `${window.location.origin}/?${params.toString()}`;

    navigator.clipboard?.writeText(url)
      .then(() => alert(`Link copiat pentru ${country}`))
      .catch(() => alert(url));
  }

  return (
    <section className="section countryPage">
      <div className="countryHero">
        <span className="pill">Meniu Țară</span>
        <h2>Filtrează platforma după țară</h2>
        <p>
          Alege o țară din lista completă. După selectare, AI Library se deschide automat
          cu filtrul de țară aplicat.
        </p>
      </div>

      <div className="countrySearchBar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Caută țară: România, India, Japonia, Coreea de Sud..."
        />
        <span className="pill">{filteredCountries.length} țări</span>
      </div>

      {selectedCountry && (
        <div className="countrySelectedBox">
          <strong>Țară selectată:</strong>
          <span>{selectedCountry}</span>
          <button type="button" onClick={() => openCountry(selectedCountry)}>
            Deschide rezultate
          </button>
          <button type="button" className="secondary" onClick={() => copyCountryLink(selectedCountry)}>
            Copiază link
          </button>
        </div>
      )}

      <div className="countryGroups">
        {Object.entries(grouped).map(([letter, countries]) => (
          <div className="countryGroup" key={letter}>
            <h3>{letter}</h3>
            <div className="countryGrid">
              {countries.map((country) => (
                <button
                  key={country}
                  type="button"
                  className={selectedCountry === country ? "selected" : ""}
                  onClick={() => openCountry(country)}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
