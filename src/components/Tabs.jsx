import React from "react";

export default function Tabs({ tabs, value, onChange }) {
  return (
    <>
      <div className="tabs">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            className={`tab ${value === t.key ? "tabActive" : ""}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mobileNav" aria-label="Navegación principal">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.key}
            className={`mobileNavButton ${value === t.key ? "mobileNavButtonActive" : ""}`}
            onClick={() => onChange(t.key)}
          >
            <span className="mobileNavLabel">{t.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
