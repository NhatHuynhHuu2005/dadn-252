import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Crops } from "./pages/Crops";
import { Irrigation } from "./pages/Irrigation";
import { FieldMap } from "./pages/FieldMap";
import { Schedule } from "./pages/Schedule";
import { Alerts } from "./pages/Alerts";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "analytics", Component: Analytics },
      { path: "crops", Component: Crops },
      { path: "irrigation", Component: Irrigation },
      { path: "field-map", Component: FieldMap },
      { path: "schedule", Component: Schedule },
      { path: "alerts", Component: Alerts },
      { path: "settings", Component: Settings },
    ],
  },
]);
