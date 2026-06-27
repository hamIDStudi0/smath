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

import { useEffect, useRef} from "react";

interface Particle {
  text: string;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
}

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

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
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
  const prevIndexRef = useRef(getRouteIndex(location.pathname));
  const directionRef = useRef<"left"|"right">("left");
  const currentIndex = getRouteIndex(location.pathname);
  if(currentIndex !== prevIndexRef.current){
    directionRef.current = currentIndex > prevIndexRef.current ? "left" : "right";
    prevIndexRef.current = currentIndex;
  }
  return(
    <div className="pt-container" style={{position:"relative", overflow:"hidden"}}>
      <div key={location.pathname} className={`pt-page pt-in-${directionRef.current}`}>
        <Outlet/>
      </div>
    </div>
  )
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const mathItems: string[] = [
      "E=mc²", "a²+b²=c²", "π ≈ 3.14", "Σ x_i", "∫ f(x)dx",
      "Δx", "∞", "f(x)=y", "√x", "1+1=2", "log(x)", "θ",
    ];

    const particles: Particle[] = [];
    const particleCount = Math.floor(window.innerWidth / 40);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        text:    mathItems[Math.floor(Math.random() * mathItems.length)],
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        size:    Math.random() * 12 + 10,
        vx:      (Math.random() - 0.5) * 0.3,
        vy:      (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.15 + 0.09,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.font      = `${p.size}px monospace`;
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fillText(p.text, p.x, p.y);
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -50)                p.x = canvas.width  + 50;
        if (p.x > canvas.width  + 50) p.x = -50;
        if (p.y < -50)                p.y = canvas.height + 50;
        if (p.y > canvas.height + 50) p.y = -50;
      });
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return (
    <>
    {/* MFA Trial Game */}
      <canvas ref={canvasRef} className="fixed-background-canvas" />
      <div>
        {/* ── Navbar ── */}
        <nav className="navroot">
          <NavLink to="/" className="nav-logo">
            <span className="nav-logo-dot">.</span>
            <span className="nav-logo-main">s</span>
            <span className="nav-logo-math">MATH</span>
          </NavLink>

          <div className="navbar">
            <NavLink to="/"          className={({ isActive }) => `nav-item${isActive ? " active" : ""}`} end>Home</NavLink>
            <NavLink to="/article"   className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>Articles</NavLink>
            <NavLink to="/generation"className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>Gens</NavLink>
            <NavLink to="/about"     className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>About</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>?</NavLink>
          </div>
        </nav>

        {/* ── Page content dengan animasi ── */}
        <AnimatedOutlet />
        <footer className="app-footer">
          <div className="footer-content">
            <p className="footer-logo">&lt; / &gt;</p>
            <p>Dibuat dengan Keinginan dan Usaha.</p>
            <p className="footer-copyright">© 2026 SMATH. idk maybe "All rights reserved".</p>
          </div>
        </footer>
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
