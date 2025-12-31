import React from "react";
import { useStockContext } from "../state/StockContext.jsx";
import { useStock } from "../hooks/useStock.js";
import { MovementType } from "../domain/types.js";

export default function Dashboard({ onGoToProducts, onGoToMovements }) {
  const { state } = useStockContext();
  const { stockById, metrics } = useStock();

  const lowProducts = state.products
    .filter((p) => p.active !== false)
    .map((p) => ({
      ...p,
      stock: stockById[p.id] ?? 0
    }))
    .filter((p) => p.stock <= (p.minStock ?? 0))
    .sort((a, b) => a.stock - b.stock);

  return (
    <div className="dashboardPage">
      <section className="alertCard">
        <div className="alertTop">
          <div className="alertLabel">
            <span className="alertIcon" aria-hidden="true">⚠️</span>
            <span>Stock crítico ({lowProducts.length})</span>
          </div>
          <span className="alertChevron" aria-hidden="true">›</span>
        </div>

        <div className="alertBody">
          {lowProducts.length ? (
            <div className="criticalList">
              {lowProducts.map((criticalProduct) => (
                <div className="criticalRow" key={criticalProduct.id}>
                  <div className="productInfo">
                    <div className="productTitle">
                      <span>{criticalProduct.name}</span>
                      {criticalProduct.sku ? <span className="muted">({criticalProduct.sku})</span> : null}
                      <span className="badgeCritical">Stock crítico</span>
                    </div>
                    <div className="muted">{criticalProduct.category || "Sin categoría"}</div>
                    <div className="stockRow">
                      <span>Stock actual: <span className="value">{criticalProduct.stock}</span></span>
                      <span>Mínimo: <span className="value">{criticalProduct.minStock ?? 0}</span></span>
                    </div>
                  </div>

                  <div className="criticalActions">
                    <button className="btnCTA" type="button">+ Registrar compra</button>
                    <button className="btnGhost" type="button">Ver producto</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="criticalEmpty">
              <span role="img" aria-label="ok">✅</span> Todo en orden. No hay productos en stock crítico.
            </div>
          )}
        </div>
      </section>

      <div className="summaryGrid">
        <section className="infoCard">
          <h3 className="infoTitle">Resumen Operativo</h3>
          <div className="infoItem">Productos activos: <strong>{metrics.totalProducts}</strong></div>
          <div className="infoItem">Con stock bajo: <strong>{metrics.lowStockCount}</strong></div>
        </section>

        <section className="infoCard">
          <h3 className="infoTitle">Capital en Stock</h3>
          <div className="infoColumns">
            <div>
              <div className="infoLabel">Costo total:</div>
              <div className="infoAmount">{money(metrics.valuation)}</div>
            </div>
            {/* <div>
              <div className="infoLabel">Ganancia bruta:</div>
              <div className="infoAmount">{money(metrics.grossSales)}</div>
            </div> */}
            <div>
              <div className="infoLabel">Ganancia:</div>
              <div className="infoAmount">{money(metrics.potentialMargin)}</div>
            </div>
          </div>
          <p className="muted">Estimado sobre productos activos</p>
        </section>
      </div>

      <section className="quickActionsCard">
        <h3 className="infoTitle">Acciones Rápidas</h3>
        <div className="quickButtons">
          <button className="quickButton green" type="button" onClick={onGoToProducts}>
            + Agregar producto
          </button>
          <button
            className="quickButton red"
            type="button"
            onClick={() => onGoToMovements?.(MovementType.IN)}
          >
            + Registrar compra
          </button>
          <button
            className="quickButton blue"
            type="button"
            onClick={() => onGoToMovements?.(MovementType.OUT)}
          >
            + Registrar venta
          </button>
        </div>
      </section>
    </div>
  );
}

function money(n) {
  return Number(n || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });
}
