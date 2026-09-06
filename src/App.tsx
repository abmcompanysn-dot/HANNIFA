import { useEffect } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { StoreProvider, useStore } from "./context/StoreContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { IconWhatsApp } from "./components/Icons";
import Home from "./pages/Home";
import Boutique from "./pages/Boutique";
import ProductDetail from "./pages/ProductDetail";
import SurMesure from "./pages/SurMesure";
import Commander from "./pages/Commander";
import EspaceClient from "./pages/EspaceClient";
import Galerie from "./pages/Galerie";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-6 left-5 z-[95] flex flex-col gap-3">
      {toasts.map((t) => (
        <p
          key={t.id}
          className="toast-in border-l-2 border-cognac-500 bg-cocoa-900 px-5 py-4 text-sm text-sand-100 shadow-[0_18px_44px_-16px_rgba(34,23,16,0.8)]"
        >
          {t.msg}
        </p>
      ))}
    </div>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/221778123456"
      target="_blank"
      rel="noreferrer"
      aria-label="Discuter avec HANI'S sur WhatsApp Business"
      title="WhatsApp Business"
      className="pulse-dot fixed right-5 bottom-6 z-[75] grid h-14 w-14 place-items-center rounded-full bg-[#1f8f52] text-sand-50 shadow-[0_16px_38px_-10px_rgba(31,143,82,0.75)] transition-transform duration-300 hover:scale-110"
    >
      <IconWhatsApp size={26} />
    </a>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-32 text-center">
      <p className="eyebrow">Page introuvable</p>
      <p className="font-display mt-4 text-6xl font-semibold text-cocoa-900 italic">Perdue de fil…</p>
      <p className="mt-4 text-cocoa-500">Cette page n'existe pas, mais la boutique vous attend.</p>
      <Link to="/" className="btn-primary mt-8">Retour à l'accueil</Link>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/boutique" element={<Boutique />} />
              <Route path="/boutique/:gender" element={<Boutique />} />
              <Route path="/produit/:id" element={<ProductDetail />} />
              <Route path="/sur-mesure" element={<SurMesure />} />
              <Route path="/commander" element={<Commander />} />
              <Route path="/galerie" element={<Galerie />} />
              <Route path="/espace-client" element={<EspaceClient />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <CartDrawer />
        <Toasts />
        <WhatsAppFloat />
        <div className="noise-layer" aria-hidden />
      </HashRouter>
    </StoreProvider>
  );
}
