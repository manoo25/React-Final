import { ReactNode } from "react";

export default function Layout({ children }) {
  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">{children}</div>
    </div>
  );
}
