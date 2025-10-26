// src/App.tsx
import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateQuest from "./pages/CreateQuest";
import Debugger from "./pages/Debugger.tsx";
import ProtectedRoute from "./components/ProtectedRoute";

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <main>
      {!isLandingPage && (
        <Layout.Header
          projectId="TryBud"
          projectTitle="TryBud"
          contentRight={
            <>
              <nav
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <NavLink to="/dashboard" style={{ textDecoration: "none" }}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "tertiary"}
                      size="md"
                    >
                      🏠 Dashboard
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/quest/create" style={{ textDecoration: "none" }}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "tertiary"}
                      size="md"
                    >
                      ➕ New Quest
                    </Button>
                  )}
                </NavLink>
                <NavLink to="/debug" style={{ textDecoration: "none" }}>
                  {({ isActive }) => (
                    <Button variant="tertiary" size="md" disabled={isActive}>
                      <Icon.Code02 size="md" />
                      Debug
                    </Button>
                  )}
                </NavLink>
              </nav>
              <ConnectAccount />
            </>
          }
        />
      )}
      <Outlet />
      {!isLandingPage && (
        <Layout.Footer>
          <span>
            © {new Date().getFullYear()} TryBud. Built on Stellar.{" "}
            <a
              href="http://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apache License 2.0
            </a>
          </span>
        </Layout.Footer>
      )}
    </main>
  );
};

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public route */}
        <Route path="/" element={<Landing />} />

        {/* Protected routes - require wallet connection */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quest/create"
          element={
            <ProtectedRoute>
              <CreateQuest />
            </ProtectedRoute>
          }
        />

        {/* Debug routes */}
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
