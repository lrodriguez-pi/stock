import React from "react";
import Card from "../components/Card.jsx";
import MovementForm from "../components/MovementForm.jsx";
import MovementTable from "../components/MovementTable.jsx";
import { useStockContext } from "../state/StockContext.jsx";
import { useMovements } from "../hooks/useMovements.js";
import { useStock } from "../hooks/useStock.js";

export default function MovementsPage({ defaultType }) {
  const { state } = useStockContext();
  const { addMovement, errorList, movements } = useMovements();
  const { stockById } = useStock();

  return (
    <div className="grid2">
      <Card title="Registrar movimiento">
        <MovementForm
          products={state.products}
          stockById={stockById}
          onSubmit={addMovement}
          errors={errorList}
          defaultType={defaultType}
        />
      </Card>

      <Card title="Historial (últimos 50)">
        <MovementTable products={state.products} movements={movements} />
      </Card>
    </div>
  );
}
