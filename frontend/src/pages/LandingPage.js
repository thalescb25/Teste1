import React, { useEffect } from 'react';

const LandingPage = () => {
  useEffect(() => {
    // Redirecionar para a landing page HTML estática
    window.location.href = '/landing.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
        <p className="mt-4 text-slate-600">Carregando Landing Page...</p>
      </div>
    </div>
  );
};

export default LandingPage;
