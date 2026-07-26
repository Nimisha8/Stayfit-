import { Link } from 'react-router-dom';
import { Flame, ArrowLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Flame size={26} />
        </div>
        <p className="text-6xl font-extrabold text-gray-900 mb-2">404</p>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist, or may have moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;