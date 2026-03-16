import { Link, NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const links = [
  ['/', 'Home'],
  ['/news', 'All News'],
  ['/themes', 'Themes'],
  ['/regions', 'Regions'],
  ['/sources', 'Sources'],
  ['/about', 'About'],
];

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-fog text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-navy">CBGM Market Intelligence Hub</Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            {links.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `rounded px-3 py-1 ${isActive ? 'bg-navy text-white' : 'text-slate-700 hover:bg-slate-100'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
