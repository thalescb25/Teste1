import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVisitors, mockCompanies } from '../mockData';
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
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
          const parsed = JSON.parse(storedVisitors);
          setVisitors(parsed);
        } else {
          setVisitors(mockVisitors);
          localStorage.setItem('visitors', JSON.stringify(mockVisitors));
        }
      }
    }
  }, [navigate, toast]);

  // Polling para atualizar lista de visitantes em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const storedVisitors = localStorage.getItem('visitors');
      if (storedVisitors) {
        setVisitors(JSON.parse(storedVisitors));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    setSelectedVisitor(visitor);
    setRejectModalOpen(true);
  };

  const confirmDeny = () => {
    if (!selectedVisitor) return;
    
    const updatedVisitors = visitors.map(v => 
      v.id === selectedVisitor.id 
        ? { ...v, status: 'denied', notes: rejectReason || 'Recusado pela recepcionista', updatedAt: new Date().toISOString() }
        : v
    );
    setVisitors(updatedVisitors);
    
    // Salvar no localStorage para sincronizar com portaria
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
    
    toast({
      title: "Visitante Recusado",
      description: `Entrada de ${selectedVisitor.fullName} foi recusada. A portaria foi notificada.`,
      variant: "destructive"
    });
    
    // Reset modal
    setRejectModalOpen(false);
    setSelectedVisitor(null);
    setRejectReason('');
  };

  const handleExportToExcel = () => {
    const allVisitors = [...approvedVisitors, ...deniedVisitors];
    
    if (allVisitors.length === 0) {
      toast({
        title: "Sem dados para exportar",
        description: "Não há visitantes no histórico para exportar.",
        variant: "destructive"
      });
      return;
    }

    // Criar CSV
    const headers = "Nome,Email,Telefone,Anfitrião,Empresa,Motivo,Status,Data Check-in\n";
    const rows = allVisitors.map(v => {
      const checkInDate = v.checkInTime ? new Date(v.checkInTime).toLocaleString('pt-BR') : 'Pendente';
      return `"${v.fullName}","${v.email || ''}","${v.phone || ''}","${v.hostName}","${v.representingCompany || ''}","${v.reason || ''}","${v.status === 'approved' ? 'Aprovado' : 'Recusado'}","${checkInDate}"`;
    }).join('\n');
    
    const csvContent = headers + rows;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_visitantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação Concluída",
      description: `${allVisitors.length} registros exportados com sucesso.`,
    });
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
              <h1 className="text-2xl md:text-3xl font-bold text-graphite mb-2">
                Painel de Controle de Acessos - Empresa {mockCompanies.find(c => c.id === user?.companyId)?.name || 'Tech Solutions Ltda'}
              </h1>
              <p className="text-sm md:text-base text-neutral-dark">Aprovação de visitantes em tempo real</p>
            </div>
            <Button
              onClick={handleExportToExcel}
              className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
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
            <h2 className="text-xl md:text-2xl font-bold text-graphite mb-4">Aprovações Pendentes</h2>
            <div className="space-y-4">
              {pendingVisitors.map((visitor) => (
                <Card key={visitor.id} className="border-2 border-warning">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 gap-2">
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-graphite mb-1">{visitor.fullName}</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs md:text-sm">
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
                      <Badge className="bg-warning text-graphite text-xs md:text-sm px-3 py-1 self-start">
                        Aguardando
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2">
                      <Button 
                        onClick={() => handleApprove(visitor)}
                        className="flex-1 bg-green-600 hover:bg-green-700 h-10 text-xs md:text-sm"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={() => handleDeny(visitor)}
                        variant="destructive"
                        className="flex-1 h-10 text-xs md:text-sm"
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
            {[...approvedVisitors, ...deniedVisitors]
              .sort((a, b) => new Date(b.createdAt || b.checkInTime) - new Date(a.createdAt || a.checkInTime))
              .slice(0, visibleCount).map((visitor) => (
              <Card key={visitor.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-graphite mb-1">{visitor.fullName}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-neutral-dark">
                        <p>Anfitrião: {visitor.hostName}</p>
                        {visitor.email && <p>Email: {visitor.email}</p>}
                        {visitor.phone && <p>Telefone: {visitor.phone}</p>}
                        {visitor.checkInTime && (
                          <p className="text-xs mt-1">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(visitor.checkInTime).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
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
          
          {[...approvedVisitors, ...deniedVisitors].length > visibleCount && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => setVisibleCount(prev => prev + 5)}
                variant="outline"
                className="border-primary text-primary hover:bg-blue-50"
              >
                Carregar Mais ({[...approvedVisitors, ...deniedVisitors].length - visibleCount} restantes)
              </Button>
            </div>
          )}
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

        {/* Reject Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setRejectModalOpen(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-graphite mb-4">Motivo da Recusa</h3>
              <p className="text-neutral-dark mb-4">
                Por que você está recusando a entrada de <strong>{selectedVisitor?.fullName}</strong>?
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Digite o motivo da recusa..."
                className="w-full p-3 border border-neutral-medium rounded-lg mb-4 min-h-[100px]"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedVisitor(null);
                    setRejectReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDeny}
                  variant="destructive"
                  className="flex-1"
                >
                  Confirmar Recusa
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyReceptionist;
