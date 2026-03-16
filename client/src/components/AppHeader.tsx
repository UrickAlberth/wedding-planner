/**
 * AppHeader — Cabeçalho principal do planejador de casamento
 * Design: Elegância Clássica Atemporal
 * Usa imagem gerada com flores aquarela como background
 */

import { Heart, Wifi, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663444407429/gTMfURRGDAK6gvXWz65BSY/wedding-hero-bg-EMkJQZmP2mgLqurRh7xQEf.webp';
const ORNAMENT = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663444407429/gTMfURRGDAK6gvXWz65BSY/wedding-header-ornament-2WJB5kukcotzLGomVTAG7H.webp';

interface AppHeaderProps {
  groomName?: string;
  brideName?: string;
}

export default function AppHeader({ groomName = 'Urick', brideName = 'Angélica' }: AppHeaderProps) {
  const [editMode, setEditMode] = useState(false);
  const [groom, setGroom] = useState(groomName);
  const [bride, setBride] = useState(brideName);
  const [tempGroom, setTempGroom] = useState(groomName);
  const [tempBride, setTempBride] = useState(brideName);

  const handleSave = () => {
    setGroom(tempGroom);
    setBride(tempBride);
    setEditMode(false);
  };

  return (
    <header
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        minHeight: '180px',
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/82 to-white/55" />

      <div className="relative z-10 px-6 md:px-10 py-7 md:py-9">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px" style={{ backgroundColor: 'oklch(0.72 0.065 20)' }} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: 'oklch(0.55 0.08 20)' }}>
              Organização em Tempo Real
            </span>
          </div>

          {/* Title */}
          {editMode ? (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                value={tempGroom}
                onChange={e => setTempGroom(e.target.value)}
                className="font-display text-3xl md:text-4xl font-bold bg-transparent border-b-2 focus:outline-none w-32"
                style={{ borderColor: 'oklch(0.72 0.065 20)', color: 'oklch(0.22 0.04 40)' }}
                autoFocus
              />
              <span className="font-accent text-3xl md:text-4xl italic font-light" style={{ color: 'oklch(0.55 0.08 20)' }}>&</span>
              <input
                value={tempBride}
                onChange={e => setTempBride(e.target.value)}
                className="font-display text-3xl md:text-4xl font-bold bg-transparent border-b-2 focus:outline-none w-36"
                style={{ borderColor: 'oklch(0.72 0.065 20)', color: 'oklch(0.22 0.04 40)' }}
              />
              <button
                onClick={handleSave}
                className="ml-2 px-3 py-1 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'white' }}
              >
                Salvar
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-3 py-1 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'oklch(0.93 0.015 75)', color: 'oklch(0.45 0.05 40)' }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-2 group">
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'oklch(0.22 0.04 40)' }}>
                {groom}
                <span className="mx-3 font-accent italic font-light" style={{ color: 'oklch(0.55 0.08 20)' }}>&</span>
                {bride}
              </h1>
              <button
                onClick={() => { setTempGroom(groom); setTempBride(bride); setEditMode(true); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
                style={{ color: 'oklch(0.55 0.08 20)', backgroundColor: 'oklch(0.93 0.025 20)' }}
                title="Editar nomes"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subtitle */}
          <p className="font-accent text-base italic mb-4" style={{ color: 'oklch(0.50 0.04 40)' }}>
            Painel do casamento com colaboração online para vocês dois editarem juntos.
          </p>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'oklch(0.96 0.04 145 / 0.85)', borderColor: 'oklch(0.80 0.06 145)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'oklch(0.55 0.12 145)' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'oklch(0.45 0.12 145)' }} />
            </span>
            <Wifi className="w-3.5 h-3.5" style={{ color: 'oklch(0.45 0.12 145)' }} />
            <span className="text-xs font-medium" style={{ color: 'oklch(0.35 0.10 145)' }}>
              Conectado em tempo real
            </span>
          </div>
        </motion.div>
      </div>

      {/* Decorative floral ornament — right side */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2/5 opacity-55 pointer-events-none hidden md:block"
        style={{
          backgroundImage: `url(${ORNAMENT})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center right',
        }}
      />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
    </header>
  );
}
