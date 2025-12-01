import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Bell, CheckCircle, LogOut, History, Home, ArrowLeft, Package, MessageCircle } from 'lucide-react';
import { colors } from '../theme';

const DoormanPanel = ({ user, onLogout }) => {
  const [apartments, setApartments] = useState([]);
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [todayNotifications, setTodayNotifications] = useState([]);
  const [historyDays, setHistoryDays] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [buildingRes, apartmentsRes] = await Promise.all([
        axios.get(`${API}/admin/building`),
        axios.get(`${API}/admin/apartments-with-phones`),
      ]);

      setBuilding(buildingRes.data);
      setApartments(apartmentsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (days = 1) => {
    try {
      setHistoryDays(days);
      let response;
      
      if (days === 1) {
        response = await axios.get(`${API}/doorman/deliveries/today`);
      } else {
        response = await axios.get(`${API}/doorman/deliveries?days=${days}`);
      }
      
      setTodayNotifications(response.data);
      setShowHistory(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao carregar histórico');
    }
  };

  const handleApartmentClick = async (apartment) => {
    if (!apartment.phones || apartment.phones.length === 0) {
      toast.error(`Apartamento ${apartment.number} não tem telefones cadastrados.`, {
        duration: 5000
      });
      return;
    }

    setSelectedApartment(apartment);
    setSending(true);

    try {
      const response = await axios.post(`${API}/doorman/delivery`, {
        apartment_id: apartment.id,
      });

      if (response.data.status === 'success') {
        toast.success(`✅ Aviso enviado para o apartamento ${apartment.number}!`);
      } else {
        toast.error('Falha ao enviar aviso');
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.detail?.includes('Cota')) {
        toast.error('Cota de mensagens excedida! Contate o administrador.');
      } else if (error.response?.status === 400 && error.response?.data?.detail?.includes('telefone')) {
        toast.error('Nenhum telefone cadastrado para este apartamento');
      } else {
        toast.error('Erro ao enviar aviso');
      }
      setSelectedApartment(null);
    } finally {
      setSending(false);
    }
  };

  const handleBackToPanel = () => {
    setSelectedApartment(null);
    setShowHistory(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.lightGray }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: colors.yellow }}></div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
        <div style={{ backgroundColor: colors.black, color: colors.white }} className="shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToPanel}
                  style={{ color: colors.yellow }}
                  className="hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <div className="border-l-2 pl-4" style={{ borderColor: colors.grayMetal }}>
                  <h1 className="text-2xl font-bold">Histórico de Avisos</h1>
                  <p className="text-sm" style={{ color: colors.grayMetal }}>{building?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Card style={{ borderColor: colors.yellow, borderWidth: '2px' }}>
            <CardHeader style={{ backgroundColor: colors.white }}>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Avisos Enviados</CardTitle>
                  <CardDescription>Últimos {historyDays === 1 ? 'hoje' : `${historyDays} dias`}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => loadHistory(1)}
                    style={{
                      backgroundColor: historyDays === 1 ? colors.yellow : colors.lightGray,
                      color: historyDays === 1 ? colors.black : colors.grayMetal
                    }}
                  >
                    Hoje
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => loadHistory(7)}
                    style={{
                      backgroundColor: historyDays === 7 ? colors.yellow : colors.lightGray,
                      color: historyDays === 7 ? colors.black : colors.grayMetal
                    }}
                  >
                    7 dias
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => loadHistory(30)}
                    style={{
                      backgroundColor: historyDays === 30 ? colors.yellow : colors.lightGray,
                      color: historyDays === 30 ? colors.black : colors.grayMetal
                    }}
                  >
                    30 dias
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {todayNotifications.length === 0 ? (
                <div className="text-center py-12" style={{ color: colors.grayMetal }}>
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Nenhum aviso registrado neste período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayNotifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border-l-4"
                      style={{
                        backgroundColor: colors.lightGray,
                        borderLeftColor: notif.status === 'success' ? colors.yellow : colors.grayMetal
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold" style={{ color: colors.black }}>
                            Apartamento {notif.apartment_number}
                          </p>
                          <p className="text-sm" style={{ color: colors.grayMetal }}>
                            {new Date(notif.timestamp).toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs mt-1" style={{ color: colors.grayMetal }}>
                            {notif.phones_notified?.length || 0} telefone(s) notificado(s)
                          </p>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: notif.status === 'success' ? colors.yellow : colors.grayMetal,
                            color: colors.black
                          }}
                        >
                          {notif.status === 'success' ? '✓ Enviado' : 'Falhou'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedApartment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.lightGray }}>
        <Card className="max-w-md w-full" style={{ borderColor: colors.yellow, borderWidth: '3px' }}>
          <CardContent className="p-8 text-center">
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: colors.yellow }}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: colors.black }}></div>
              ) : (
                <CheckCircle className="w-12 h-12" style={{ color: colors.black }} />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.black }}>
              {sending ? 'Enviando Aviso...' : 'Aviso Enviado!'}
            </h2>
            <p className="mb-6" style={{ color: colors.grayMetal }}>
              Apartamento {selectedApartment.number}
            </p>
            {!sending && (
              <Button
                onClick={handleBackToPanel}
                className="w-full"
                style={{ backgroundColor: colors.black, color: colors.white }}
              >
                <Home className="w-4 h-4 mr-2" />
                Voltar ao Painel
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightGray }}>
      <div style={{ backgroundColor: colors.black, color: colors.white }} className="shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
              <img 
                src="/logo-chegouaqui.png" 
                alt="ChegouAqui" 
                className="h-20 md:h-36 w-auto rounded-lg p-2 md:p-3"
                style={{ backgroundColor: colors.white }}
              />
              <div className="border-l-2 pl-3 md:pl-4" style={{ borderColor: colors.yellow }}>
                <h1 className="text-lg md:text-2xl font-bold">Painel do Porteiro</h1>
                <p className="text-xs md:text-sm" style={{ color: colors.grayMetal }}>{building?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
              <Button
                variant="ghost"
                onClick={() => loadHistory(1)}
                style={{ color: colors.yellow }}
                className="hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
                data-testid="doorman-history-button"
              >
                <History className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden md:inline">Histórico</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = 'mailto:neuraone.ai@gmail.com?subject=Contato ChegouAqui'}
                style={{ color: colors.yellow }}
                className="hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
                data-testid="doorman-contact-button"
              >
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden md:inline">Fale Conosco</span>
              </Button>
              <Button
                variant="ghost"
                onClick={onLogout}
                style={{ color: colors.grayMetal }}
                className="hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
                data-testid="doorman-logout-button"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6" style={{ borderColor: colors.yellow, borderWidth: '2px' }}>
          <CardHeader style={{ backgroundColor: colors.white }}>
            <div className="text-center">
              <Bell className="w-12 h-12 mx-auto mb-3" style={{ color: colors.yellow }} />
              <CardTitle className="text-3xl" style={{ color: colors.black }}>Notificar Moradores</CardTitle>
              <CardDescription className="text-base mt-2" style={{ color: colors.grayMetal }}>
                Clique no apartamento para enviar aviso de encomenda
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {apartments.map((apt) => {
            const hasPhones = apt.phones && apt.phones.length > 0;
            
            return (
              <button
                key={apt.id}
                onClick={() => handleApartmentClick(apt)}
                disabled={sending}
                className="group relative p-6 rounded-lg transition-all duration-200 border-2"
                style={{
                  backgroundColor: hasPhones ? colors.white : colors.lightGray,
                  borderColor: hasPhones ? colors.yellow : colors.grayMetal,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.6 : 1
                }}
                data-testid={`apt-button-${apt.number}`}
              >
                <div className="absolute top-2 right-2">
                  {hasPhones ? (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.techTeal }}
                    />
                  ) : (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.grayMetal }}
                    />
                  )}
                </div>
                
                <div className="text-center">
                  <Package 
                    className="w-8 h-8 mx-auto mb-2" 
                    style={{ color: hasPhones ? colors.yellow : colors.grayMetal }}
                  />
                  <p 
                    className="text-2xl font-bold mb-1"
                    style={{ color: hasPhones ? colors.black : colors.grayMetal }}
                  >
                    {apt.number}
                  </p>
                  {hasPhones ? (
                    <div className="text-xs space-y-0.5" style={{ color: colors.grayMetal }}>
                      {apt.phones.slice(0, 2).map((phone, idx) => (
                        <p key={idx} className="truncate px-1">
                          {phone.name || phone.whatsapp}
                        </p>
                      ))}
                      {apt.phones.length > 2 && (
                        <p className="font-semibold">+{apt.phones.length - 2} mais</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: colors.grayMetal }}>
                      Sem cadastro
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {apartments.length === 0 && (
          <div className="text-center py-12" style={{ color: colors.grayMetal }}>
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhum apartamento cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoormanPanel;