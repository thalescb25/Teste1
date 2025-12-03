import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockVisitors } from '../mockData';
import Navbar from '../components/Navbar';
import { 
  Users, UserPlus, Search, Clock, CheckCircle, XCircle, Send, Mail
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';

const FrontDesk = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('queue');
  const [visitors, setVisitors] = useState(mockVisitors);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simular atualização em tempo real a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Buscar visitantes atualizados do localStorage (simulando real-time)
      const storedVisitors = localStorage.getItem('visitors');
      if (storedVisitors) {
        const parsedVisitors = JSON.parse(storedVisitors);
        setVisitors(parsedVisitors);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'front_desk') {
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

  const handleResend = (visitor) => {
    toast({
      title: "Notificação Reenviada",
      description: `Nova notificação enviada para a empresa.`,
    });
  };

  const handleViewDetails = (visitor) => {
    const details = `
Nome: ${visitor.fullName}
Visitando: ${visitor.hostName}
Empresa: ${visitor.representingCompany || 'Não informado'}
Motivo: ${visitor.reason || 'Não informado'}
Acompanhantes: ${visitor.companions}
Documento: ${visitor.document || 'Não informado'}
    `.trim();
    
    alert(details);
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const newVisitor = {
      id: `v${Date.now()}`,
      buildingId: user.buildingId,
      companyId: '1', // Primeira empresa por padrão
      fullName: formData.get('fullName'),
      hostName: formData.get('hostName'),
      representingCompany: formData.get('representingCompany') || '',
      reason: formData.get('reason') || '',
      companions: parseInt(formData.get('companions')) || 0,
      document: '',
      documentImage: null,
      selfie: null,
      status: 'approved', // Check-in manual já aprovado
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      notes: formData.get('notes') || 'Check-in manual realizado pela portaria',
      createdAt: new Date().toISOString(),
      language: 'pt'
    };
    
    const updatedVisitors = [...visitors, newVisitor];
    setVisitors(updatedVisitors);
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
    
    form.reset();
    
    toast({
      title: "Check-in Manual Realizado",
      description: `${newVisitor.fullName} foi registrado com sucesso.`,
    });
  };

  const pendingVisitors = visitors.filter(v => v.status === 'pending');
  const filteredVisitors = visitors.filter(v =>
    v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.hostName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-graphite mb-2">Portaria</h1>
          <p className="text-xl text-neutral-dark">Interface simplificada para controle de acesso</p>
        </div>

        {/* Alert for pending visitors */}
        {pendingVisitors.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-warning bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-warning" />
                  <div>
                    <p className="text-lg font-bold text-graphite">
                      {pendingVisitors.length} visitante{pendingVisitors.length !== 1 ? 's' : ''} aguardando
                    </p>
                    <p className="text-sm text-neutral-dark">Aguardando aprovação da empresa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'queue', label: 'Fila em Tempo Real', count: pendingVisitors.length },
            { id: 'manual', label: 'Check-in Manual' },
            { id: 'search', label: 'Buscar Visitante' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 rounded-lg font-semibold text-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-neutral-dark hover:bg-neutral-light'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-warning text-graphite rounded-full text-sm font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div>
            {pendingVisitors.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-neutral-medium mx-auto mb-4" />
                  <p className="text-xl text-neutral-dark">Nenhum visitante na fila no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingVisitors.map((visitor) => (
                  <Card key={visitor.id} className="border-2 border-warning">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-graphite mb-2">{visitor.fullName}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-lg">
                            <div>
                              <span className="text-neutral-dark">Visitando: </span>
                              <span className="font-semibold text-graphite">{visitor.hostName}</span>
                            </div>
                            {visitor.representingCompany && (
                              <div>
                                <span className="text-neutral-dark">Empresa: </span>
                                <span className="font-semibold text-graphite">{visitor.representingCompany}</span>
                              </div>
                            )}
                            {visitor.reason && (
                              <div>
                                <span className="text-neutral-dark">Motivo: </span>
                                <span className="font-semibold text-graphite">{visitor.reason}</span>
                              </div>
                            )}
                            {visitor.companions > 0 && (
                              <div>
                                <span className="text-neutral-dark">Acompanhantes: </span>
                                <span className="font-semibold text-graphite">{visitor.companions}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-warning text-graphite text-base px-4 py-2">
                          <Clock className="w-4 h-4 mr-2" />
                          Aguardando
                        </Badge>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => handleViewDetails(visitor)}
                          variant="outline"
                          size="lg"
                          className="flex-1 border-primary text-primary hover:bg-blue-50 h-14 text-lg"
                        >
                          <Users className="w-5 h-5 mr-2" />
                          Ver Detalhes
                        </Button>
                        <Button 
                          onClick={() => handleResend(visitor)}
                          size="lg"
                          className="flex-1 bg-accent hover:bg-blue-600 h-14 text-lg"
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Reenviar Notificação
                        </Button>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 text-center">
                          ⚠️ A aprovação de entrada é responsabilidade da empresa visitada
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual Check-in Tab */}
        {activeTab === 'manual' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Check-in Manual</CardTitle>
              <p className="text-neutral-dark">Para visitantes sem smartphone ou idosos</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualCheckIn} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Nome Completo *</label>
                    <Input name="fullName" placeholder="Nome do visitante" className="h-12 text-lg" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Anfitrião *</label>
                    <Input name="hostName" placeholder="Nome do anfitrião" className="h-12 text-lg" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Empresa Representando</label>
                    <Input name="representingCompany" placeholder="Opcional" className="h-12 text-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Motivo</label>
                    <Input name="reason" placeholder="Opcional" className="h-12 text-lg" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Acompanhantes</label>
                    <Input name="companions" type="number" placeholder="0" defaultValue="0" className="h-12 text-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">Observações</label>
                  <textarea 
                    name="notes"
                    rows={3}
                    className="w-full p-3 border border-neutral-medium rounded-lg text-lg"
                    placeholder="Anotações adicionais..."
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-blue-600 h-14 text-lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Registrar Check-in
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neutral-dark" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome do visitante ou anfitrião..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-14 h-16 text-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {searchTerm && (
              <div className="space-y-4">
                {filteredVisitors.map((visitor) => (
                  <Card key={visitor.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-graphite mb-2">{visitor.fullName}</h3>
                          <p className="text-neutral-dark">Anfitrião: {visitor.hostName}</p>
                          <p className="text-sm text-neutral-dark mt-1">
                            Check-in: {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString('pt-BR') : 'Pendente'}
                          </p>
                        </div>
                        <Badge className={
                          visitor.status === 'approved' ? 'bg-green-100 text-green-700' :
                          visitor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {visitor.status === 'approved' ? 'Aprovado' :
                           visitor.status === 'pending' ? 'Pendente' : 'Negado'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

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

export default FrontDesk;
