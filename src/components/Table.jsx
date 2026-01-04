import React from "react";

export default function Table({ columns, rows, emptyText = "Sin datos", maxHeight, scrollThreshold }) {
  const shouldScroll = typeof scrollThreshold === "number" ? rows.length > scrollThreshold : Boolean(maxHeight);
  const wrapStyle = shouldScroll && maxHeight ? { maxHeight, overflowY: "auto" } : undefined;

  return (
    <div className="tableWrap" style={wrapStyle}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="tableEmpty">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={r.id || idx} className={r._rowClass || ""}>
                {columns.map((c) => (
                  <td key={c.key} data-label={c.header}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
