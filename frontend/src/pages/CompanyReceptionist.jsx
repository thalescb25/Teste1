import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVisitors } from '../mockData';
import Navbar from '../components/Navbar';
import { 
  Users, CheckCircle, XCircle, Clock, Mail, Calendar, Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

const CompanyReceptionist = () => {
  const [user, setUser] = useState(null);
  const [visitors, setVisitors] = useState(mockVisitors);
  const [timeFilter, setTimeFilter] = useState('7');
  const [visibleCount, setVisibleCount] = useState(5);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'company_receptionist') {
        navigate('/login');
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
      } else {
        setUser(parsedUser);
        
        // Carregar visitantes do localStorage se existir, senão usar mock
        const storedVisitors = localStorage.getItem('visitors');
        if (storedVisitors) {
          setVisitors(JSON.parse(storedVisitors));
        } else {
          localStorage.setItem('visitors', JSON.stringify(mockVisitors));
        }
      }
    }
  }, [navigate, toast]);

  const handleApprove = (visitor) => {
    const updatedVisitors = visitors.map(v => 
      v.id === visitor.id 
        ? { ...v, status: 'approved', checkInTime: new Date().toISOString() }
        : v
    );
    setVisitors(updatedVisitors);
    
    // Salvar no localStorage para sincronizar com portaria
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
    
    toast({
      title: "Visitante Aprovado",
      description: `${visitor.fullName} foi autorizado a entrar. A portaria foi notificada.`,
    });
  };

  const handleDeny = (visitor) => {
    const reason = prompt("Motivo da recusa:");
    if (reason) {
      const updatedVisitors = visitors.map(v => 
        v.id === visitor.id 
          ? { ...v, status: 'denied', notes: reason }
          : v
      );
      setVisitors(updatedVisitors);
      
      // Salvar no localStorage para sincronizar com portaria
      localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
      
      toast({
        title: "Visitante Recusado",
        description: `Entrada de ${visitor.fullName} foi recusada. A portaria foi notificada.`,
        variant: "destructive"
      });
    }
  };

  const pendingVisitors = visitors.filter(v => v.status === 'pending');
  const approvedVisitors = visitors.filter(v => v.status === 'approved');
  const deniedVisitors = visitors.filter(v => v.status === 'denied');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-graphite mb-2">
                Painel de Controle de Acessos - Empresa {mockCompanies.find(c => c.id === user?.companyId)?.name || 'Tech Solutions Ltda'}
              </h1>
              <p className="text-neutral-dark">Aprovação de visitantes em tempo real</p>
            </div>
            <Button
              onClick={() => {
                toast({
                  title: "Download Iniciado",
                  description: "Histórico sendo exportado...",
                });
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Histórico
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-dark mb-1">Aguardando Aprovação</p>
                  <p className="text-4xl font-bold text-graphite">{pendingVisitors.length}</p>
                </div>
                <Clock className="w-12 h-12 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-dark mb-1">Aprovados Hoje</p>
                  <p className="text-4xl font-bold text-graphite">{approvedVisitors.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-dark mb-1">Recusados</p>
                  <p className="text-4xl font-bold text-graphite">{deniedVisitors.length}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        {pendingVisitors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-graphite mb-4">Aprovações Pendentes</h2>
            <div className="space-y-4">
              {pendingVisitors.map((visitor) => (
                <Card key={visitor.id} className="border-2 border-warning">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-graphite mb-2">{visitor.fullName}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <p className="text-neutral-dark">
                            <span className="font-semibold">Anfitrião:</span> {visitor.hostName}
                          </p>
                          {visitor.representingCompany && (
                            <p className="text-neutral-dark">
                              <span className="font-semibold">Representando:</span> {visitor.representingCompany}
                            </p>
                          )}
                          {visitor.reason && (
                            <p className="text-neutral-dark">
                              <span className="font-semibold">Motivo:</span> {visitor.reason}
                            </p>
                          )}
                          {visitor.companions > 0 && (
                            <p className="text-neutral-dark">
                              <span className="font-semibold">Acompanhantes:</span> {visitor.companions}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-warning text-graphite text-sm px-3 py-1">
                        Aguardando
                      </Badge>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleApprove(visitor)}
                        className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-base"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={() => handleDeny(visitor)}
                        variant="destructive"
                        className="flex-1 h-12 text-base"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Recusar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-graphite">Histórico</h2>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-medium rounded-lg text-graphite"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>

          <div className="space-y-4">
            {[...approvedVisitors, ...deniedVisitors].slice(0, visibleCount).map((visitor) => (
              <Card key={visitor.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-graphite mb-1">{visitor.fullName}</h3>
                      <p className="text-sm text-neutral-dark">Anfitrião: {visitor.hostName}</p>
                      {visitor.checkInTime && (
                        <p className="text-xs text-neutral-dark mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(visitor.checkInTime).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <Badge className={`text-sm px-3 py-1 ${
                      visitor.status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {visitor.status === 'approved' ? 'Aprovado' : 'Recusado'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-6 h-6 text-primary" />
                <span className="text-graphite">Precisa de ajuda?</span>
              </div>
              <a 
                href="mailto:neuraone.ai@gmail.com"
                className="text-primary hover:text-blue-600 font-semibold"
              >
                neuraone.ai@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyReceptionist;
