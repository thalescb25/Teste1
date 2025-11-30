import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Package, CheckCircle, LogOut, History, Home, ArrowLeft } from 'lucide-react';

const DoormanPanel = ({ user, onLogout }) => {
  const [apartments, setApartments] = useState([]);
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [historyDays, setHistoryDays] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [buildingRes, apartmentsRes] = await Promise.all([
        axios.get(`${API}/admin/building`),
        axios.get(`${API}/admin/apartments`),
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
      console.log(`Carregando histórico: ${days} dia(s)`);
      
      let response;
      
      if (days === 1) {
        console.log('Chamando:', `${API}/doorman/deliveries/today`);
        response = await axios.get(`${API}/doorman/deliveries/today`);
      } else {
        console.log('Chamando:', `${API}/doorman/deliveries?days=${days}`);
        response = await axios.get(`${API}/doorman/deliveries?days=${days}`);
      }
      
      console.log('Resposta recebida:', response.data);
      setTodayDeliveries(response.data);
      setShowHistory(true);
    } catch (error) {
      console.error('Erro detalhado ao carregar histórico:', error);
      console.error('Response:', error.response);
      toast.error(error.response?.data?.detail || 'Erro ao carregar histórico');
    }
  };

  const handleApartmentClick = async (apartment) => {
    setSelectedApartment(apartment);
    setSending(true);

    try {
      const response = await axios.post(`${API}/doorman/delivery`, {
        apartment_id: apartment.id,
      });

      if (response.data.status === 'success') {
        toast.success(`Notificação enviada para o apartamento ${apartment.number}!`);
      } else {
        toast.error('Falha ao enviar notificação');
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.detail?.includes('Cota')) {
        toast.error('Cota de mensagens excedida! Contate o administrador.');
      } else if (error.response?.status === 400 && error.response?.data?.detail?.includes('telefone')) {
        toast.error('Nenhum telefone cadastrado para este apartamento');
      } else {
        toast.error('Erro ao registrar entrega');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Tela de confirmação
  if (selectedApartment && !sending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-600">Enviado!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Notificação WhatsApp enviada
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-slate-50 rounded-xl p-6">
              <p className="text-sm text-slate-600 mb-2">Apartamento</p>
              <p className="text-5xl font-bold text-slate-900">{selectedApartment.number}</p>
            </div>

            <Button
              onClick={handleBackToPanel}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg"
              data-testid="back-to-panel-button"
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Painel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de histórico
  if (showHistory) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                onClick={handleBackToPanel}
                className="text-slate-600"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Histórico de Entregas</h1>
              <div className="w-20"></div>
            </div>
            
            {/* Filtro de período */}
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                variant={historyDays === 1 ? 'default' : 'outline'}
                onClick={() => loadHistory(1)}
                data-testid="history-today"
              >
                Hoje
              </Button>
              <Button
                size="sm"
                variant={historyDays === 7 ? 'default' : 'outline'}
                onClick={() => loadHistory(7)}
                data-testid="history-7days"
              >
                7 dias
              </Button>
              <Button
                size="sm"
                variant={historyDays === 30 ? 'default' : 'outline'}
                onClick={() => loadHistory(30)}
                data-testid="history-30days"
              >
                30 dias
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {todayDeliveries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Nenhuma entrega registrada no período</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-50 p-3 rounded-lg mb-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Total: {todayDeliveries.length} entrega(s) nos últimos {historyDays === 1 ? 'hoje' : `${historyDays} dias`}
                </p>
              </div>
              
              {todayDeliveries.map((delivery) => (
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
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Data/Hora</p>
                            <p className="font-medium">
                              {new Date(delivery.timestamp).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Telefones</p>
                            <p className="font-medium">{delivery.phones_notified.length} notificado(s)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Painel principal - Grid de apartamentos
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Work Sans, sans-serif' }}>
                {building?.name}
              </h1>
              <p className="text-sm text-slate-600">Bem-vindo, {user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadHistory}
                className="h-10"
                data-testid="history-button"
              >
                <History className="w-5 h-5 mr-2" />
                Histórico
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="logout-button"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-emerald-900 mb-1">Registrar Encomenda</h3>
                <p className="text-sm text-emerald-700">
                  Clique no botão do apartamento para registrar a chegada de uma encomenda.
                  Uma notificação WhatsApp será enviada automaticamente para todos os moradores cadastrados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Apartamentos */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {apartments.map((apartment) => (
            <Button
              key={apartment.id}
              onClick={() => handleApartmentClick(apartment)}
              disabled={sending}
              className="h-20 text-2xl font-bold bg-white hover:bg-emerald-600 hover:text-white text-slate-900 border-2 border-slate-200 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200"
              data-testid={`apartment-button-${apartment.number}`}
            >
              {apartment.number}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoormanPanel;
