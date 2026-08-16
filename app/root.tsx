import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

const ROUTE_ORDER: Record<string, number> = {
  "/":           0,
  "/article":    1,
  "/generation": 2,
  "/about":      3,
  "/dashboard":  4,
};

function getRouteIndex(pathname: string){
  return ROUTE_ORDER[pathname] ?? -1;
}

// Halaman-halaman ini punya layout sendiri (form full-height terpusat, atau
// panel admin dengan sidebar/scroll sendiri) — footer situs publik akan terasa
// "menempel begitu saja" kalau dipaksakan tampil di sana, jadi disembunyikan.
const FOOTER_HIDDEN_PREFIXES = ["/dashboard", "/login", "/register", "/key"];

function shouldShowFooter(pathname: string){
  return !FOOTER_HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AnimatedOutlet(){
  const location = useLocation();
  const prevIndexRef = { current: getRouteIndex(location.pathname) };
  return (
    <div className="pt-container" style={{position:"relative", overflow:"hidden"}}>
      <div key={location.pathname} className="pt-page pt-in-left">
        <Outlet/>
      </div>
    </div>
  )
}

const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function App() {
  const location = useLocation();
  const showFooter = shouldShowFooter(location.pathname);

  return (
    <>
      <div className="app-background" aria-hidden="true" />
      <div>
        {/* ── Navbar ── */}
        <nav className="navroot">
          <NavLink to="/" className="nav-logo">
            <span className="nav-logo-dot">.</span>
            <span className="nav-logo-main">SMAGA</span>
            <span className="nav-logo-math">MATH</span>
          </NavLink>

          <div className="navbar">
            <NavLink to="/"          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} end>Home</NavLink>
            <NavLink to="/article"   className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>Articles</NavLink>
            <NavLink to="/generation"className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>Gens</NavLink>
            <NavLink to="/about"     className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>About</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-admin-link${isActive ? " active" : ""}`} title="Admin" aria-label="Admin"><AdminIcon /></NavLink>
          </div>
        </nav>

        {/* ── Page content dengan animasi ── */}
        <AnimatedOutlet />
        {showFooter && (
          <footer className="app-footer">
            <div className="footer-content">
              <p className="footer-logo">SMAGAMATH</p>
              <p>Dibuat dengan Keinginan dan Usaha.</p>
              <p className="footer-copyright">© 2026 SMAGAMATH. All rights reserved.</p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
