import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { HelpSidebar, HelpPage } from './HelpSidebar';
import { ChatWidget } from './ChatWidget';
import { Onboarding } from './Onboarding';

export const Layout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isHelpOpen, setIsHelpOpen] = React.useState(false);
  const [helpPage, setHelpPage] = React.useState<HelpPage>('scheduling');
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = () => setIsMobileNavOpen(true);
    window.addEventListener('open-mobile-nav', handler);
    return () => window.removeEventListener('open-mobile-nav', handler);
  }, []);

  const openHelp = (page: HelpPage) => {
    setHelpPage(page);
    setIsHelpOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      {/* pb-16 on mobile to clear the bottom nav bar */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <Header />
          <Outlet context={{ openHelp }} />
        </div>
      </main>
      <HelpSidebar
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        page={helpPage}
      />
      <ChatWidget />
      <Onboarding />
    </div>
  );
};
