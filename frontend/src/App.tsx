import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ChatInterface from './components/ChatInterface/ChatInterface';
import { ThemeProvider } from './context/ThemeContext';
import About from './pages/About';
import ClinicianDashboard from './pages/ClinicianDashboard/ClinicianDashboard';
import Features from './pages/Features';
import Home from './pages/Home';
import PatientDashboard from './pages/PatientDashboard/PatientDashboard';
import Search from './pages/Search';
import Settings from './pages/Settings/Settings';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-[#0A0A0B] transition-colors duration-200">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/chat" element={<ChatInterface userRole="clinician" />} />
            <Route path="/clinician" element={<ClinicianDashboard />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/settings" element={<Settings userRole="clinician" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;