import { lazy } from "react";
import { v4 } from "uuid";
const Layout = lazy(() => import("@/components/Layout"));

export default [
  {
    id: v4(),
  },
];
