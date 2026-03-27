import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, BottomNav } from './Navigation';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col min-h-screen md:pl-32 pb-24 md:pb-8">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
