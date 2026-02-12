import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import SuggestDestination from './pages/SuggestDestination';
import CreateTrip from './pages/CreateTrip';
import FinalizeTrip from './pages/FinalizeTrip';
import ScrollToTop from './components/ScrollToTop';


function App() {
  return (
    <Router basename="/team11">
      <ScrollToTop />
      <Routes>
        {/* Main Application Shell */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create-trip" element={<CreateTrip />} />
          <Route path="suggest-destination" element={<SuggestDestination />} />
          <Route path="finalize-trip/:tripId" element={<FinalizeTrip />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;