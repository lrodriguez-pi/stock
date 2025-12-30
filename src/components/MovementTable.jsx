import React, { useMemo } from "react";
import Table from "./Table.jsx";

export default function MovementTable({ products, movements }) {
  const nameById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, `${p.name} (${p.sku})`])),
    [products]
  );

  const rows = useMemo(() => movements.slice(0, 50), [movements]);

  const columns = [
    {
      key: "atISO",
      header: "Fecha",
      render: (r) => new Date(r.atISO).toLocaleString("es-AR")
    },
    {
      key: "productId",
      header: "Producto",
      render: (r) => nameById[r.productId] ?? "Producto no encontrado"
    },
    { key: "type", header: "Tipo" },
    {
      key: "qty",
      header: "Cantidad",
      render: (r) => <b>{r.qty}</b>
    },
    { key: "user", header: "Usuario" },
    { key: "note", header: "Nota" }
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      emptyText="No hay movimientos."
      maxHeight="360px"
      scrollThreshold={5}
    />
  );
}
