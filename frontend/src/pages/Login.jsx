import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../mockData';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular autenticação com mock data + localStorage users
    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const allUsers = [...mockUsers, ...storedUsers];
      const user = allUsers.find(u => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        toast({
          title: "Login realizado!",
          description: `Bem-vindo, ${user.name}!`,
        });
        
        // Redirecionar baseado no papel do usuário
        switch(user.role) {
          case 'super_admin':
            navigate('/super-admin');
            break;
          case 'building_admin':
            navigate('/building-admin');
            break;
          case 'front_desk':
            navigate('/front-desk');
            break;
          case 'company_receptionist':
            navigate('/company-receptionist');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        toast({
          title: "Erro no login",
          description: "E-mail ou senha inválidos.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-blue-900 to-graphite px-4">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <Card className="w-full max-w-md relative shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_2f57b21b-9406-449a-b554-d3e9cd34f01a/artifacts/eymay9gh_Gemini_Generated_Image_dn4rd6dn4rd6dn4r.png"
              alt="AcessaAqui Logo"
              className="h-24"
            />
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-graphite">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-dark" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-neutral-medium focus:border-primary focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-graphite">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-dark" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-neutral-medium focus:border-primary focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark hover:text-graphite"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-600 text-white h-12 text-base font-semibold transition-all shadow-lg"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-medium">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">👉 Credenciais de teste:</p>
              <p className="text-xs text-blue-800 font-mono mb-1">
                Super Admin: super@acessaaqui.com.br / super123
              </p>
              <p className="text-xs text-blue-800 font-mono mb-1">
                Administrador: admin@empresarial-central.com.br / admin123
              </p>
              <p className="text-xs text-blue-800 font-mono mb-1">
                Portaria: portaria@empresarial-central.com.br / portaria123
              </p>
              <p className="text-xs text-blue-800 font-mono">
                Recepcionista: recepcao@techsolutions.com.br / recepcao123
              </p>
            </div>
          </div>

          <div className="mt-6 text-center space-y-3">
            <div>
              <button
                onClick={() => navigate('/visitor/1')}
                className="text-primary hover:text-blue-600 font-semibold text-base transition-colors"
              >
                🚶 Testar Jornada do Visitante (QR Code)
              </button>
            </div>
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-green-600 font-medium text-sm transition-colors"
              >
                ← Voltar para o site
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
