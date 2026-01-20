
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import { dbService } from './services/supabase';
import { SiteSettings, SocialLink } from './types';
import { getSocialIcon } from './utils/icons';

const Header: React.FC = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    dbService.getSettings().then(setSettings);
    const handleStorage = () => dbService.getSettings().then(setSettings);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 w-full z-50 mix-blend-difference">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        <Link to="/" className="text-xl font-black uppercase tracking-tighter">
          {isAdminPage ? 'SYSTEM_ADMIN' : (settings?.siteName || 'PORTFOLIO')}
        </Link>
        <nav className="flex items-center gap-12 text-xs font-bold uppercase tracking-widest">
          <Link to="/" className={`hover:opacity-50 transition-opacity ${location.pathname === '/' ? 'underline underline-offset-8' : ''}`}>Gallery</Link>
          {(!settings?.hideAdminLink || isAdminPage) && (
            <Link to="/admin" className={`hover:opacity-50 transition-opacity ${isAdminPage ? 'underline underline-offset-8' : ''}`}>
              {isAdminPage ? 'Dashboard' : 'Access'}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    dbService.getSettings().then(setSettings);
    const handleStorage = () => dbService.getSettings().then(setSettings);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <footer className="py-20 border-t border-[#F5F5F0]/20 bg-black">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-4xl font-poster mb-8 italic">LET'S CREATE</h3>
            <p className="text-[#F5F5F0]/60 max-w-md text-lg leading-relaxed uppercase font-mono-style">
              Currently open for collaborations and high-impact design projects.
            </p>
          </div>
          <div className="flex flex-col gap-4 uppercase text-xs font-bold tracking-widest">
            <span className="text-[#F5F5F0]/40">Socials</span>
            {settings?.socialLinks && settings.socialLinks.length > 0 ? (
              settings.socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" className="hover:line-through flex items-center gap-3 group">
                  <i className={`${getSocialIcon(link.label)} opacity-40 group-hover:opacity-100 transition-opacity`}></i>
                  {link.label}
                </a>
              ))
            ) : (
              <span className="opacity-20">No social links</span>
            )}
          </div>
          <div className="flex flex-col gap-2 uppercase text-xs font-bold tracking-widest">
            <span className="text-[#F5F5F0]/40">Contact</span>
            <a href={`mailto:${settings?.contactEmail}`} className="hover:line-through">{settings?.contactEmail}</a>
            <p className="text-[#F5F5F0]/60">{settings?.location || 'Based in Indonesia'}</p>
          </div>
        </div>
        <div className="flex justify-between items-end border-t border-[#F5F5F0]/10 pt-8 uppercase text-[10px] font-bold tracking-[0.2em] text-[#F5F5F0]/30">
          <span>© {new Date().getFullYear()} {settings?.designerName}</span>
          <span>EST. MMXXIV</span>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col selection:bg-[#F5F5F0] selection:text-black">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
