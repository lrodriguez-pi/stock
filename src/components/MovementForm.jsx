import React, { useMemo, useState } from "react";
import Field from "./Field.jsx";
import { MovementType } from "../domain/types.js";

export default function MovementForm({ products, stockById, onSubmit, errors, defaultType }) {
  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);

  const [productId, setProductId] = useState(activeProducts[0]?.id || "");
  const [type, setType] = useState(defaultType ?? MovementType.OUT);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const selectedStock = productId ? stockById[productId] ?? 0 : 0;

  function submit(e) {
    e.preventDefault();
    const ok = onSubmit({ productId, type, qty, note });
    if (ok) {
      setQty(1);
      setNote("");
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <Field label="Producto">
        <select className="input" value={productId} onChange={(e) => setProductId(e.target.value)}>
          {activeProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku}) · stock: {stockById[p.id] ?? 0}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid2">
        <Field label="Tipo">
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value={MovementType.OUT}>Salida (venta)</option>
            <option value={MovementType.IN}>Entrada (compra)</option>
            <option value={MovementType.ADJUST}>Ajuste (set stock)</option>
          </select>
        </Field>

        <Field label={type === MovementType.ADJUST ? "Stock final" : "Cantidad"}>
          <input
            className="input"
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Nota (opcional)" hint={`Stock actual: ${selectedStock}`}>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {errors?.length ? (
        <div className="errorBox">
          <b>Corregí:</b>
          <ul>
            {errors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <button className="btnPrimary" type="submit">Registrar movimiento</button>
    </form>
  );
}
