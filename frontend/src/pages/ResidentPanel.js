import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Bell, BellOff, User, LogOut, Package, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API = `${process.env.REACT_APP_BACKEND_URL || window.location.origin}/api`;

// Cores da marca ChegouAqui
const colors = {
  yellow: '#FFD839',
  black: '#2A2A2A',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  grayMetal: '#9A9A9A',
  tealTech: '#00E2C6',
};

const ResidentPanel = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/resident/profile`),
        axios.get(`${API}/resident/notifications`)
      ]);

      setProfile(profileRes.data);
      setEditName(profileRes.data.name || '');
      setEditEmail(profileRes.data.email || '');
      setNotifications(notificationsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/resident/notifications/${notificationId}/read`);
      loadData();
      toast.success('Notificação marcada como lida');
    } catch (error) {
      toast.error('Erro ao marcar notificação');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(`${API}/resident/profile`, {
        name: editName,
        email: editEmail
      });
      toast.success('Perfil atualizado!');
      setEditMode(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightGray }}>
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 animate-pulse" style={{ color: colors.yellow }} />
          <p style={{ color: colors.grayMetal }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      {/* Header */}
      <div style={{ backgroundColor: colors.black, color: colors.white }} className="shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <img 
                src="/logo-chegouaqui.png" 
                alt="ChegouAqui" 
                className="h-20 md:h-24 w-auto rounded-lg p-2"
                style={{ backgroundColor: colors.white }}
              />
              <div className="border-l-2 pl-3 md:pl-4" style={{ borderColor: colors.yellow }}>
                <h1 className="text-xl md:text-2xl font-bold">Minhas Notificações</h1>
                <p className="text-sm" style={{ color: colors.grayMetal }}>
                  {profile?.building_name} - Apto {profile?.apartment_number}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              style={{ color: colors.grayMetal }}
              className="hover:bg-white/10"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: colors.yellow }} />
                  Meu Perfil
                </CardTitle>
                <CardDescription>Informações do seu cadastro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editMode ? (
                  <>
                    <div>
                      <Label className="text-xs" style={{ color: colors.grayMetal }}>Nome</Label>
                      <p className="font-semibold">{profile?.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: colors.grayMetal }}>Telefone</Label>
                      <p className="font-semibold">{profile?.phone}</p>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: colors.grayMetal }}>Email</Label>
                      <p className="font-semibold">{profile?.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: colors.grayMetal }}>Apartamento</Label>
                      <p className="font-semibold">{profile?.apartment_number}</p>
                    </div>
                    <Button
                      onClick={() => setEditMode(true)}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1"
                        style={{ backgroundColor: colors.yellow, color: colors.black }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setEditMode(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}

                {/* Área de Monetização - Banner */}
                <div className="mt-6 p-4 rounded-lg border-2" style={{ 
                  borderColor: colors.tealTech,
                  backgroundColor: `${colors.tealTech}10`
                }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: colors.tealTech }}>
                    🎯 Oferta Especial
                  </p>
                  <p className="text-sm" style={{ color: colors.black }}>
                    Serviços para seu condomínio com desconto exclusivo!
                  </p>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    style={{ backgroundColor: colors.tealTech, color: colors.white }}
                  >
                    Ver Ofertas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notificações */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" style={{ color: colors.yellow }} />
                      Notificações de Encomendas
                    </CardTitle>
                    <CardDescription>
                      {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="w-16 h-16 mx-auto mb-4" style={{ color: colors.grayMetal }} />
                    <p style={{ color: colors.grayMetal }}>Nenhuma notificação ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          notification.status === 'unread' ? 'shadow-md' : 'opacity-75'
                        }`}
                        style={{
                          borderColor: notification.status === 'unread' ? colors.yellow : colors.lightGray,
                          backgroundColor: notification.status === 'unread' ? colors.white : colors.lightGray
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="w-5 h-5" style={{ color: colors.yellow }} />
                              {notification.status === 'unread' && (
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                  style={{ backgroundColor: colors.yellow, color: colors.black }}
                                >
                                  NOVA
                                </span>
                              )}
                            </div>
                            <p className="font-medium mb-2" style={{ color: colors.black }}>
                              {notification.message}
                            </p>
                            <p className="text-xs" style={{ color: colors.grayMetal }}>
                              {new Date(notification.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {notification.status === 'unread' && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              style={{ backgroundColor: colors.yellow, color: colors.black }}
                            >
                              Marcar como lida
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Área de Monetização - Banner Inferior */}
                {notifications.length > 3 && (
                  <div className="mt-6 p-4 rounded-lg text-center" style={{ 
                    backgroundColor: colors.yellow,
                    color: colors.black
                  }}>
                    <p className="font-bold mb-2">💼 Serviços para Condomínios</p>
                    <p className="text-sm mb-3">
                      Limpeza, Manutenção, Segurança e muito mais!
                    </p>
                    <Button
                      size="sm"
                      style={{ backgroundColor: colors.black, color: colors.white }}
                    >
                      Conhecer Serviços
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentPanel;
