import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Phone, CheckCircle, Bell } from 'lucide-react';
import { colors } from '../theme';
import ContactButton from '../components/ContactButton';

const PublicRegistration = () => {
  const [registrationCode, setRegistrationCode] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
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
      // Não exibir erro aqui
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
        email: email,
        password: password,
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
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: colors.lightGray }}
      >
        <Card 
          className="max-w-md w-full shadow-2xl"
          style={{ borderWidth: '3px', borderColor: colors.yellow }}
        >
          <CardHeader className="text-center pb-6" style={{ backgroundColor: colors.white }}>
            <div 
              className="mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.yellow }}
            >
              <CheckCircle className="w-16 h-16" style={{ color: colors.black }} />
            </div>
            <CardTitle 
              className="text-3xl font-bold"
              style={{ color: colors.black }}
            >
              Cadastro Concluído!
            </CardTitle>
            <CardDescription className="text-lg mt-2" style={{ color: colors.grayMetal }}>
              Você receberá avisos via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4" style={{ backgroundColor: colors.white }}>
            <div 
              className="rounded-xl p-6"
              style={{ backgroundColor: colors.lightGray }}
            >
              <p className="text-sm mb-1" style={{ color: colors.grayMetal }}>Prédio</p>
              <p className="text-xl font-bold" style={{ color: colors.black }}>{buildingName}</p>
              <p className="text-sm mt-3 mb-1" style={{ color: colors.grayMetal }}>Apartamento</p>
              <p className="text-3xl font-bold" style={{ color: colors.black }}>{apartmentNumber}</p>
              <p className="text-sm mt-3 mb-1" style={{ color: colors.grayMetal }}>WhatsApp</p>
              <p className="text-lg font-bold" style={{ color: colors.black }}>{whatsapp}</p>
            </div>

            <div 
              className="rounded-xl p-5"
              style={{ backgroundColor: colors.yellow }}
            >
              <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: colors.black }} />
              <p className="font-semibold" style={{ color: colors.black }}>
                🎉 Tudo pronto!
              </p>
              <p className="text-sm mt-2" style={{ color: colors.darkGray }}>
                Sempre que uma encomenda chegar, você receberá uma notificação automática no WhatsApp cadastrado.
              </p>
            </div>

            <div 
              className="rounded-xl p-4 border-2"
              style={{ borderColor: colors.techTeal, backgroundColor: 'rgba(0, 226, 198, 0.05)' }}
            >
              <p className="text-xs" style={{ color: colors.grayMetal }}>
                💡 <strong>Dica:</strong> Mantenha suas notificações do WhatsApp ativadas para não perder nenhum aviso!
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Botão Fale Conosco */}
        <ContactButton variant="fixed" />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: colors.lightGray }}
    >
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4 bg-white p-4 rounded-xl shadow-lg">
            <img 
              src="/logo-chegouaqui.png" 
              alt="ChegouAqui" 
              className="h-40 w-auto"
            />
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: colors.black }}
          >
            Cadastro de Morador
          </h1>
          {buildingName && (
            <p 
              className="text-xl font-semibold"
              style={{ color: colors.yellow }}
            >
              {buildingName}
            </p>
          )}
          <p className="mt-2" style={{ color: colors.grayMetal }}>
            Receba avisos automáticos de encomendas
          </p>
        </div>

        {/* Card de Cadastro */}
        <Card 
          className="shadow-2xl"
          style={{ borderWidth: '3px', borderColor: colors.yellow }}
        >
          <CardHeader style={{ backgroundColor: colors.white }}>
            <CardTitle style={{ color: colors.black }}>Cadastre seu WhatsApp</CardTitle>
            <CardDescription style={{ color: colors.grayMetal }}>
              Preencha os dados abaixo para começar a receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent style={{ backgroundColor: colors.white }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Código do Prédio */}
              <div className="space-y-2">
                <Label htmlFor="code" style={{ color: colors.black }}>Código do Prédio</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: ABC123"
                  value={registrationCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setRegistrationCode(code);
                    if (code.length >= 6) verifyCode(code);
                  }}
                  required
                  maxLength={10}
                  className="text-center text-lg font-mono"
                  style={{ borderColor: colors.grayMetal }}
                />
              </div>

              {/* Número do Apartamento */}
              <div className="space-y-2">
                <Label htmlFor="apartment" style={{ color: colors.black }}>Apartamento</Label>
                <Input
                  id="apartment"
                  type="text"
                  placeholder="Ex: 101, 201, A1"
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(e.target.value)}
                  required
                  className="text-center text-lg font-semibold"
                  style={{ borderColor: colors.grayMetal }}
                />
              </div>

              {/* Nome (Opcional) */}
              <div className="space-y-2">
                <Label htmlFor="name" style={{ color: colors.black }}>
                  Seu Nome <span className="text-sm" style={{ color: colors.grayMetal }}>(opcional)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderColor: colors.grayMetal }}
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" style={{ color: colors.black }}>Telefone</Label>
                <div className="relative">
                  <Phone 
                    className="absolute left-3 top-3 h-5 w-5" 
                    style={{ color: colors.grayMetal }}
                  />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    className="pl-10"
                    style={{ borderColor: colors.grayMetal }}
                  />
                </div>
                <p className="text-xs" style={{ color: colors.grayMetal }}>
                  Digite com DDD. Ex: (11) 99999-9999
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: colors.black }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ borderColor: colors.grayMetal }}
                />
                <p className="text-xs" style={{ color: colors.grayMetal }}>
                  Use este email para fazer login no app
                </p>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: colors.black }}>Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ borderColor: colors.grayMetal }}
                />
                <p className="text-xs" style={{ color: colors.grayMetal }}>
                  Crie uma senha para acessar suas notificações
                </p>
              </div>

              {/* Checkbox de Termos e Condições */}
              <div 
                className="flex items-start gap-3 p-4 rounded-lg border-2"
                style={{ 
                  borderColor: acceptTerms ? colors.yellow : colors.grayMetal,
                  backgroundColor: acceptTerms ? 'rgba(255, 216, 57, 0.05)' : colors.lightGray
                }}
              >
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 cursor-pointer"
                  style={{ accentColor: colors.yellow }}
                />
                <Label 
                  htmlFor="acceptTerms" 
                  className="text-sm cursor-pointer leading-relaxed"
                  style={{ color: colors.black }}
                >
                  Li e aceito os{' '}
                  <a 
                    href="/termos-e-condicoes.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                    style={{ color: colors.yellow }}
                  >
                    Termos e Condições de Uso
                  </a>
                  {' '}da plataforma ChegouAqui
                </Label>
              </div>

              {/* Botão de Cadastrar */}
              <Button
                type="submit"
                className="w-full text-lg font-bold py-6"
                disabled={loading || !acceptTerms}
                style={{
                  backgroundColor: acceptTerms ? colors.yellow : colors.grayMetal,
                  color: acceptTerms ? colors.black : colors.white,
                  cursor: acceptTerms ? 'pointer' : 'not-allowed',
                  opacity: acceptTerms ? 1 : 0.6
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                      style={{ borderColor: colors.black }}
                    />
                    Cadastrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Cadastrar
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: colors.grayMetal }}>
            © 2025 ChegouAqui. Sistema de notificação de encomendas.
          </p>
        </div>
      </div>
      
      {/* Botão Fale Conosco */}
      <ContactButton variant="fixed" />
    </div>
  );
};

export default PublicRegistration;