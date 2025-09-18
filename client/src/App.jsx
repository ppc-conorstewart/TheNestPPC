// ==============================
// FILE: client/src/App.jsx
// ==============================

import React from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation
} from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from './LandingPage';
import CustomerHub from './pages/CustomerHub';
import DiscordHub from './pages/DiscordHub';
import DocumentationHub from './pages/DocumentationHub';
import FLYBASE from './pages/FLYBASE';
import FlyHQ from './pages/FlyHQ';
import FlyHQTools from './pages/FlyHQTools';
import FlyIQ from './pages/FlyIQ';
import InteractiveTraining from './pages/InteractiveTraining';
import JobMap from './pages/JobMap';
import JobPlanner from './pages/JobPlanner';
import MFVDocumentation from './pages/MFVDocumentation';
import MFVField from './pages/MFVField';
import MFVPage from './pages/MFVPage';
import MFVSummary from './pages/MFVSummary';
import OverwatchPage from './pages/OverwatchPage';
import Projects from './pages/Projects';
import ServiceEquipment from './pages/ServiceEquipment';
import SourcingPage from './pages/SourcingPage';
import TrainingHub from './pages/TrainingHub';
import ValveReports from './pages/ValveReports';
import WorkorderHub from './pages/WorkorderHub';
import FlySales from './pages/FlySales';
import QuoteLogPage from './components/Fly Sales Components/QuoteLogPage';

// === Global Glass Styles ===
import './styles/glass.css';

// === Context Debugging ===
import { useJobContext } from './context/JobContext';

// === Background FX ===
import BackgroundFX from './components/BackgroundFX';

// ==============================
// AuthListener — URL User Param LocalStorage Handler
// ==============================
function AuthListener() {
  const location = useLocation();
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    if (userParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('flyiq_user', JSON.stringify(parsed));
      } catch {}
      finally {
        window.history.replaceState({}, document.title, '/');
      }
    }
  }, [location]);
  return null;
}

// ==============================
// App — Page Routing/Context/Toast Layout
// ==============================
export default function App() {
  const debugContext = useJobContext?.();
  console.log('App.jsx context value', debugContext);

  return (
    <Router>
      <AuthListener />
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'transparent',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        <BackgroundFX />

        <Routes>
          <Route
            path='/fly-iq'
            element={
              <Layout hideSidebar>
                <ProtectedRoute>
                  <FlyIQ />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-hq-tools'
            element={
              <Layout>
                <ProtectedRoute>
                  <FlyHQTools />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-hq'
            element={
              <Layout>
                <ProtectedRoute>
                  <FlyHQ />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-hq/mfv'
            element={
              <Layout>
                <ProtectedRoute>
                  <MFVPage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/discord-hub'
            element={
              <Layout hideSidebar>
                <ProtectedRoute>
                  <DiscordHub />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/job-planner'
            element={
              <Layout>
                <ProtectedRoute>
                  <JobPlanner />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/workorder-hub'
            element={
              <Layout>
                <ProtectedRoute>
                  <WorkorderHub />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/sourcing'
            element={
              <Layout>
                <ProtectedRoute>
                  <SourcingPage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/documentation'
            element={
              <Layout>
                <ProtectedRoute>
                  <DocumentationHub />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-mfv'
            element={
              <Layout>
                <ProtectedRoute>
                  <FLYBASE />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-mfv/summary'
            element={
              <Layout>
                <ProtectedRoute>
                  <MFVSummary />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-mfv/documentation'
            element={
              <Layout>
                <ProtectedRoute>
                  <MFVDocumentation />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-mfv/field'
            element={
              <Layout>
                <ProtectedRoute>
                  <MFVField />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-mfv/valve-reports'
            element={
              <Layout>
                <ProtectedRoute>
                  <ValveReports />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/fly-mfv/valve-reports/:padKey'
            element={
              <Layout>
                <ProtectedRoute>
                  <ValveReports />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/job-map'
            element={
              <Layout>
                <ProtectedRoute>
                  <JobMap />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/projects'
            element={
              <Layout>
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/pad-overwatch'
            element={
              <Layout>
                <ProtectedRoute>
                  <OverwatchPage />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/training-hub'
            element={
              <Layout>
                <ProtectedRoute>
                  <TrainingHub />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/interactive-training'
            element={
              <Layout>
                <ProtectedRoute>
                  <InteractiveTraining />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/customer-hub'
            element={
              <Layout>
                <ProtectedRoute>
                  <CustomerHub />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/service-equipment'
            element={
              <Layout>
                <ProtectedRoute>
                  <ServiceEquipment />
                </ProtectedRoute>
              </Layout>
            }
          />

          {/* ============================== SALES ============================== */}
          <Route
            path='/sales'
            element={
              <Layout>
                <ProtectedRoute>
                  <FlySales />
                </ProtectedRoute>
              </Layout>
            }
          />
          <Route
            path='/sales/quotes'
            element={
              <Layout>
                <ProtectedRoute>
                  <QuoteLogPage />
                </ProtectedRoute>
              </Layout>
            }
          />

          <Route
            path='/'
            element={
              <Layout>
                <LandingPage />
              </Layout>
            }
          />
          <Route
            path='*'
            element={
              <Layout>
                <ProtectedRoute>
                  <div className='bg-black text-white p-10'>
                    Page Not Found
                  </div>
                </ProtectedRoute>
              </Layout>
            }
          />
        </Routes>

        <ToastContainer
          containerId='paloma'
          position='bottom-right'
          autoClose={4100}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='dark'
          limit={4}
          transition={Slide}
        />
      </div>
    </Router>
  );
}
