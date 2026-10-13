import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-blue-50 p-4 text-center">
      <ShieldAlert className="w-16 h-16 text-slate-blue-400 mb-4" />
      <h1 className="text-4xl font-bold text-slate-blue-900 mb-2">404</h1>
      <p className="text-lg text-slate-blue-600 mb-8">Page not found.</p>
      <Link to="/" className="btn-primary flex items-center gap-2 h-11 px-6">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>
    </div>
  );
};
