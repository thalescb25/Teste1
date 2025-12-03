import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockBuildings, mockPlans, mockFinancialMetrics, mockSystemSettings } from '../mockData';
import Navbar from '../components/Navbar';
import { 
  Building2, DollarSign, TrendingUp, TrendingDown, Users, Settings,
  Plus, Edit, Trash2, Eye, EyeOff, Mail, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';

const SuperAdmin = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [buildings, setBuildings] = useState(mockBuildings);
  const [plans, setPlans] = useState(mockPlans);
  const [metrics, setMetrics] = useState(mockFinancialMetrics);
  const [settings, setSettings] = useState(mockSystemSettings);
  const [showNewBuildingModal, setShowNewBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNewBuilding = () => {
    const name = prompt("Nome do Prédio:");
    const address = prompt("Endereço:");
    const city = prompt("Cidade:");
    const state = prompt("Estado (sigla):");
    const plan = prompt("Plano (start/business/corporate):");
    const maxSuites = parseInt(prompt("Número máximo de conjuntos:"));
    const adminEmail = prompt("E-mail do administrador:");
    
    if (name && address && city && state && plan && maxSuites && adminEmail) {
      const planPrices = { start: 149, business: 249, corporate: 399 };
      const newBuilding = {
        id: String(buildings.length + 1),
        name,
        address,
        city,
        state,
        plan,
        maxSuites,
        currentSuites: 0,
        status: 'active',
        documentRequired: true,
        selfieRequired: false,
        defaultLanguage: 'pt',
        monthlyRevenue: planPrices[plan] || 0,
        adminEmail,
        createdAt: new Date().toISOString()
      };
      
      setBuildings([...buildings, newBuilding]);
      
      // Atualizar métricas
      setMetrics({
        ...metrics,
        totalBuildings: metrics.totalBuildings + 1,
        newBuildingsThisMonth: metrics.newBuildingsThisMonth + 1,
        mrr: metrics.mrr + (planPrices[plan] || 0)
      });
      
      toast({
        title: "Prédio Criado",
        description: `${name} foi adicionado com sucesso ao plano ${plan}.`,
      });
    }
  };

  const handleEditBuilding = (building) => {
    const name = prompt("Nome do Prédio:", building.name);
    const address = prompt("Endereço:", building.address);
    const adminEmail = prompt("E-mail do administrador:", building.adminEmail);
    
    if (name && address && adminEmail) {
      setBuildings(buildings.map(b =>
        b.id === building.id
          ? { ...b, name, address, adminEmail, updatedAt: new Date().toISOString() }
          : b
      ));
      
      toast({
        title: "Prédio Atualizado",
        description: `${name} foi atualizado com sucesso.`,
      });
    }
  };

  const handleDeleteBuilding = (building) => {
    if (window.confirm(`Deseja realmente excluir ${building.name}?`)) {
      setBuildings(buildings.filter(b => b.id !== building.id));
      toast({
        title: "Prédio Excluído",
        description: `${building.name} foi removido com sucesso.`,
      });
    }
  };

  const handleEditPlan = (plan) => {
    toast({
      title: "Editar Plano",
      description: `Editando plano ${plan.name}`,
    });
    setEditingPlan(plan);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações Salvas",
      description: "As configurações do sistema foram atualizadas com sucesso.",
    });
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'super_admin') {
        navigate('/login');
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
      } else {
        setUser(parsedUser);
      }
    }
  }, [navigate, toast]);

  const StatCard = ({ icon: Icon, title, value, trend, trendValue, color }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-accent' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-semibold">{trendValue}</span>
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-neutral-dark mb-1">{title}</p>
        <p className="text-3xl font-bold text-graphite">{value}</p>
      </CardContent>
    </Card>
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-graphite mb-2">Super Admin Dashboard</h1>
          <p className="text-neutral-dark">Gestão completa da plataforma AcessaAqui</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard Financeiro' },
            { id: 'buildings', label: 'Prédios' },
            { id: 'plans', label: 'Planos' },
            { id: 'settings', label: 'Configurações' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-neutral-dark hover:bg-neutral-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Financeiro */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics - Simplificado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={DollarSign}
                title="Receita do Mês (MRR)"
                value={formatCurrency(metrics.mrr)}
                trend="up"
                trendValue="+10.5%"
                color="bg-primary"
              />
              <StatCard
                icon={TrendingUp}
                title="Receita Anual Estimada (ARR)"
                value={formatCurrency(metrics.arr)}
                trend="up"
                trendValue="+12.3%"
                color="bg-accent"
              />
              <StatCard
                icon={Users}
                title="Novos Prédios este Mês"
                value={metrics.newBuildingsThisMonth}
                color="bg-blue-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MRR Evolution */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução MRR (12 meses)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {metrics.mrrEvolution.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-primary rounded-t-lg transition-all hover:bg-blue-600"
                          style={{ height: `${(item.value / 13000) * 100}%` }}
                        ></div>
                        <span className="text-xs text-neutral-dark mt-2">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Buildings by Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Prédios por Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(metrics.buildingsByPlan).map(([plan, count]) => (
                      <div key={plan}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-graphite capitalize">{plan}</span>
                          <span className="text-sm font-bold text-primary">{count}</span>
                        </div>
                        <div className="w-full bg-neutral-light rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${(count / metrics.totalBuildings) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Previsão MRR (12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {metrics.forecast.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-accent rounded-t-lg transition-all hover:bg-blue-400"
                        style={{ height: `${(item.value / 22000) * 100}%` }}
                      ></div>
                      <span className="text-xs text-neutral-dark mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prédios */}
        {activeTab === 'buildings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-graphite">Prédios Cadastrados</h2>
              <Button 
                onClick={handleNewBuilding}
                className="bg-primary hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Prédio
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {buildings.map((building) => (
                <Card key={building.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building2 className="w-6 h-6 text-primary" />
                          <h3 className="text-lg font-bold text-graphite">{building.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            building.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {building.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-dark mb-4">
                          {building.address}, {building.city} - {building.state}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-neutral-dark">Plano</p>
                            <p className="text-sm font-semibold text-graphite capitalize">{building.plan}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-dark">Conjuntos</p>
                            <p className="text-sm font-semibold text-graphite">{building.currentSuites}/{building.maxSuites}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-dark">MRR</p>
                            <p className="text-sm font-semibold text-primary">{formatCurrency(building.monthlyRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-dark">Admin</p>
                            <p className="text-xs text-neutral-dark truncate">{building.adminEmail}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button 
                          onClick={() => handleEditBuilding(building)}
                          variant="outline" 
                          size="sm" 
                          className="border-primary text-primary hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteBuilding(building)}
                          variant="outline" 
                          size="sm" 
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Planos */}
        {activeTab === 'plans' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-graphite mb-2">Gestão de Planos</h2>
              <p className="text-neutral-dark">Edite os planos disponíveis para contratação</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`hover:shadow-xl transition-all ${!plan.active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
                      {plan.active ? (
                        <Eye className="w-5 h-5 text-accent" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-neutral-dark" />
                      )}
                    </div>
                    <p className="text-4xl font-bold text-graphite mb-2">
                      {formatCurrency(plan.monthlyPrice)}
                      <span className="text-sm text-neutral-dark font-normal">/mês</span>
                    </p>
                    <p className="text-sm text-neutral-dark mb-4">{plan.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-dark">Conjuntos</span>
                        <span className="font-semibold text-graphite">{plan.minSuites} - {plan.maxSuites}</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleEditPlan(plan)}
                      variant="outline" 
                      className="w-full border-primary text-primary hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Plano
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Configurações */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-graphite mb-6">Configurações do Sistema</h2>

            <div className="space-y-6">
              {/* Support Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-primary" />
                    E-mail de Suporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input 
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                    className="max-w-md"
                  />
                </CardContent>
              </Card>

              {/* LGPD Text */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Texto LGPD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={settings.lgpdText}
                    onChange={(e) => setSettings({...settings, lgpdText: e.target.value})}
                    rows={4}
                    className="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </CardContent>
              </Card>

              {/* Email Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-primary" />
                    Template de E-mail: Chegada de Visitante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-graphite mb-2 block">Assunto</label>
                      <Input 
                        value={settings.emailTemplates.visitorArrival.subject}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-graphite mb-2 block">Corpo</label>
                      <textarea
                        value={settings.emailTemplates.visitorArrival.body}
                        rows={6}
                        className="w-full p-3 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      />
                      <p className="text-xs text-neutral-dark mt-2">
                        Variáveis disponíveis: [visitorName], [hostName], [representingCompany], [reason], [companions]
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSettings}
                  className="bg-primary hover:bg-blue-600"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdmin;
