import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Users, UserCheck, TrendingUp, Clock, Search, Filter, Download, QrCode, LogOut, Menu, X, KeyRound, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({
    todayVisitors: 0,
    activeVisitors: 0,
    totalVisitorsMonth: 0,
    averageStayTime: '0h 0min'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
      fetchVisitors();
      fetchStats();
    }
  }, [navigate]);

  const fetchVisitors = async () => {
    try {
      const response = await api.get('/visitors', {
        params: {
          status_filter: filterStatus,
          search: searchTerm
        }
      });
      if (response.data.success) {
        setVisitors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching visitors:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os visitantes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVisitors();
    }
  }, [filterStatus, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    navigate('/login');
  };

  const generateQRCode = async (visitor) => {
    try {
      const response = await api.get(`/visitors/${visitor.id}/qrcode`);
      if (response.data.success) {
        // Você pode mostrar o QR code em um modal ou baixar
        toast({
          title: "QR Code gerado!",
          description: `Código ${response.data.qrCode} gerado para ${visitor.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-2">
                <KeyRound className="w-8 h-8 text-green-600" />
                <span className="text-xl font-bold text-slate-900">AccessControl</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.building}</p>
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
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } mt-16 lg:mt-0`}>
          <div className="p-6 space-y-8">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Menu Principal</h3>
              <nav className="space-y-1">
                <a href="#" className="flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg font-medium">
                  <Users className="w-5 h-5" />
                  <span>Visitantes</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                  <QrCode className="w-5 h-5" />
                  <span>Gerar QR Code</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                  <TrendingUp className="w-5 h-5" />
                  <span>Relatórios</span>
                </a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Visitantes Hoje"
              value={stats.todayVisitors}
              color="bg-blue-500"
            />
            <StatCard
              icon={UserCheck}
              title="Visitantes Ativos"
              value={stats.activeVisitors}
              color="bg-green-500"
            />
            <StatCard
              icon={TrendingUp}
              title="Total no Mês"
              value={stats.totalVisitorsMonth}
              color="bg-purple-500"
            />
            <StatCard
              icon={Clock}
              title="Tempo Médio"
              value={stats.averageStayTime}
              color="bg-orange-500"
            />
          </div>

          {/* Visitors Table */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="text-2xl font-bold text-slate-900">Controle de Visitantes</CardTitle>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar visitante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">Todos</option>
                    <option value="checked-in">Check-in</option>
                    <option value="checked-out">Check-out</option>
                  </select>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Visitante
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empresa</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Anfitrião</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check-in</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {visitors.map((visitor) => (
                      <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{visitor.name}</p>
                            <p className="text-sm text-gray-500">{visitor.document}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{visitor.company}</td>
                        <td className="px-6 py-4 text-gray-700">{visitor.host}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{formatDate(visitor.checkInTime)}</p>
                          {visitor.checkOutTime && (
                            <p className="text-xs text-gray-500">Saída: {formatDate(visitor.checkOutTime)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {visitor.status === 'checked-in' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Presente
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                              <XCircle className="w-3 h-3 mr-1" />
                              Finalizado
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            onClick={() => generateQRCode(visitor)}
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Code
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredVisitors.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum visitante encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        />
      )}
    </div>
  );
};

export default Dashboard;
