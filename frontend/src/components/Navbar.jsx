import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Building2 } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      super_admin: 'Super Admin',
      building_admin: 'Administrador',
      front_desk: 'Portaria',
      company_receptionist: 'Recepcionista'
    };
    return roleMap[role] || role;
  };

  return (
    <nav className="bg-white border-b border-neutral-medium shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Building2 className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary-dark">AcessaAqui</span>
              <span className="text-xs text-primary font-medium">Acesso rápido, seguro e digital</span>
            </div>
          </Link>

          {/* User Info & Actions - Desktop */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-graphite">{user.name}</p>
                <p className="text-xs text-neutral-dark">{getRoleDisplay(user.role)}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-graphite p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && isMobileMenuOpen && (
        <div className="md:hidden bg-secondary border-t border-neutral-medium">
          <div className="px-4 py-4 space-y-3">
            <div className="pb-3 border-b border-neutral-medium">
              <p className="text-sm font-semibold text-graphite">{user.name}</p>
              <p className="text-xs text-neutral-dark">{getRoleDisplay(user.role)}</p>
            </div>
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
