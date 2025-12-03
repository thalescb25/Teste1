import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCompanies, mockSystemSettings, translations } from '../mockData';
import { Building2, CheckCircle, Clock, Upload, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';

const VisitorCheckIn = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState('language'); // language -> consent -> company -> form -> upload -> waiting -> approved/denied
  const [language, setLanguage] = useState('pt');
  const [consent, setConsent] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    hostName: '',
    representingCompany: '',
    reason: '',
    companions: 0,
    document: '',
    documentImage: null,
    selfie: null
  });
  const [submittedVisitor, setSubmittedVisitor] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('waiting'); // waiting, approved, denied

  const t = translations[language];

  // Simulate document and selfie requirements from building settings
  const documentRequired = true; // from building settings
  const selfieRequired = false; // from building settings

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep('consent');
  };

  const handleConsentAccept = () => {
    if (consent) {
      setStep('company');
    } else {
      toast({
        title: language === 'pt' ? "Consentimento necessário" : "Consent required",
        description: language === 'pt' ? "Você precisa aceitar os termos para continuar." : "You need to accept the terms to continue.",
        variant: "destructive"
      });
    }
  };

  const handleCompanySelect = () => {
    if (selectedCompany) {
      setStep('form');
    } else {
      toast({
        title: language === 'pt' ? "Selecione uma empresa" : "Select a company",
        description: language === 'pt' ? "Por favor, selecione a empresa que deseja visitar." : "Please select the company you want to visit.",
        variant: "destructive"
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.hostName) {
      toast({
        title: language === 'pt' ? "Campos obrigatórios" : "Required fields",
        description: language === 'pt' ? "Por favor, preencha todos os campos obrigatórios." : "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Check if document/selfie required
    if (documentRequired || selfieRequired) {
      setStep('upload');
    } else {
      submitVisitor();
    }
  };

  const submitVisitor = () => {
    const visitor = {
      ...formData,
      companyId: selectedCompany,
      language,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setSubmittedVisitor(visitor);
    setStep('waiting');
    
    toast({
      title: language === 'pt' ? "Check-in enviado!" : "Check-in submitted!",
      description: language === 'pt' ? "Aguarde a aprovação da empresa." : "Wait for company approval.",
    });

    // Simulate approval after 5 seconds (for demo)
    setTimeout(() => {
      setApprovalStatus('approved');
      setStep('result');
    }, 5000);
  };

  const handleUploadComplete = () => {
    submitVisitor();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-blue-900 to-graphite flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <Card className="w-full max-w-2xl relative shadow-2xl border-0">
        {/* Header */}
        <CardHeader className="text-center bg-primary text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Building2 className="w-16 h-16" />
          </div>
          <CardTitle className="text-3xl font-bold">AcessaAqui</CardTitle>
          <p className="text-blue-100 mt-2">
            {language === 'pt' ? 'Faça seu check-in digital' : 'Make your digital check-in'}
          </p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Language Selection */}
          {step === 'language' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-graphite mb-2">
                  Selecione o idioma / Select language
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleLanguageSelect('pt')}
                  className="h-24 text-xl bg-primary hover:bg-blue-600"
                >
                  🇧🇷 Português
                </Button>
                <Button
                  onClick={() => handleLanguageSelect('en')}
                  className="h-24 text-xl bg-primary hover:bg-blue-600"
                >
                  🇺🇸 English
                </Button>
              </div>
            </div>
          )}

          {/* LGPD Consent */}
          {step === 'consent' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-graphite mb-4">
                  {language === 'pt' ? 'Consentimento LGPD' : 'LGPD Consent'}
                </h2>
              </div>
              <div className="bg-secondary p-6 rounded-lg text-sm text-neutral-dark leading-relaxed">
                {mockSystemSettings.lgpdText}
              </div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary rounded"
                />
                <span className="text-graphite">
                  {language === 'pt' 
                    ? 'Li e concordo com os termos de uso dos meus dados.'
                    : 'I have read and agree to the terms of use of my data.'}
                </span>
              </label>
              <Button
                onClick={handleConsentAccept}
                disabled={!consent}
                className="w-full bg-primary hover:bg-blue-600 h-14 text-lg"
              >
                {language === 'pt' ? 'Continuar' : 'Continue'}
              </Button>
            </div>
          )}

          {/* Company Selection */}
          {step === 'company' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-graphite mb-2">
                  {language === 'pt' ? 'Selecione a empresa' : 'Select the company'}
                </h2>
                <p className="text-neutral-dark">
                  {language === 'pt' ? 'Qual empresa você vai visitar?' : 'Which company will you visit?'}
                </p>
              </div>
              <div className="space-y-3">
                {mockCompanies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompany(company.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedCompany === company.id
                        ? 'border-primary bg-blue-50'
                        : 'border-neutral-medium hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-graphite">{company.name}</p>
                        <p className="text-sm text-neutral-dark">
                          {language === 'pt' ? 'Conjunto' : 'Suite'} {company.suite}
                        </p>
                      </div>
                      {selectedCompany === company.id && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <Button
                onClick={handleCompanySelect}
                disabled={!selectedCompany}
                className="w-full bg-primary hover:bg-blue-600 h-14 text-lg"
              >
                {language === 'pt' ? 'Continuar' : 'Continue'}
              </Button>
            </div>
          )}

          {/* Form */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-graphite mb-2">
                  {language === 'pt' ? 'Seus dados' : 'Your information'}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">
                    {language === 'pt' ? 'Nome completo *' : 'Full name *'}
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder={language === 'pt' ? 'Seu nome completo' : 'Your full name'}
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">
                    {language === 'pt' ? 'Quem você vai visitar? *' : 'Who will you visit? *'}
                  </label>
                  <Input
                    value={formData.hostName}
                    onChange={(e) => setFormData({...formData, hostName: e.target.value})}
                    placeholder={language === 'pt' ? 'Nome do anfitrião' : 'Host name'}
                    className="h-12"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">
                    {language === 'pt' ? 'Empresa que representa' : 'Company you represent'}
                  </label>
                  <Input
                    value={formData.representingCompany}
                    onChange={(e) => setFormData({...formData, representingCompany: e.target.value})}
                    placeholder={language === 'pt' ? 'Opcional' : 'Optional'}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">
                    {language === 'pt' ? 'Motivo da visita' : 'Reason for visit'}
                  </label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder={language === 'pt' ? 'Opcional' : 'Optional'}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-graphite mb-2 block">
                    {language === 'pt' ? 'Número de acompanhantes' : 'Number of companions'}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.companions}
                    onChange={(e) => setFormData({...formData, companions: parseInt(e.target.value) || 0})}
                    className="h-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-600 h-14 text-lg"
              >
                {language === 'pt' ? 'Continuar' : 'Continue'}
              </Button>
            </form>
          )}

          {/* Upload (if required) */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-graphite mb-2">
                  {language === 'pt' ? 'Documentos' : 'Documents'}
                </h2>
                <p className="text-neutral-dark">
                  {language === 'pt' 
                    ? 'Envie os documentos necessários'
                    : 'Upload required documents'}
                </p>
              </div>

              {documentRequired && (
                <Card className="border-2 border-neutral-medium">
                  <CardContent className="p-6 text-center">
                    <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="font-semibold text-graphite mb-2">
                      {language === 'pt' ? 'Documento de identidade' : 'ID Document'}
                    </p>
                    <Button variant="outline" className="mt-3">
                      {language === 'pt' ? 'Selecionar arquivo' : 'Select file'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {selfieRequired && (
                <Card className="border-2 border-neutral-medium">
                  <CardContent className="p-6 text-center">
                    <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
                    <p className="font-semibold text-graphite mb-2">
                      {language === 'pt' ? 'Selfie' : 'Selfie'}
                    </p>
                    <Button variant="outline" className="mt-3">
                      {language === 'pt' ? 'Tirar foto' : 'Take photo'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleUploadComplete}
                className="w-full bg-primary hover:bg-blue-600 h-14 text-lg"
              >
                {language === 'pt' ? 'Finalizar check-in' : 'Complete check-in'}
              </Button>
            </div>
          )}

          {/* Waiting for approval */}
          {step === 'waiting' && (
            <div className="text-center py-12">
              <Clock className="w-24 h-24 text-warning mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold text-graphite mb-4">
                {language === 'pt' ? 'Aguardando aprovação' : 'Waiting for approval'}
              </h2>
              <p className="text-xl text-neutral-dark">
                {language === 'pt' 
                  ? 'A empresa foi notificada. Aguarde a liberação.'
                  : 'The company has been notified. Wait for authorization.'}
              </p>
            </div>
          )}

          {/* Result */}
          {step === 'result' && (
            <div className="text-center py-12">
              {approvalStatus === 'approved' ? (
                <>
                  <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-graphite mb-4">
                    {language === 'pt' ? 'Acesso liberado!' : 'Access approved!'}
                  </h2>
                  <p className="text-xl text-neutral-dark mb-8">
                    {language === 'pt' 
                      ? 'Dirija-se à portaria para entrar.'
                      : 'Go to the front desk to enter.'}
                  </p>
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <p className="text-sm text-green-800 font-medium">
                      {language === 'pt' 
                        ? 'Apresente este código na portaria'
                        : 'Present this code at the front desk'}
                    </p>
                    <p className="text-3xl font-bold text-green-700 mt-2">
                      {Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">❌</span>
                  </div>
                  <h2 className="text-3xl font-bold text-graphite mb-4">
                    {language === 'pt' ? 'Acesso negado' : 'Access denied'}
                  </h2>
                  <p className="text-xl text-neutral-dark">
                    {language === 'pt' 
                      ? 'Entre em contato com a empresa para mais informações.'
                      : 'Contact the company for more information.'}
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitorCheckIn;
