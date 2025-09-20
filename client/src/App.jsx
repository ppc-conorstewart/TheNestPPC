// ==============================
// FILE: client/src/App.jsx
// ==============================

import React, { lazy, Suspense } from 'react';
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

// Lazy load all page components
const LandingPage = lazy(() => import('./LandingPage'));
const CustomerHub = lazy(() => import('./pages/CustomerHub'));
const DiscordHub = lazy(() => import('./pages/DiscordHub'));
const DocumentationHub = lazy(() => import('./pages/DocumentationHub'));
const FLYBASE = lazy(() => import('./pages/FLYBASE'));
const FlyHQ = lazy(() => import('./pages/FlyHQ'));
const FlyHQTools = lazy(() => import('./pages/FlyHQTools'));
const FlyIQ = lazy(() => import('./pages/FlyIQ'));
const InteractiveTraining = lazy(() => import('./pages/InteractiveTraining'));
const JobMap = lazy(() => import('./pages/JobMap'));
const JobPlanner = lazy(() => import('./pages/JobPlanner'));
const MFVDocumentation = lazy(() => import('./pages/MFVDocumentation'));
const MFVField = lazy(() => import('./pages/MFVField'));
const MFVPage = lazy(() => import('./pages/MFVPage'));
const MFVSummary = lazy(() => import('./pages/MFVSummary'));
const OverwatchPage = lazy(() => import('./pages/OverwatchPage'));
const Projects = lazy(() => import('./pages/Projects'));
const ServiceEquipment = lazy(() => import('./pages/ServiceEquipment'));
const SourcingPage = lazy(() => import('./pages/SourcingPage'));
const TrainingHub = lazy(() => import('./pages/TrainingHub'));
const ValveReports = lazy(() => import('./pages/ValveReports'));
const WorkorderHub = lazy(() => import('./pages/WorkorderHub'));
const FlySales = lazy(() => import('./pages/FlySales'));
const QuoteLogPage = lazy(() => import('./components/Fly Sales Components/QuoteLogPage'));

// === Global Glass Styles ===
import './styles/glass.css';

// === Context Debugging ===
import { useJobContext } from './context/JobContext';

// === Background FX === (Removed from global - only used in LandingPage for performance)
// import BackgroundFX from './components/BackgroundFX';

// === Loading Component ===
import LoadingSpinner from './components/LoadingSpinner';

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
        {/* BackgroundFX removed from global - only shown on LandingPage for performance */}

        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>

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
