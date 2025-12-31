import React, { useMemo, useState } from "react";
import { StockProvider, useStockContext } from "./state/StockContext.jsx";
import Layout from "./components/Layout.jsx";
import Tabs from "./components/Tabs.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import MovementsPage from "./pages/MovementsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import InventoryCountPage from "./pages/InventoryCountPage.jsx";
import BackupPage from "./pages/BackupPage.jsx";
import RestockPage from "./pages/RestockPage.jsx";
import { can, PermissionAction, Roles } from "./domain/permissions.js";

export default function App() {
  return (
    <StockProvider>
      <AppContent />
    </StockProvider>
  );
}

function AppContent() {
  const { auth, role } = useStockContext();
  const [tab, setTab] = useState("dashboard");
  const [movementTypePreset, setMovementTypePreset] = useState(null);

  const tabs = useMemo(
    () => {
      const items = [
        { key: "dashboard", label: "Dashboard" },
        { key: "products", label: "Productos" },
        { key: "movements", label: "Movimientos" }
      ];
      if (can(role, PermissionAction.MOVEMENT_CREATE_IN)) {
        items.push({ key: "restock", label: "Reposicion" });
      }
      if (can(role, PermissionAction.MOVEMENT_CREATE_ADJUST)) {
        items.push({ key: "count", label: "Conteo" });
      }
      if (role === Roles.ADMIN) {
        items.push({ key: "backup", label: "Backup" });
      }
      return items;
    },
    [role]
  );

  if (!auth) return <LoginPage />;

  return (
    <Layout>
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={(nextTab) => {
          setTab(nextTab);
          setMovementTypePreset(null);
        }}
      />

      {tab === "dashboard" && (
        <Dashboard
          onGoToProducts={() => {
            setTab("products");
            setMovementTypePreset(null);
          }}
          onGoToMovements={(type) => {
            setMovementTypePreset(type ?? null);
            setTab("movements");
          }}
        />
      )}
      {tab === "products" && <ProductsPage />}
      {tab === "movements" && <MovementsPage defaultType={movementTypePreset} />}
      {tab === "restock" && <RestockPage />}
      {tab === "count" && <InventoryCountPage />}
      {tab === "backup" && <BackupPage />}
    </Layout>
  );
}
