import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Marketing & Auth Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';

// Layout & Private Dashboard Pages
import { AppLayout } from './components/layout/AppLayout';
import { Workspace } from './pages/Workspace';
import { Advisor } from './pages/Advisor';
import { MemoryPage } from './pages/Memory';
import { Chat } from './pages/Chat';
import { Finance } from './pages/Finance';
import { Inventory } from './pages/Inventory';
import { Milestones } from './pages/Milestones';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing Portal */}
        <Route path="/" element={<Landing />} />
        
        {/* Registration Channels */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Private Founder Console */}
        <Route
          path="/app/workspace"
          element={
            <AppLayout>
              <Workspace />
            </AppLayout>
          }
        />
        <Route
          path="/app/advisor"
          element={
            <AppLayout>
              <Advisor />
            </AppLayout>
          }
        />
        <Route
          path="/app/memory"
          element={
            <AppLayout>
              <MemoryPage />
            </AppLayout>
          }
        />
        <Route
          path="/app/chat"
          element={
            <AppLayout>
              <Chat />
            </AppLayout>
          }
        />
        <Route
          path="/app/finance"
          element={
            <AppLayout>
              <Finance />
            </AppLayout>
          }
        />
        <Route
          path="/app/inventory"
          element={
            <AppLayout>
              <Inventory />
            </AppLayout>
          }
        />
        <Route
          path="/app/milestones"
          element={
            <AppLayout>
              <Milestones />
            </AppLayout>
          }
        />
        <Route
          path="/app/reports"
          element={
            <AppLayout>
              <Reports />
            </AppLayout>
          }
        />
        <Route
          path="/app/settings"
          element={
            <AppLayout>
              <Settings />
            </AppLayout>
          }
        />

        {/* Fallback to marketing dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
