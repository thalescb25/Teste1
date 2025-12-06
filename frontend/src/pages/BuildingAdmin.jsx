import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCompanies, mockUsers, mockVisitors, mockBuildings } from '../mockData';
import Navbar from '../components/Navbar';
import { generateQROnePage } from '../utils/generateQRPDF';
import { 
  Building2, Plus, Upload, Download, Users, Search, Edit, Trash2,
  FileText, Settings as SettingsIcon, QrCode
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';

const BuildingAdmin = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState(mockCompanies);
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [buildingData, setBuildingData] = useState(mockBuildings[0] || { id: '1', name: '', address: '', city: '', state: '', phone: '', cnpj: '' });
  const [newCompanyData, setNewCompanyData] = useState({ name: '', suite: '', phone: '', cnpj: '' });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load data from localStorage
  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) setCompanies(JSON.parse(storedCompanies));
    
    const storedVisitors = localStorage.getItem('visitors');
    if (storedVisitors) setVisitors(JSON.parse(storedVisitors));
    
    const storedBuildings = localStorage.getItem('buildings');
    if (storedBuildings) {
      const buildings = JSON.parse(storedBuildings);
      const building = buildings.find(b => b.id === user?.buildingId) || buildings[0];
      setBuildingData(building);
    }
  }, [user]);
  
  // Save companies to localStorage
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);
  
  // Save building data to localStorage
  useEffect(() => {
    if (buildingData && buildingData.id) {
      const storedBuildings = JSON.parse(localStorage.getItem('buildings') || '[]');
      const updatedBuildings = storedBuildings.map(b => 
        b.id === buildingData.id ? buildingData : b
      );
      if (updatedBuildings.length > 0) {
        localStorage.setItem('buildings', JSON.stringify(updatedBuildings));
      }
    }
  }, [buildingData]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'building_admin') {
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

  const handleNewCompany = () => {
    setNewCompanyData({ name: '', suite: '', phone: '', cnpj: '' });
    setEditingCompany(null);
    setShowNewCompanyModal(true);
  };
  
  const handleEditCompany = (company) => {
    setNewCompanyData(company);
    setEditingCompany(company);
    setShowNewCompanyModal(true);
  };

  const confirmNewCompany = () => {
    if (newCompanyData.name && newCompanyData.suite) {
      if (editingCompany) {
        // Editing existing
        setCompanies(companies.map(c => 
          c.id === editingCompany.id ? {...newCompanyData, id: editingCompany.id, buildingId: user.buildingId} : c
        ));
        toast({
          title: "Empresa Atualizada",
          description: `${newCompanyData.name} foi atualizada com sucesso.`,
        });
      } else {
        // Creating new
        const newCompany = {
          id: `c${Date.now()}`,
          buildingId: user.buildingId,
          ...newCompanyData,
          status: 'active',
          receptionists: []
        };
        setCompanies([...companies, newCompany]);
        toast({
          title: "Empresa Criada",
          description: `${newCompanyData.name} foi adicionada com sucesso.`,
        });
      }
      setShowNewCompanyModal(false);
      setEditingCompany(null);
      setNewCompanyData({ name: '', suite: '', phone: '', cnpj: '' });
    } else {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteCompany = (company) => {
    setCompanyToDelete(company);
    setShowDeleteModal(true);
  };
  
  const confirmDeleteCompany = () => {
    setCompanies(companies.filter(c => c.id !== companyToDelete.id));
    setShowDeleteModal(false);
    toast({
      title: "Empresa Excluída",
      description: `${companyToDelete.name} foi removida com sucesso.`,
    });
    setCompanyToDelete(null);
  };

  const handleDownloadQR = async () => {
    try {
      // Buscar dados do prédio
      const building = mockBuildings.find(b => b.id === user.buildingId) || {
        name: "Edifício Empresarial Central",
        address: "Av. Paulista, 1000 - São Paulo, SP"
      };
      
      toast({
        title: "Gerando PDF...",
        description: "Aguarde enquanto preparamos o QR Code OnePage.",
      });
      
      await generateQROnePage(building.name, user.buildingId, building.address);
      
      toast({
        title: "PDF Gerado com Sucesso!",
        description: "O arquivo foi baixado. Imprima e coloque na recepção do prédio.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o QR Code. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleUploadCSV = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const Papa = (await import('papaparse')).default;
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const newCompanies = results.data.map((row, index) => ({
                id: `c${Date.now()}_${index}`,
                buildingId: user.buildingId,
                name: row['Nome da Empresa'] || row['nome'] || row['name'],
                suite: row['Número do Conjunto'] || row['conjunto'] || row['suite'],
                phone: row['Telefone'] || row['phone'] || '',
                cnpj: row['CNPJ'] || row['cnpj'] || '',
                status: 'active',
                receptionists: []
              })).filter(c => c.name && c.suite);
              
              setCompanies([...companies, ...newCompanies]);
              toast({
                title: "CSV Importado",
                description: `${newCompanies.length} empresas foram importadas com sucesso.`,
              });
            },
            error: (error) => {
              toast({
                title: "Erro ao importar",
                description: `Erro: ${error.message}`,
                variant: "destructive"
              });
            }
          });
        } catch (error) {
          toast({
            title: "Erro",
            description: "Não foi possível processar o arquivo CSV.",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const handleDownloadTemplate = () => {
    const csvContent = "Nome da Empresa,Número do Conjunto,Email da Recepcionista,Nome da Recepcionista\nTech Solutions,501,recepcao@techsolutions.com.br,Maria Silva\nMarketing Pro,502,recepcao@marketingpro.com.br,João Santos\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_empresas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Baixado",
      description: "Use este arquivo como exemplo para cadastro em massa.",
    });
  };

  const handleSaveBuilding = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const updatedBuilding = {
      ...buildingData,
      name: formData.get('buildingName'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      phone: formData.get('phone'),
      cnpj: formData.get('cnpj'),
      sindicoName: formData.get('sindicoName'),
      sindicoEmail: formData.get('sindicoEmail'),
      sindicoPhone: formData.get('sindicoPhone'),
      documentRequired: formData.get('documentRequired') === 'on',
      selfieRequired: formData.get('selfieRequired') === 'on',
      defaultLanguage: formData.get('defaultLanguage')
    };
    
    setBuildingData(updatedBuilding);
    
    toast({
      title: "Configurações Salvas",
      description: "As configurações do prédio foram salvas com sucesso.",
    });
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.suite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-graphite mb-2">Administração do Prédio</h1>
          <p className="text-sm md:text-base text-neutral-dark">Gestão de empresas, recepcionistas e configurações</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Button 
            onClick={handleDownloadQR}
            size="lg"
            className="bg-primary hover:bg-blue-600"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Baixar OnePage QR Code
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'cadastro', label: 'Cadastro do Prédio' },
            { id: 'companies', label: 'Empresas' },
            { id: 'visitors', label: 'Histórico de Visitantes' },
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

        {/* Cadastro Tab */}
        {activeTab === 'cadastro' && (
          <div>
            <h2 className="text-2xl font-bold text-graphite mb-6">Dados do Prédio</h2>
            <form onSubmit={handleSaveBuilding}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">Nome do Prédio *</label>
                        <Input name="buildingName" defaultValue={buildingData?.name || ''} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">CNPJ</label>
                        <Input name="cnpj" defaultValue={buildingData?.cnpj || ''} placeholder="00.000.000/0000-00" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-graphite mb-2 block">Endereço Completo *</label>
                        <Input name="address" defaultValue={buildingData?.address || ''} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">Cidade *</label>
                        <Input name="city" defaultValue={buildingData?.city || ''} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">Estado *</label>
                        <Input name="state" defaultValue={buildingData?.state || ''} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">Telefone</label>
                        <Input name="phone" defaultValue={buildingData?.phone || ''} placeholder="(11) 3000-1000" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dados do Síndico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">Nome do Síndico</label>
                        <Input name="sindicoName" defaultValue={buildingData?.sindicoName || ''} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">E-mail do Síndico</label>
                        <Input type="email" name="sindicoEmail" defaultValue={buildingData?.sindicoEmail || ''} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-graphite mb-2 block">Telefone do Síndico</label>
                        <Input name="sindicoPhone" defaultValue={buildingData?.sindicoPhone || ''} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Visitantes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="documentRequired"
                        defaultChecked={buildingData?.documentRequired || false}
                        className="w-4 h-4 text-primary"
                      />
                      <label className="text-sm text-graphite">Documento obrigatório</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="selfieRequired"
                        defaultChecked={buildingData?.selfieRequired || false}
                        className="w-4 h-4 text-primary"
                      />
                      <label className="text-sm text-graphite">Selfie obrigatória</label>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-graphite mb-2 block">Idioma Padrão</label>
                      <select
                        name="defaultLanguage"
                        defaultValue={buildingData?.defaultLanguage || 'pt'}
                        className="w-full p-2 border border-neutral-medium rounded-lg"
                      >
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="bg-primary hover:bg-blue-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Salvar Cadastro
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-graphite">Empresas Cadastradas</h2>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-dark" />
                  <Input
                    type="text"
                    placeholder="Buscar empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleNewCompany}
                  className="bg-primary hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Empresa
                </Button>
                <Button 
                  onClick={handleUploadCSV}
                  variant="outline"
                  className="border-primary text-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSV
                </Button>
                <Button 
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="border-accent text-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Template CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Building2 className="w-6 h-6 text-primary" />
                          <h3 className="text-lg font-bold text-graphite">{company.name}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Ativo
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-neutral-dark">Conjunto</p>
                            <p className="text-sm font-semibold text-graphite">{company.suite}</p>
                          </div>
                          <div>
                            <p className="text-xs text-neutral-dark">Recepcionistas</p>
                            <p className="text-sm font-semibold text-graphite">{company.receptionists.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button 
                          onClick={() => handleEditCompany(company)}
                          variant="outline" 
                          size="sm" 
                          className="border-primary text-primary hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteCompany(company)}
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

        {/* Visitors History Tab */}
        {activeTab === 'visitors' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-graphite">Histórico de Visitantes</h2>
              <Button
                onClick={() => {
                  const { exportVisitorsToExcel } = require('../utils/excelExport');
                  exportVisitorsToExcel(visitors, companies);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
            
            {visitors.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-neutral-dark">
                  Nenhum visitante registrado ainda
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {visitors
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map(visitor => {
                    const company = companies.find(c => c.id === visitor.companyId);
                    return (
                      <Card key={visitor.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="font-semibold text-graphite">{visitor.fullName}</span>
                                {visitor.serviceProvider && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    Prestador
                                  </span>
                                )}
                              </div>
                              <div className="text-neutral-dark">
                                <div>Email: {visitor.email || 'N/A'}</div>
                                <div>Tel: {visitor.phone || 'N/A'}</div>
                              </div>
                              <div className="text-neutral-dark">
                                <div>Empresa: {company?.name || 'N/A'}</div>
                                <div>Anfitrião: {visitor.hostName}</div>
                              </div>
                              <div className="text-neutral-dark text-xs">
                                {visitor.checkInTime ? (
                                  <>Entrada: {new Date(visitor.checkInTime).toLocaleString('pt-BR')}</>
                                ) : (
                                  <>Criado: {new Date(visitor.createdAt).toLocaleString('pt-BR')}</>
                                )}
                              </div>
                            </div>
                            <div>
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                visitor.status === 'approved' ? 'bg-green-100 text-green-700' :
                                visitor.status === 'denied' ? 'bg-red-100 text-red-700' :
                                visitor.status === 'checked_out' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {visitor.status === 'approved' ? 'Aprovado' :
                                 visitor.status === 'denied' ? 'Recusado' :
                                 visitor.status === 'checked_out' ? 'Finalizado' : 'Pendente'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-graphite mb-6">Configurações do Prédio</h2>
            <form onSubmit={handleSaveBuilding}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos de Check-in</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        name="documentRequired"
                        type="checkbox" 
                        className="w-5 h-5 text-primary" 
                        defaultChecked 
                      />
                      <span className="text-graphite">Documento obrigatório</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        name="selfieRequired"
                        type="checkbox" 
                        className="w-5 h-5 text-primary" 
                      />
                      <span className="text-graphite">Selfie obrigatória</span>
                    </label>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Idioma Padrão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select 
                      name="defaultLanguage"
                      className="w-full p-3 border border-neutral-medium rounded-lg"
                    >
                      <option value="pt">Português</option>
                      <option value="en">English</option>
                    </select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contato</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-dark mb-2">
                      Para suporte, entre em contato:
                    </p>
                    <a 
                      href="mailto:neuraone.ai@gmail.com"
                      className="text-primary hover:text-blue-600 font-semibold"
                    >
                      neuraone.ai@gmail.com
                    </a>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-blue-600">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* New Company Modal */}
        {showNewCompanyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowNewCompanyModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-graphite mb-4">
                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">Nome da Empresa *</label>
                  <Input
                    value={newCompanyData.name}
                    onChange={(e) => setNewCompanyData({...newCompanyData, name: e.target.value})}
                    placeholder="Ex: Tech Solutions Ltda"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Número do Conjunto *</label>
                    <Input
                      value={newCompanyData.suite}
                      onChange={(e) => setNewCompanyData({...newCompanyData, suite: e.target.value})}
                      placeholder="Ex: 501"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-graphite mb-2 block">Telefone</label>
                    <Input
                      value={newCompanyData.phone}
                      onChange={(e) => setNewCompanyData({...newCompanyData, phone: e.target.value})}
                      placeholder="(11) 3333-4444"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">CNPJ</label>
                  <Input
                    value={newCompanyData.cnpj}
                    onChange={(e) => setNewCompanyData({...newCompanyData, cnpj: e.target.value})}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowNewCompanyModal(false);
                    setEditingCompany(null);
                    setNewCompanyData({ name: '', suite: '', phone: '', cnpj: '' });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmNewCompany}
                  className="flex-1 bg-primary hover:bg-blue-600"
                >
                  {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Deletar Empresa */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-graphite mb-4">Confirmar Exclusão</h3>
              <p className="text-neutral-dark mb-6">
                Deseja realmente excluir <strong>{companyToDelete?.name}</strong>?
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCompanyToDelete(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDeleteCompany}
                  variant="destructive"
                  className="flex-1"
                >
                  Confirmar Exclusão
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingAdmin;
