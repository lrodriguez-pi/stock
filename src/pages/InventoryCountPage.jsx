import React, { useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/Card.jsx";
import Table from "../components/Table.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useStock } from "../hooks/useStock.js";
import { useMovements } from "../hooks/useMovements.js";
import { MovementType } from "../domain/types.js";
import { can, PermissionAction } from "../domain/permissions.js";

export default function InventoryCountPage() {
  const { state, role } = useStockContext();
  const { stockById } = useStock();
  const { addMovement } = useMovements();
  const inputRefs = useRef([]);

  const [countById, setCountById] = useState({});
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyLow, setOnlyLow] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const canAdjust = can(role, PermissionAction.MOVEMENT_CREATE_ADJUST);

  const categoryOptions = useMemo(() => {
    const set = new Set(state.products.map((p) => normalizeCategory(p.category)));
    return ["ALL", ...Array.from(set).sort()];
  }, [state.products]);

  const filteredProducts = useMemo(() => {
    return state.products
      .filter((p) => (onlyActive ? p.active !== false : true))
      .filter((p) => {
        if (!onlyLow) return true;
        const stock = stockById[p.id] ?? 0;
        return stock <= (p.minStock ?? 0);
      })
      .filter((p) => {
        if (categoryFilter === "ALL") return true;
        return normalizeCategory(p.category) === categoryFilter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.products, onlyActive, onlyLow, categoryFilter, stockById]);

  useEffect(() => {
    setCountById((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const product of state.products) {
        if (next[product.id] === undefined) {
          next[product.id] = String(stockById[product.id] ?? 0);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [state.products, stockById]);

  const rows = useMemo(() => {
    return filteredProducts.map((product, index) => {
      const stockActual = stockById[product.id] ?? 0;
      const rawCount = countById[product.id];
      const stockReal = parseCount(rawCount, stockActual);
      const diff = stockReal - stockActual;
      const diffLabel = buildDiffLabel(diff);
      const diffClass = diff === 0 ? "diffZero" : diff > 0 ? "diffPositive" : "diffNegative";
      const rowClass = diff === 0 ? "" : "rowAdjust";

      return {
        id: product.id,
        name: product.name,
        stockActual,
        stockReal,
        diff,
        diffLabel,
        diffClass,
        rowClass,
        index
      };
    });
  }, [filteredProducts, stockById, countById]);

  const hasDifferences = rows.some((row) => row.diff !== 0);

  function handleCountChange(productId, value) {
    setCountById((prev) => ({ ...prev, [productId]: value }));
  }

  function handleKeyDown(event, index) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    inputRefs.current[index + 1]?.focus();
  }

  function handleConfirm() {
    if (!canAdjust) {
      alert("No tienes permiso para ajustar stock.");
      return;
    }

    const adjustments = state.products
      .map((product) => {
        const stockActual = stockById[product.id] ?? 0;
        const stockReal = parseCount(countById[product.id], stockActual);
        const diff = stockReal - stockActual;
        if (diff === 0) return null;
        return { productId: product.id, qty: stockReal };
      })
      .filter(Boolean);

    if (!adjustments.length) {
      alert("No hay ajustes para confirmar.");
      return;
    }

    let ok = true;
    for (const adjustment of adjustments) {
      const created = addMovement({
        productId: adjustment.productId,
        type: MovementType.ADJUST,
        qty: adjustment.qty,
        note: "Conteo"
      });
      if (!created) ok = false;
    }

    if (!ok) return;

    setCountById({});
    setOnlyLow(false);
    setOnlyActive(true);
    setCategoryFilter("ALL");
  }

  const columns = [
    { key: "name", header: "Producto" },
    {
      key: "stockActual",
      header: "Stock actual",
      render: (row) => <b>{row.stockActual}</b>
    },
    {
      key: "stockReal",
      header: "Stock real",
      render: (row) => (
        <input
          ref={(el) => {
            inputRefs.current[row.index] = el;
          }}
          className="input countInput"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={countById[row.id] ?? ""}
          onChange={(e) => handleCountChange(row.id, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, row.index)}
          autoFocus={row.index === 0}
        />
      )
    },
    {
      key: "diff",
      header: "Diferencia",
      render: (row) => (
        <span className={`countDiff ${row.diffClass}`}>{row.diffLabel}</span>
      )
    }
  ];

  return (
    <div className="countPage">
      <Card
        title="Conteo fisico"
        right={(
          <button
            className="btnPrimary"
            type="button"
            onClick={handleConfirm}
            disabled={!hasDifferences}
          >
            Confirmar conteo
          </button>
        )}
      >
        <div className="productFilters countFilters">
          <label className="row gap">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
            />
            <span className="muted">Solo activos</span>
          </label>
          <label className="row gap">
            <input
              type="checkbox"
              checked={onlyLow}
              onChange={(e) => setOnlyLow(e.target.checked)}
            />
            <span className="muted">Solo stock bajo</span>
          </label>
          <select
            className="input selectInput"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <Table
          columns={columns}
          rows={rows.map((row) => ({ ...row, _rowClass: row.rowClass }))}
          emptyText="No hay productos para contar."
          maxHeight="520px"
          scrollThreshold={8}
        />
      </Card>
    </div>
  );
}

function normalizeCategory(category) {
  const value = (category || "").trim();
  return value || "Sin categoria";
}

function parseCount(value, fallback) {
  if (value === "" || value === undefined || value === null) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildDiffLabel(diff) {
  if (diff === 0) return "Sin cambio";
  if (diff > 0) return `Ingreso +${diff}`;
  return `Salida ${diff}`;
}
