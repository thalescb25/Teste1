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
  const [buildingData, setBuildingData] = useState(mockBuildings[0] || {});
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
    if (buildingData.id) {
      const storedBuildings = JSON.parse(localStorage.getItem('buildings') || '[]');
      const updatedBuildings = storedBuildings.map(b => 
        b.id === buildingData.id ? buildingData : b
      );
      localStorage.setItem('buildings', JSON.stringify(updatedBuildings));
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

  const handleEditCompany = (company) => {
    const newName = prompt("Nome da empresa:", company.name);
    const newSuite = prompt("Número do conjunto:", company.suite);
    
    if (newName && newSuite) {
      setCompanies(companies.map(c =>
        c.id === company.id
          ? { ...c, name: newName, suite: newSuite }
          : c
      ));
      toast({
        title: "Empresa Atualizada",
        description: `${newName} foi atualizada com sucesso.`,
      });
    }
  };

  const handleDeleteCompany = (company) => {
    if (window.confirm(`Deseja realmente excluir ${company.name}?`)) {
      setCompanies(companies.filter(c => c.id !== company.id));
      toast({
        title: "Empresa Excluída",
        description: `${company.name} foi removida com sucesso.`,
      });
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={handleDownloadQR}
            className="bg-primary hover:bg-blue-600 h-20 text-lg"
          >
            <QrCode className="w-6 h-6 mr-3" />
            Baixar OnePage QR Code
          </Button>
          <Button 
            onClick={handleUploadCSV}
            variant="outline"
            className="border-primary text-primary hover:bg-blue-50 h-20 text-lg"
          >
            <Upload className="w-6 h-6 mr-3" />
            Upload CSV Empresas
          </Button>
          <Button 
            onClick={handleDownloadTemplate}
            variant="outline"
            className="border-accent text-accent hover:bg-blue-50 h-20 text-lg"
          >
            <Download className="w-6 h-6 mr-3" />
            Download Template CSV
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
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

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-graphite">Empresas Cadastradas</h2>
              <div className="flex gap-3 w-full md:w-auto">
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
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
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
            <h2 className="text-2xl font-bold text-graphite mb-6">Histórico de Visitantes</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-neutral-dark text-center py-8">
                  Histórico de visitantes (somente leitura) - Em desenvolvimento
                </p>
              </CardContent>
            </Card>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewCompanyModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-graphite mb-4">Nova Empresa</h3>
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
                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">Número do Conjunto *</label>
                  <Input
                    value={newCompanyData.suite}
                    onChange={(e) => setNewCompanyData({...newCompanyData, suite: e.target.value})}
                    placeholder="Ex: 501"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setShowNewCompanyModal(false);
                    setNewCompanyData({ name: '', suite: '' });
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
                  Criar Empresa
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
