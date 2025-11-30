import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Building, LogOut, Plus, TrendingUp, Users, Package, Edit, Trash2 } from 'lucide-react';

const SuperAdminPanel = ({ user, onLogout }) => {
  const [buildings, setBuildings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [newBuilding, setNewBuilding] = useState({
    name: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    num_apartments: 10,
    plan: 'free',
  });

  const [editBuilding, setEditBuilding] = useState({
    name: '',
    plan: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [buildingsRes, statsRes] = await Promise.all([
        axios.get(`${API}/super-admin/buildings`),
        axios.get(`${API}/super-admin/stats`),
      ]);

      setBuildings(buildingsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuilding = async () => {
    try {
      await axios.post(`${API}/super-admin/buildings`, newBuilding);
      toast.success('Prédio criado com sucesso!');
      setShowAddDialog(false);
      setNewBuilding({
        name: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        num_apartments: 10,
        plan: 'free',
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar prédio');
    }
  };

  const handleToggleActive = async (buildingId, currentStatus) => {
    try {
      await axios.put(`${API}/super-admin/buildings/${buildingId}`, {
        active: !currentStatus,
      });
      toast.success('Status atualizado!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleUpdatePlan = async (buildingId, newPlan) => {
    try {
      await axios.put(`${API}/super-admin/buildings/${buildingId}`, {
        plan: newPlan,
      });
      toast.success('Plano atualizado!');
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar plano');
    }
  };

  const handleEditBuilding = async () => {
    try {
      await axios.put(`${API}/super-admin/buildings/${selectedBuilding.id}`, editBuilding);
      toast.success('Prédio atualizado com sucesso!');
      setShowEditDialog(false);
      setSelectedBuilding(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar prédio');
    }
  };

  const handleDeleteBuilding = async () => {
    try {
      await axios.delete(`${API}/super-admin/buildings/${selectedBuilding.id}`);
      toast.success('Prédio deletado com sucesso!');
      setShowDeleteDialog(false);
      setSelectedBuilding(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao deletar prédio');
    }
  };

  const openEditDialog = (building) => {
    setSelectedBuilding(building);
    setEditBuilding({
      name: building.name,
      plan: building.plan,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (building) => {
    setSelectedBuilding(building);
    setShowDeleteDialog(true);
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                Super Admin - ChegouAqui
              </h1>
              <p className="text-emerald-100 mt-1">Gerenciamento de Todos os Prédios</p>
            </div>
            <Button
              variant="secondary"
              onClick={onLogout}
              className="bg-white text-emerald-600 hover:bg-slate-100"
              data-testid="superadmin-logout-button"
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
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total de Prédios</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total_buildings || 0}</p>
                </div>
                <Building className="w-10 h-10 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Prédios Ativos</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.active_buildings || 0}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Entregas Total</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total_deliveries || 0}</p>
                </div>
                <Package className="w-10 h-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Hoje</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.today_deliveries || 0}</p>
                </div>
                <Users className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prédios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prédios Cadastrados</CardTitle>
                <CardDescription>Gerenciar todos os prédios da plataforma</CardDescription>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="add-building-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Prédio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Prédio</DialogTitle>
                    <DialogDescription>Preencha os dados do prédio e do administrador</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Prédio</Label>
                        <Input
                          value={newBuilding.name}
                          onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                          placeholder="Edifício Example"
                          data-testid="new-building-name"
                        />
                      </div>
                      <div>
                        <Label>Número de Apartamentos</Label>
                        <Input
                          type="number"
                          value={newBuilding.num_apartments}
                          onChange={(e) => setNewBuilding({ ...newBuilding, num_apartments: parseInt(e.target.value) })}
                          data-testid="new-building-apartments"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Plano</Label>
                      <select
                        className="w-full h-10 px-3 border border-slate-300 rounded-md"
                        value={newBuilding.plan}
                        onChange={(e) => setNewBuilding({ ...newBuilding, plan: e.target.value })}
                        data-testid="new-building-plan"
                      >
                        <option value="free">Free (100 mensagens/mês)</option>
                        <option value="basic">Basic (500 mensagens/mês)</option>
                        <option value="premium">Premium (2000 mensagens/mês)</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Dados do Administrador</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={newBuilding.admin_name}
                            onChange={(e) => setNewBuilding({ ...newBuilding, admin_name: e.target.value })}
                            placeholder="Nome do administrador"
                            data-testid="new-building-admin-name"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newBuilding.admin_email}
                            onChange={(e) => setNewBuilding({ ...newBuilding, admin_email: e.target.value })}
                            placeholder="admin@exemplo.com"
                            data-testid="new-building-admin-email"
                          />
                        </div>
                        <div>
                          <Label>Senha</Label>
                          <Input
                            type="password"
                            value={newBuilding.admin_password}
                            onChange={(e) => setNewBuilding({ ...newBuilding, admin_password: e.target.value })}
                            placeholder="••••••••"
                            data-testid="new-building-admin-password"
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleAddBuilding} className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="save-building-button">
                      Criar Prédio
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {buildings.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Nenhum prédio cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {buildings.map((building) => (
                  <Card key={building.id} className="border-l-4 border-l-emerald-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{building.name}</h3>
                            <Badge variant={building.active ? 'default' : 'secondary'}>
                              {building.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {building.plan}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-600">Código de Registro</p>
                              <p className="font-mono font-semibold">{building.registration_code}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Apartamentos</p>
                              <p className="font-semibold">{building.num_apartments}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Mensagens</p>
                              <p className="font-semibold">
                                {building.messages_used} / {building.message_quota}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-6">
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Ativo</Label>
                              <Switch
                                checked={building.active}
                                onCheckedChange={() => handleToggleActive(building.id, building.active)}
                                data-testid={`toggle-active-${building.id}`}
                              />
                            </div>
                            <select
                              className="h-9 px-3 border border-slate-300 rounded-md text-sm"
                              value={building.plan}
                              onChange={(e) => handleUpdatePlan(building.id, e.target.value)}
                              data-testid={`update-plan-${building.id}`}
                            >
                              <option value="free">Free</option>
                              <option value="basic">Basic</option>
                              <option value="premium">Premium</option>
                            </select>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(building)}
                                data-testid={`edit-building-${building.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteDialog(building)}
                                data-testid={`delete-building-${building.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
      </div>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Prédio</DialogTitle>
            <DialogDescription>Alterar informações do prédio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do Prédio</Label>
              <Input
                value={editBuilding.name}
                onChange={(e) => setEditBuilding({ ...editBuilding, name: e.target.value })}
                data-testid="edit-building-name"
              />
            </div>
            <div>
              <Label>Plano</Label>
              <select
                className="w-full h-10 px-3 border border-slate-300 rounded-md"
                value={editBuilding.plan}
                onChange={(e) => setEditBuilding({ ...editBuilding, plan: e.target.value })}
                data-testid="edit-building-plan"
              >
                <option value="free">Free (100 mensagens/mês)</option>
                <option value="basic">Basic (500 mensagens/mês)</option>
                <option value="premium">Premium (2000 mensagens/mês)</option>
              </select>
            </div>
            <Button onClick={handleEditBuilding} className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid="save-edit-building">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Prédio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o prédio "{selectedBuilding?.name}" e todos os dados associados:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Todos os usuários (admins e porteiros)</li>
                <li>Todos os apartamentos</li>
                <li>Todos os telefones cadastrados</li>
                <li>Histórico de entregas</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-building">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBuilding}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-building"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdminPanel;
