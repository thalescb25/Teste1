import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, CheckCircle, Home } from 'lucide-react';

const PublicRegistration = () => {
  const [registrationCode, setRegistrationCode] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [buildingName, setBuildingName] = useState('');

  useEffect(() => {
    // Pegar código da URL se existir
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get('codigo');
    if (codigo) {
      setRegistrationCode(codigo.toUpperCase());
      verifyCode(codigo.toUpperCase());
    }
  }, []);

  const verifyCode = async (code) => {
    try {
      const response = await axios.get(`${API}/public/building/${code}`);
      setBuildingName(response.data.name);
    } catch (error) {
      // Não exibir erro aqui, apenas ao submeter
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/public/register`, {
        registration_code: registrationCode,
        apartment_number: apartmentNumber,
        whatsapp: whatsapp,
        name: name || undefined,
      });

      setBuildingName(response.data.building_name);
      setSuccess(true);
      toast.success('WhatsApp cadastrado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao cadastrar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4">
        <Card className="max-w-md w-full shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-600">Cadastro Concluído!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Seu WhatsApp foi cadastrado com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-slate-50 rounded-xl p-6">
              <p className="text-sm text-slate-600 mb-1">Prédio</p>
              <p className="text-xl font-bold text-slate-900">{buildingName}</p>
              <p className="text-sm text-slate-600 mt-3 mb-1">Apartamento</p>
              <p className="text-3xl font-bold text-slate-900">{apartmentNumber}</p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                Você receberá notificações WhatsApp sempre que uma encomenda chegar para seu apartamento!
              </p>
            </div>

            <Button
              onClick={() => (window.location.href = '/login')}
              variant="outline"
              className="w-full"
              data-testid="go-to-login-button"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/logo-chegouaqui.png" 
              alt="ChegouAqui Logo" 
              className="h-24 w-auto"
            />
          </div>
          <p className="text-slate-600 text-lg">Cadastre seu WhatsApp</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold">Cadastro de Morador</CardTitle>
            <CardDescription>
              Receba notificações quando suas encomendas chegarem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código do Prédio</Label>
                <Input
                  id="code"
                  value={registrationCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setRegistrationCode(code);
                    if (code.length >= 8) verifyCode(code);
                  }}
                  placeholder="Ex: ABC123XY"
                  required
                  className="h-11 uppercase"
                  data-testid="registration-code-input"
                />
                {buildingName && (
                  <p className="text-sm text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {buildingName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">Número do Apartamento</Label>
                <Input
                  id="apartment"
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(e.target.value)}
                  placeholder="Ex: 101"
                  required
                  className="h-11"
                  data-testid="apartment-number-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="h-11"
                  data-testid="whatsapp-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Seu Nome (opcional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-11"
                  data-testid="name-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                disabled={loading}
                data-testid="submit-registration-button"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : (
                  'Cadastrar WhatsApp'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-center text-slate-600">
                Funcionário do prédio?{' '}
                <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Fazer login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicRegistration;
