import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import HomePage from '@/pages/HomePage';
import SuggestDestination from './pages/SuggestDestination';
import CreateTrip from './pages/CreateTrip';


function App() {
  return (
    <Router basename="/team11">
      <Routes>
        {/* Main Application Shell */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create-trip" element={<CreateTrip />} />
          <Route path="suggest-destination" element={<SuggestDestination />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;