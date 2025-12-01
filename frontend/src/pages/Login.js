import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bell, Lock, Mail, LogIn } from 'lucide-react';
import { colors } from '../theme';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      const { user, access_token, refresh_token } = response.data;
      
      onLogin(user, { access_token, refresh_token });
      
      toast.success('Login realizado com sucesso!');
      
      if (user.role === 'super_admin') {
        navigate('/super-admin');
      } else if (user.role === 'building_admin') {
        navigate('/admin');
      } else if (user.role === 'doorman') {
        navigate('/porteiro');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: colors.lightGray }}
    >
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 bg-white p-4 rounded-2xl shadow-lg">
            <img 
              src="/logo-chegouaqui.png" 
              alt="ChegouAqui" 
              className="h-28 w-auto"
            />
          </div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: colors.black }}
          >
            ChegouAqui
          </h1>
          <p style={{ color: colors.grayMetal }}>
            Sistema de notificação de encomendas
          </p>
        </div>

        {/* Card de Login */}
        <Card 
          className="shadow-2xl"
          style={{ borderWidth: '3px', borderColor: colors.yellow }}
        >
          <CardHeader 
            className="space-y-1 pb-6"
            style={{ backgroundColor: colors.white }}
          >
            <CardTitle 
              className="text-2xl font-bold"
              style={{ color: colors.black }}
            >
              Entrar
            </CardTitle>
            <CardDescription style={{ color: colors.grayMetal }}>
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent style={{ backgroundColor: colors.white }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: colors.black }}>Email</Label>
                <div className="relative">
                  <Mail 
                    className="absolute left-3 top-3 h-5 w-5" 
                    style={{ color: colors.grayMetal }}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    style={{ borderColor: colors.grayMetal }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: colors.black }}>Senha</Label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-3 h-5 w-5" 
                    style={{ color: colors.grayMetal }}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    style={{ borderColor: colors.grayMetal }}
                  />
                </div>
              </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full text-lg font-bold py-6"
                disabled={loading}
                style={{
                  backgroundColor: colors.yellow,
                  color: colors.black,
                }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div 
                      className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                      style={{ borderColor: colors.black }}
                    />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </div>
                )}
              </Button>
            </form>

            {/* Link para Cadastro Público */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm" style={{ color: colors.grayMetal }}>
                Morador? 
                <a 
                  href="/registrar" 
                  className="font-semibold ml-1 hover:underline"
                  style={{ color: colors.yellow }}
                >
                  Cadastre seu WhatsApp aqui
                </a>
              </p>
            </div>

            {/* Credenciais de Teste */}
            <div 
              className="mt-6 p-4 rounded-lg text-xs"
              style={{ backgroundColor: colors.lightGray }}
            >
              <p className="font-semibold mb-2" style={{ color: colors.black }}>
                Credenciais de teste:
              </p>
              <p style={{ color: colors.grayMetal }}>
                <strong>Super Admin padrão:</strong> admin@chegouaqui.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: colors.grayMetal }}>
            © 2025 ChegouAqui. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;