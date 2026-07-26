import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Coach from './pages/Coach';
import Trainer from './pages/Trainer';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute><Progress /></ProtectedRoute>
        } />
        <Route path="/coach" element={
          <ProtectedRoute><Coach /></ProtectedRoute>
        } />
        <Route path="/trainer" element={
          <ProtectedRoute><Trainer /></ProtectedRoute>
        } />

        <Route path="/groups" element={
          <ProtectedRoute><Groups /></ProtectedRoute>
        } />
        <Route path="/groups/:groupId" element={
          <ProtectedRoute><GroupDetail /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;