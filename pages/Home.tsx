import React, { useState, useEffect } from 'react';
import { dbService } from '../services/supabase.ts';
import { Project, SiteSettings, DESIGN_CATEGORIES, DesignCategory } from '../types.ts';
import { ImageWithFallback } from '../components/ImageWithFallback.tsx';
import { ProjectCard } from '../components/ProjectCard.tsx';
import { getSocialIcon } from '../App.tsx';

// --- SECTIONS ---

const HeroSection: React.FC<{ settings: SiteSettings; projects: Project[] }> = ({ settings, projects }) => {
  let displayImages = settings.heroImages?.filter(Boolean) || [];
  
  if (displayImages.length < 3) {
    const projectImages = projects
      .slice(0, 3 - displayImages.length)
      .map(p => p.imageUrls?.[0] || '');
    displayImages = [...displayImages, ...projectImages];
  }
  
  while (displayImages.length < 3) {
    displayImages.push(settings.heroImage);
  }

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen bg-black flex flex-col items-center justify-center pt-24 overflow-hidden">
      <div className="absolute left-8 bottom-12 flex flex-col gap-6 text-[#F5F5F0]/40 text-xs">
        {settings.socialLinks?.map(link => (
          <a key={link.id} href={link.url} target="_blank" title={link.label} className="hover:text-white transition-colors">
            <i className={getSocialIcon(link.label)}></i>
          </a>
        ))}
      </div>

      <div className="absolute right-8 bottom-12 flex flex-col items-center gap-4">
        <span className="[writing-mode:vertical-rl] text-[10px] font-black uppercase tracking-[0.4em] text-[#F5F5F0]/20">SCROLL</span>
        <div className="w-[1px] h-12 bg-[#F5F5F0]/10"></div>
      </div>

      <div className="container mx-auto px-6 flex flex-col items-center">
        <div className="flex gap-4 md:gap-8 mb-12">
          {displayImages.slice(0, 3).map((img, idx) => (
            <div 
              key={idx} 
              className={`w-24 md:w-48 lg:w-64 aspect-[3/4] overflow-hidden border border-[#F5F5F0]/10 transition-transform duration-1000 ${idx === 1 ? '-translate-y-8 scale-110' : 'translate-y-4 opacity-60'}`}
            >
              <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Work" />
            </div>
          ))}
        </div>

        <div className="text-center z-10">
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-poster tracking-tighter mb-4">
            {settings.siteName || 'MY PORTFOLIO'}
          </h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-[#F5F5F0]/40 mb-12 max-w-lg mx-auto leading-relaxed">
            HELLO I AM {settings.designerName?.toUpperCase()} <br/> {settings.bio?.slice(0, 50).toUpperCase()}...
          </p>
          
          <button 
            onClick={scrollToPortfolio}
            className="px-10 py-4 border border-[#F5F5F0]/20 hover:bg-[#F5F5F0] hover:text-black transition-all uppercase text-[10px] font-black tracking-[0.3em]"
          >
            VIEW PROJECTS
          </button>
        </div>
      </div>
    </section>
  );
};

const BioSection: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const capabilities = settings?.capabilities?.split('\n').filter(Boolean) || [];

  return (
    <section className="bg-black py-24 border-t border-[#F5F5F0]/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F5F5F0]/30 border-b border-[#F5F5F0]/10 pb-4 inline-block">BIOGRAPHY</h2>
              <p className="text-xl lg:text-3xl font-normal leading-relaxed text-[#F5F5F0] opacity-90 font-sans max-w-2xl">
                {settings?.bio}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F5F5F0]/30">CAPABILITIES</h2>
              <div className="space-y-4 uppercase text-[10px] font-bold tracking-widest">
                {capabilities.map((cap, i) => (
                  <div key={i} className="flex justify-between border-b border-[#F5F5F0]/10 pb-2">
                    <span>{cap}</span>
                    <span className="text-[#F5F5F0]/40">CORE</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F5F5F0]/30">CHANNELS</h2>
              <div className="space-y-4 uppercase text-[10px] font-bold tracking-widest">
                <div className="flex justify-between border-b border-[#F5F5F0]/10 pb-2">
                  <span className="text-[#F5F5F0]/40">MAIL</span>
                  <span className="lowercase truncate ml-4">{settings?.contactEmail}</span>
                </div>
                <div className="flex justify-between border-b border-[#F5F5F0]/10 pb-2">
                  <span className="text-[#F5F5F0]/40">TEL</span>
                  <span>{settings?.phone}</span>
                </div>
                <div className="flex justify-between border-b border-[#F5F5F0]/10 pb-2">
                  <span className="text-[#F5F5F0]/40">LOC</span>
                  <span>{settings?.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PortfolioGrid: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [filter, setFilter] = useState<DesignCategory | 'All'>('All');
  
  const activeCategories = DESIGN_CATEGORIES.filter(cat => 
    projects.some(p => p.category === cat)
  );

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="portfolio" className="bg-black py-32 border-t border-[#F5F5F0]/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-[#F5F5F0]/10 pb-8">
          <h2 className="text-7xl lg:text-9xl font-poster">WORKS</h2>
          
          <div className="flex flex-wrap gap-6 uppercase text-[10px] font-black tracking-widest mb-4">
            <button onClick={() => setFilter('All')} className={`transition-all ${filter === 'All' ? 'underline underline-offset-8' : 'opacity-40 hover:opacity-100'}`}>[ALL]</button>
            {activeCategories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`transition-all ${filter === cat ? 'underline underline-offset-8' : 'opacity-40 hover:opacity-100'}`}>[{cat.toUpperCase().replace(' ', '_')}]</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-20 uppercase font-black tracking-widest text-sm text-[#F5F5F0]">
              No entries found in this collection
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projList, siteSet] = await Promise.all([
          dbService.getProjects(),
          dbService.getSettings()
        ]);
        setProjects(projList);
        setSettings(siteSet);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-huge font-poster opacity-10 animate-pulse">DESIGN</span>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {settings && <HeroSection settings={settings} projects={projects} />}
      {settings && <BioSection settings={settings} />}
      <PortfolioGrid projects={projects} />
    </div>
  );
};

export default Home;