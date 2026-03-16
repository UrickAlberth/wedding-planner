import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { LOGIN_PATH } from '@/const';
import AppHeader from '@/components/AppHeader';
import CountdownSection from '@/components/CountdownSection';
import SideNav, { Section } from '@/components/SideNav';
import OverviewSection from '@/components/OverviewSection';
import AgendaSection from '@/components/AgendaSection';
import TasksSection from '@/components/TasksSection';
import GuestsSection from '@/components/GuestsSection';
import ExpensesSection from '@/components/ExpensesSection';
import { WeddingProvider } from '@/contexts/WeddingContext';

const sectionTitles: Record<Section, string> = {
  overview: 'Visão Geral',
  agenda: 'Agenda',
  tasks: 'Tarefas',
  guests: 'Convidados',
  expenses: 'Gastos',
};

function AppContent() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'oklch(0.97 0.012 75)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'oklch(0.45 0.07 20)' }}></div>
          <p style={{ color: 'oklch(0.55 0.03 40)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'oklch(0.97 0.012 75)' }}>
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold mb-4" style={{ color: 'oklch(0.28 0.04 40)' }}>
            Bem-vindo ao Planejador de Casamento
          </h1>
          <p className="mb-6" style={{ color: 'oklch(0.55 0.03 40)' }}>
            Faça login para acessar seu painel de organização do casamento.
          </p>
          <a
            href={LOGIN_PATH}
            className="inline-block px-8 py-3 rounded-lg font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: 'oklch(0.45 0.07 20)', color: 'oklch(0.98 0.005 75)' }}
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection />;
      case 'agenda': return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AgendaSection />
          <TasksSection />
        </div>
      );
      case 'tasks': return <TasksSection />;
      case 'guests': return <GuestsSection />;
      case 'expenses': return <ExpensesSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'oklch(0.97 0.012 75)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <AppHeader />

        {/* Countdown */}
        <CountdownSection />

        {/* Main layout */}
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <SideNav active={activeSection} onChange={setActiveSection} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile nav toggle */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold" style={{ color: 'oklch(0.28 0.04 40)' }}>
                {sectionTitles[activeSection]}
              </h2>
              <button
                onClick={() => setMobileNavOpen(o => !o)}
                className="p-2 rounded-xl transition-all"
                style={{ backgroundColor: 'oklch(0.93 0.025 20)', color: 'oklch(0.45 0.07 20)' }}
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile nav dropdown */}
            <AnimatePresence>
              {mobileNavOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mb-4 overflow-hidden"
                >
                  <SideNav
                    active={activeSection}
                    onChange={s => { setActiveSection(s); setMobileNavOpen(false); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid oklch(0.88 0.02 60)' }}>
          <p className="font-accent italic text-sm" style={{ color: 'oklch(0.65 0.03 40)' }}>
            Feito com amor para o dia mais especial ♥
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <WeddingProvider>
      <AppContent />
    </WeddingProvider>
  );
}
