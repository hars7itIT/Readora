import React from 'react';
import { Home, Bookmark, Compass, Layers, Settings } from 'lucide-react';
import type { PageView } from '../../types/index';

interface MobileNavigationProps {
  currentPage: PageView;
  onSelectPage: (page: PageView) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  onSelectPage
}) => {
  return (
    <nav
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e3e8df',
        zIndex: 40,
        justifyContent: 'space-around',
        padding: '8px 0',
        boxShadow: '0 -2px 10px rgba(20, 36, 24, 0.05)'
      }}
      className="mobile-nav-bar"
    >
      <button
        style={{
          background: 'transparent',
          border: 0,
          color: currentPage === 'inbox' || currentPage === 'reader' ? '#20452f' : '#839181',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          fontSize: '10.5px',
          fontWeight: 500
        }}
        onClick={() => onSelectPage('inbox')}
      >
        <Home size={18} />
        <span>Home</span>
      </button>

      <button
        style={{
          background: 'transparent',
          border: 0,
          color: currentPage === 'starred' || currentPage === 'saved' ? '#20452f' : '#839181',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          fontSize: '10.5px',
          fontWeight: 500
        }}
        onClick={() => onSelectPage('starred')}
      >
        <Bookmark size={18} />
        <span>Saved</span>
      </button>

      <button
        style={{
          background: 'transparent',
          border: 0,
          color: currentPage === 'discover' ? '#20452f' : '#839181',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          fontSize: '10.5px',
          fontWeight: 500
        }}
        onClick={() => onSelectPage('discover')}
      >
        <Compass size={18} />
        <span>Discover</span>
      </button>

      <button
        style={{
          background: 'transparent',
          border: 0,
          color: currentPage === 'subscriptions' ? '#20452f' : '#839181',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          fontSize: '10.5px',
          fontWeight: 500
        }}
        onClick={() => onSelectPage('subscriptions')}
      >
        <Layers size={18} />
        <span>Feeds</span>
      </button>

      <button
        style={{
          background: 'transparent',
          border: 0,
          color: currentPage === 'settings' ? '#20452f' : '#839181',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          fontSize: '10.5px',
          fontWeight: 500
        }}
        onClick={() => onSelectPage('settings')}
      >
        <Settings size={18} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
