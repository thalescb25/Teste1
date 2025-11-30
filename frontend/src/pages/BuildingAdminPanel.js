import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Building, Users, Phone, MessageSquare, History, LogOut, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';

const BuildingAdminPanel = ({ user, onLogout }) => {
  const [building, setBuilding] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [phones, setPhones] = useState([]);
  const [allPhones, setAllPhones] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Filtros e estatísticas de histórico
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    apartmentNumber: '',
    status: ''
  });
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [stats, setStats] = useState(null);

  // Dialogs
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showAddPhoneDialog, setShowAddPhoneDialog] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'doorman' });
  const [newPhone, setNewPhone] = useState({ whatsapp: '', name: '' });

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/deliveries/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas');
    }
  };

  const loadData = async () => {
    try {
      const [buildingRes, apartmentsRes, usersRes, deliveriesRes] = await Promise.all([
        axios.get(`${API}/admin/building`),
        axios.get(`${API}/admin/apartments`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/admin/deliveries`),
      ]);

      setBuilding(buildingRes.data);
      setCustomMessage(buildingRes.data.custom_message || '');
      setApartments(apartmentsRes.data);
      setUsers(usersRes.data);
      setDeliveries(deliveriesRes.data);
      setFilteredDeliveries(deliveriesRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', new Date(filters.startDate).toISOString());
      if (filters.endDate) params.append('end_date', new Date(filters.endDate).toISOString());
      if (filters.apartmentNumber) params.append('apartment_number', filters.apartmentNumber);
      if (filters.status) params.append('status', filters.status);

      const [deliveriesRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/deliveries?${params.toString()}`),
        axios.get(`${API}/admin/deliveries/stats?${params.toString()}`)
      ]);

      setFilteredDeliveries(deliveriesRes.data);
      setStats(statsRes.data);
      toast.success('Filtros aplicados!');
    } catch (error) {
      toast.error('Erro ao aplicar filtros');
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      apartmentNumber: '',
      status: ''
    });
    setFilteredDeliveries(deliveries);
    setStats(null);
  };

  const setQuickFilter = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setFilters({
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      apartmentNumber: '',
      status: ''
    });
  };

  const exportToCSV = () => {
    if (filteredDeliveries.length === 0) {
      toast.error('Nenhuma entrega para exportar');
      return;
    }

    const headers = ['Data/Hora', 'Apartamento', 'Porteiro', 'Status', 'Telefones Notificados'];
    const rows = filteredDeliveries.map(d => [
      new Date(d.timestamp).toLocaleString('pt-BR'),
      d.apartment_number,
      d.doorman_name,
      d.status === 'success' ? 'Enviado' : 'Falhou',
      d.phones_notified.join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_entregas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Relatório CSV exportado!');
  };

  const exportToExcel = () => {
    if (filteredDeliveries.length === 0) {
      toast.error('Nenhuma entrega para exportar');
      return;
    }

    // Importar dinamicamente a biblioteca xlsx
    import('xlsx').then((XLSX) => {
      // Preparar dados
      const data = filteredDeliveries.map(d => ({
        'Data/Hora': new Date(d.timestamp).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        'Apartamento': d.apartment_number,
        'Porteiro': d.doorman_name,
        'Status': d.status === 'success' ? 'Enviado' : 'Falhou',
        'Telefones Notificados': d.phones_notified.length,
        'Números': d.phones_notified.join(', '),
      }));

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Configurar largura das colunas
      const colWidths = [
        { wch: 18 }, // Data/Hora
        { wch: 12 }, // Apartamento
        { wch: 20 }, // Porteiro
        { wch: 10 }, // Status
        { wch: 18 }, // Telefones Notificados
        { wch: 40 }, // Números
      ];
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Entregas');

      // Adicionar sheet de estatísticas se disponível
      if (stats) {
        const statsData = [
          { Métrica: 'Total de Entregas', Valor: stats.total_deliveries },
          { Métrica: 'Sucessos', Valor: stats.successful },
          { Métrica: 'Falhas', Valor: stats.failed },
          { Métrica: 'Telefones Notificados', Valor: stats.total_phones_notified },
        ];

        if (stats.top_apartments && stats.top_apartments.length > 0) {
          statsData.push({ Métrica: '', Valor: '' });
          statsData.push({ Métrica: 'Top Apartamentos', Valor: 'Entregas' });
          stats.top_apartments.forEach(apt => {
            statsData.push({ Métrica: `Apt ${apt.number}`, Valor: apt.count });
          });
        }

        const statsWs = XLSX.utils.json_to_sheet(statsData);
        statsWs['!cols'] = [{ wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, statsWs, 'Estatísticas');
      }

      // Gerar nome do arquivo
      const fileName = `relatorio_entregas_${building?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Fazer download
      XLSX.writeFile(wb, fileName);

      toast.success('Relatório Excel exportado!');
    }).catch((error) => {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar Excel');
    });
  };

  const loadPhones = async (apartmentId) => {
    try {
      const response = await axios.get(`${API}/admin/apartments/${apartmentId}/phones`);
      setPhones(response.data);
    } catch (error) {
      toast.error('Erro ao carregar telefones');
    }
  };

  const loadAllPhones = async () => {
    try {
      const response = await axios.get(`${API}/admin/all-phones`);
      setAllPhones(response.data);
    } catch (error) {
      toast.error('Erro ao carregar telefones');
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post(`${API}/admin/users`, newUser);
      toast.success('Usuário criado com sucesso!');
      setShowAddUserDialog(false);
      setNewUser({ name: '', email: '', password: '', role: 'doorman' });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const handleAddPhone = async () => {
    if (!selectedApartment) return;

    try {
      await axios.post(`${API}/admin/apartments/${selectedApartment.id}/phones`, {
        apartment_id: selectedApartment.id,
        ...newPhone,
      });
      toast.success('Telefone adicionado!');
      setShowAddPhoneDialog(false);
      setNewPhone({ whatsapp: '', name: '' });
      loadPhones(selectedApartment.id);
    } catch (error) {
      toast.error('Erro ao adicionar telefone');
    }
  };

  const handleDeletePhone = async (phoneId) => {
    try {
      await axios.delete(`${API}/admin/phones/${phoneId}`);
      toast.success('Telefone removido!');
      if (selectedApartment) {
        loadPhones(selectedApartment.id);
      }
      loadAllPhones(); // Atualizar lista consolidada também
    } catch (error) {
      toast.error('Erro ao remover telefone');
    }
  };

  const handleUpdateMessage = async () => {
    try {
      await axios.put(`${API}/admin/building/message?message=${encodeURIComponent(customMessage)}`);
      toast.success('Mensagem atualizada!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar mensagem');
    }
  };

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/registrar?codigo=${building.registration_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Painel Administrativo
              </h1>
              <p className="text-sm text-slate-600">{building?.name}</p>
            </div>
            <Button
              variant="outline"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="admin-logout-button"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Plano</p>
                  <p className="text-2xl font-bold text-slate-900 capitalize">{building?.plan}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {building?.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Mensagens</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {building?.messages_used} / {building?.message_quota}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Apartamentos</p>
                  <p className="text-2xl font-bold text-slate-900">{apartments.length}</p>
                </div>
                <Building className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Entregas Total</p>
                  <p className="text-2xl font-bold text-slate-900">{deliveries.length}</p>
                </div>
                <History className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="apartments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="apartments">Apartamentos</TabsTrigger>
            <TabsTrigger value="phones">Telefones</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="message">Mensagem</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Telefones Consolidados */}
          <TabsContent value="phones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Telefones Cadastrados</CardTitle>
                <CardDescription>Lista consolidada de todos os WhatsApp do prédio</CardDescription>
                <Button
                  onClick={loadAllPhones}
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  data-testid="refresh-all-phones"
                >
                  Atualizar Lista
                </Button>
              </CardHeader>
              <CardContent>
                {allPhones.length === 0 ? (
                  <div className="text-center py-12">
                    <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhum telefone cadastrado ainda</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Adicione telefones na aba "Apartamentos" ou compartilhe o link de cadastro público
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-slate-50 p-3 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-slate-700">
                        Total: {allPhones.length} telefone(s) cadastrado(s)
                      </p>
                    </div>
                    {allPhones.map((phone) => (
                      <Card key={phone.id} className="border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  Apt {phone.apartment_number}
                                </Badge>
                                <p className="font-semibold text-lg">{phone.whatsapp}</p>
                              </div>
                              {phone.name && (
                                <p className="text-sm text-slate-600 mt-1">{phone.name}</p>
                              )}
                              <p className="text-xs text-slate-500 mt-1">
                                Cadastrado em: {new Date(phone.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePhone(phone.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              data-testid={`delete-phone-${phone.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apartamentos */}
          <TabsContent value="apartments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Telefones dos Moradores</CardTitle>
                <CardDescription>Adicione ou remova telefones WhatsApp dos apartamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apartments.map((apt) => (
                    <Card key={apt.id} className="border-l-4 border-l-emerald-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-lg">Apartamento {apt.number}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setSelectedApartment(apt);
                              await loadPhones(apt.id);
                            }}
                            data-testid={`manage-phones-apt-${apt.number}`}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Gerenciar Telefones
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usuários</CardTitle>
                    <CardDescription>Gerenciar porteiros e administradores</CardDescription>
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="add-user-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Novo Usuário</DialogTitle>
                        <DialogDescription>Adicione um porteiro ou administrador</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Nome completo"
                            data-testid="new-user-name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="email@exemplo.com"
                            data-testid="new-user-email"
                          />
                        </div>
                        <div>
                          <Label>Senha</Label>
                          <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="••••••••"
                            data-testid="new-user-password"
                          />
                        </div>
                        <div>
                          <Label>Função</Label>
                          <select
                            className="w-full h-10 px-3 border border-slate-300 rounded-md"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            data-testid="new-user-role"
                          >
                            <option value="doorman">Porteiro</option>
                            <option value="building_admin">Administrador</option>
                          </select>
                        </div>
                        <Button onClick={handleAddUser} className="w-full" data-testid="save-user-button">
                          Salvar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.map((u) => (
                    <Card key={u.id} className="border-l-4 border-l-blue-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-sm text-slate-600">{u.email}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {u.role === 'doorman' ? 'Porteiro' : 'Admin'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mensagem */}
          <TabsContent value="message" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mensagem Personalizada</CardTitle>
                <CardDescription>
                  Customize a mensagem WhatsApp. Use [numero] para inserir o número do apartamento.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mensagem WhatsApp</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="ChegouAqui: Uma encomenda para o apartamento [numero] está pronta para retirada na portaria."
                    rows={4}
                    className="mt-2"
                    data-testid="custom-message-input"
                  />
                </div>
                <Button onClick={handleUpdateMessage} data-testid="save-message-button">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Salvar Mensagem
                </Button>

                <Separator className="my-6" />

                <div>
                  <Label className="text-base font-semibold">Link de Cadastro para Moradores</Label>
                  <p className="text-sm text-slate-600 mb-3">Compartilhe este link para que os moradores cadastrem seus WhatsApp:</p>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/registrar?codigo=${building?.registration_code}`}
                      readOnly
                      className="font-mono text-sm"
                      data-testid="registration-link"
                    />
                    <Button onClick={copyRegistrationLink} variant="outline" data-testid="copy-link-button">
                      {copied ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Código do prédio: <span className="font-mono font-semibold">{building?.registration_code}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatório de Entregas</CardTitle>
                    <CardDescription>Histórico completo com filtros avançados</CardDescription>
                  </div>
                  <Button
                    onClick={() => exportToCSV()}
                    variant="outline"
                    data-testid="export-csv-button"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold text-sm">Filtros</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Data Início</Label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="h-9"
                        data-testid="filter-start-date"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Data Fim</Label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="h-9"
                        data-testid="filter-end-date"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Apartamento</Label>
                      <select
                        className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm"
                        value={filters.apartmentNumber}
                        onChange={(e) => setFilters({ ...filters, apartmentNumber: e.target.value })}
                        data-testid="filter-apartment"
                      >
                        <option value="">Todos</option>
                        {apartments.map((apt) => (
                          <option key={apt.id} value={apt.number}>
                            Apt {apt.number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <select
                        className="w-full h-9 px-3 border border-slate-300 rounded-md text-sm"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        data-testid="filter-status"
                      >
                        <option value="">Todos</option>
                        <option value="success">Sucesso</option>
                        <option value="failed">Falhou</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={applyFilters} size="sm" data-testid="apply-filters-button">
                      Aplicar Filtros
                    </Button>
                    <Button onClick={clearFilters} size="sm" variant="outline" data-testid="clear-filters-button">
                      Limpar
                    </Button>
                    <Button onClick={setQuickFilter} size="sm" variant="outline" data-testid="quick-filter-30days">
                      Últimos 30 dias
                    </Button>
                  </div>
                </div>

                {/* Estatísticas */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <Card className="border-l-4 border-l-emerald-600">
                      <CardContent className="p-3">
                        <p className="text-xs text-slate-600">Total</p>
                        <p className="text-2xl font-bold">{stats.total_deliveries}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-600">
                      <CardContent className="p-3">
                        <p className="text-xs text-slate-600">Sucesso</p>
                        <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-600">
                      <CardContent className="p-3">
                        <p className="text-xs text-slate-600">Falhas</p>
                        <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-600">
                      <CardContent className="p-3">
                        <p className="text-xs text-slate-600">Telefones</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.total_phones_notified}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-600">
                      <CardContent className="p-3">
                        <p className="text-xs text-slate-600">Mais Ativo</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.top_apartments?.[0]?.number || '-'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Lista de Entregas */}
                {filteredDeliveries.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Nenhuma entrega encontrada</p>
                    <p className="text-sm text-slate-500 mt-2">Tente ajustar os filtros</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-600">
                        Mostrando {filteredDeliveries.length} entrega(s)
                      </p>
                    </div>
                    {filteredDeliveries.map((delivery) => (
                      <Card key={delivery.id} className="border-l-4 border-l-emerald-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-lg">Apartamento {delivery.apartment_number}</p>
                                <Badge variant={delivery.status === 'success' ? 'default' : 'destructive'}>
                                  {delivery.status === 'success' ? 'Enviado' : 'Falhou'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                <div>
                                  <p className="text-xs text-slate-500">Data/Hora</p>
                                  <p className="font-medium">
                                    {new Date(delivery.timestamp).toLocaleString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Porteiro</p>
                                  <p className="font-medium">{delivery.doorman_name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Telefones Notificados</p>
                                  <p className="font-medium">{delivery.phones_notified.length}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Números</p>
                                  <p className="text-xs font-mono">
                                    {delivery.phones_notified.slice(0, 2).join(', ')}
                                    {delivery.phones_notified.length > 2 && ` +${delivery.phones_notified.length - 2}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Telefones */}
      {selectedApartment && (
        <Dialog open={!!selectedApartment} onOpenChange={() => setSelectedApartment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apartamento {selectedApartment.number} - Telefones</DialogTitle>
              <DialogDescription>Gerenciar números WhatsApp dos moradores</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Lista de telefones */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {phones.length === 0 ? (
                  <p className="text-sm text-slate-600 text-center py-4">Nenhum telefone cadastrado</p>
                ) : (
                  phones.map((phone) => (
                    <div key={phone.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{phone.whatsapp}</p>
                        {phone.name && <p className="text-sm text-slate-600">{phone.name}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePhone(phone.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`delete-phone-${phone.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <Separator />

              {/* Adicionar telefone */}
              <div className="space-y-3">
                <h4 className="font-semibold">Adicionar Novo Telefone</h4>
                <div>
                  <Label>WhatsApp (com DDD)</Label>
                  <Input
                    value={newPhone.whatsapp}
                    onChange={(e) => setNewPhone({ ...newPhone, whatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                    data-testid="new-phone-whatsapp"
                  />
                </div>
                <div>
                  <Label>Nome (opcional)</Label>
                  <Input
                    value={newPhone.name}
                    onChange={(e) => setNewPhone({ ...newPhone, name: e.target.value })}
                    placeholder="Nome do morador"
                    data-testid="new-phone-name"
                  />
                </div>
                <Button onClick={handleAddPhone} className="w-full" data-testid="add-phone-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Telefone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BuildingAdminPanel;
