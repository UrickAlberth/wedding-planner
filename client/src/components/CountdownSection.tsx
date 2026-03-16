import { useState, useEffect } from 'react';
import { Calendar, Heart, Save } from 'lucide-react';
import { useWedding } from '@/contexts/WeddingContext';
import { motion } from 'framer-motion';

function getDaysUntil(dateStr: string): { days: number; label: string } | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = target.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  return { days: diff, label: formatted };
}

export default function CountdownSection() {
  const { weddingDate, setWeddingDate } = useWedding();
  const [inputDate, setInputDate] = useState(weddingDate);
  const [saved, setSaved] = useState(false);
  const countdown = getDaysUntil(weddingDate);

  const handleSave = () => {
    setWeddingDate(inputDate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [units, setUnits] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function update() {
      const target = new Date(weddingDate + 'T00:00:00');
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setUnits({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setUnits({ days, hours, minutes, seconds });
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <section
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{
        backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663444407429/gTMfURRGDAK6gvXWz65BSY/wedding-countdown-bg-59QEszHbcnm2Fu9Nw8QMpC.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-white/60" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Heart className="w-5 h-5 fill-current" style={{ color: 'oklch(0.55 0.08 20)' }} />
          <h2 className="font-display text-2xl font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
            Contagem Regressiva
          </h2>
        </div>

        {/* Date input row */}
        <div className="flex flex-wrap gap-3 items-end mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'oklch(0.45 0.05 40)' }}>
              Data do casamento
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'oklch(0.55 0.08 20)' }} />
              <input
                type="date"
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'oklch(0.88 0.02 60)',
                  backgroundColor: 'oklch(0.995 0.005 75)',
                  color: 'oklch(0.28 0.04 40)',
                }}
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: saved ? 'oklch(0.55 0.12 145)' : 'oklch(0.45 0.07 20)',
              color: 'oklch(0.98 0.005 75)',
            }}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Salvo!' : 'Salvar data'}
          </button>
        </div>

        {/* Countdown units */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { value: units.days, label: 'dias' },
            { value: units.hours, label: 'horas' },
            { value: units.minutes, label: 'minutos' },
            { value: units.seconds, label: 'segundos' },
          ].map(({ value, label }) => (
            <motion.div
              key={label}
              className="text-center rounded-xl py-3 px-2"
              style={{ backgroundColor: 'oklch(0.995 0.005 75 / 0.85)', border: '1px solid oklch(0.88 0.02 60)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="font-display text-3xl md:text-4xl font-bold leading-none mb-1"
                style={{ color: 'oklch(0.45 0.07 20)' }}
              >
                {String(value).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase tracking-wider" style={{ color: 'oklch(0.55 0.03 40)' }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary text */}
        {countdown && (
          <p className="font-accent text-lg italic" style={{ color: 'oklch(0.38 0.06 40)' }}>
            {countdown.days > 0
              ? `Faltam ${countdown.days} dias para ${countdown.label}.`
              : countdown.days === 0
              ? `O grande dia é hoje! 🎉`
              : `O casamento foi há ${Math.abs(countdown.days)} dias.`}
          </p>
        )}
      </div>
    </section>
  );
}
