import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import MemberProgress from './pages/MemberProgress.jsx';
import SessionFrequency from './pages/SessionFrequency.jsx';
import PopularExercises from './pages/PopularExercises.jsx';
import TrainerWorkload from './pages/TrainerWorkload.jsx';
import MembershipTrends from './pages/MembershipTrends.jsx';

// Components
import Sidebar from './components/Sidebar.jsx';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm z-10">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 focus:outline-none lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">StatLift Analytics</h1>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/member-progress" element={<MemberProgress />} />
                <Route path="/session-frequency" element={<SessionFrequency />} />
                <Route path="/popular-exercises" element={<PopularExercises />} />
                <Route path="/trainer-workload" element={<TrainerWorkload />} />
                <Route path="/membership-trends" element={<MembershipTrends />} />
              </Routes>
            </div>
          </main>
        </div>
        
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;