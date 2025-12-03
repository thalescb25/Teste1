import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { KeyRound, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await api.post('/newsletter/subscribe', { email });
      if (response.data.success) {
        toast({
          title: "Inscrição realizada!",
          description: "Você receberá nossas novidades em breve.",
        });
        setEmail('');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Não foi possível realizar a inscrição.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Receba nossas novidades</h3>
              <p className="text-gray-400">Fique por dentro das últimas atualizações e recursos</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 focus:border-green-500 min-w-[280px]"
                required
              />
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 whitespace-nowrap"
              >
                <Send className="w-4 h-4 mr-2" />
                Cadastrar
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <KeyRound className="w-8 h-8 text-green-500" />
              <span className="text-xl font-bold text-white">AccessControl</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Solução completa de controle de acesso digital para condomínios comerciais padrão B.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/solucao" className="text-gray-400 hover:text-green-500 transition-colors text-sm">A Solução</Link></li>
              <li><Link to="/segmentos" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Segmentos</Link></li>
              <li><Link to="/depoimentos" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Depoimentos</Link></li>
              <li><Link to="/contato" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Contato</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Portal</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Controle de Acesso</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Reconhecimento Facial</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">QR Code</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">Portal Web</a></li>
              <li><a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">App Mobile</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">São Paulo, SP<br />Brasil</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">(11) 3000-0000</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm">contato@accesscontrol.com.br</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 AccessControl. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacidade" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="text-gray-400 hover:text-green-500 text-sm transition-colors">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
