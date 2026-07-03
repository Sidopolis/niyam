import { Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper text-ink">
      <h1 className="text-display font-bold">404</h1>
      <p className="mt-4 text-ink-muted">Page not found.</p>
      <a href="/" className="mt-6 text-accent hover:text-accent-hover transition-colors">
        Go home
      </a>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
