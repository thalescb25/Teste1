// Mock data for AcessaAqui - Building Visitor Management Platform

// ========== BUILDINGS ==========
export const mockBuildings = [
  {
    id: '1',
    name: 'Edifício Empresarial Central',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3000-1000',
    cnpj: '00.111.222/0001-33',
    sindicoName: 'José Silva',
    sindicoEmail: 'sindico@empresarial-central.com.br',
    sindicoPhone: '(11) 99999-1111',
    plan: 'business',
    maxSuites: 50,
    currentSuites: 35,
    status: 'active',
    documentRequired: true,
    selfieRequired: false,
    defaultLanguage: 'pt',
    monthlyRevenue: 249,
    createdAt: '2024-01-15',
    adminEmail: 'admin@empresarial-central.com.br'
  },
  {
    id: '2',
    name: 'Torre Business Park',
    address: 'Rua Vergueiro, 2500',
    city: 'São Paulo',
    state: 'SP',
    plan: 'start',
    maxSuites: 20,
    currentSuites: 15,
    status: 'active',
    documentRequired: false,
    selfieRequired: false,
    defaultLanguage: 'pt',
    monthlyRevenue: 149,
    createdAt: '2024-02-10',
    adminEmail: 'admin@torrebusiness.com.br'
  },
  {
    id: '3',
    name: 'Centro Corporativo Faria Lima',
    address: 'Av. Faria Lima, 3000',
    city: 'São Paulo',
    state: 'SP',
    plan: 'corporate',
    maxSuites: 100,
    currentSuites: 75,
    status: 'active',
    documentRequired: true,
    selfieRequired: true,
    defaultLanguage: 'pt',
    monthlyRevenue: 399,
    createdAt: '2023-11-20',
    adminEmail: 'admin@farialima.com.br'
  }
];

// ========== PRICING PLANS ==========
export const mockPlans = [
  {
    id: 'start',
    name: 'Start',
    minSuites: 1,
    maxSuites: 20,
    monthlyPrice: 149,
    active: true,
    description: 'Ideal para prédios pequenos'
  },
  {
    id: 'business',
    name: 'Business',
    minSuites: 21,
    maxSuites: 50,
    monthlyPrice: 249,
    active: true,
    description: 'Para prédios de médio porte'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    minSuites: 51,
    maxSuites: 100,
    monthlyPrice: 399,
    active: true,
    description: 'Para grandes empreendimentos'
  }
];

// ========== COMPANIES ==========
export const mockCompanies = [
  {
    id: '1',
    buildingId: '1',
    name: 'Tech Solutions Ltda',
    suite: '501',
    phone: '(11) 3333-4444',
    cnpj: '12.345.678/0001-90',
    status: 'active',
    receptionists: ['rec1', 'rec2']
  },
  {
    id: '2',
    buildingId: '1',
    name: 'Marketing Pro',
    suite: '502',
    phone: '(11) 3333-5555',
    cnpj: '98.765.432/0001-10',
    status: 'active',
    receptionists: ['rec3']
  },
  {
    id: '3',
    buildingId: '1',
    name: 'Consultoria ABC',
    suite: '503',
    phone: '(11) 3333-6666',
    cnpj: '11.222.333/0001-44',
    status: 'active',
    receptionists: ['rec4']
  }
];

// ========== USERS ==========
export const mockUsers = [
  {
    id: 'super1',
    email: 'super@acessaaqui.com.br',
    password: 'super123',
    name: 'Super Admin',
    role: 'super_admin'
  },
  {
    id: 'admin1',
    email: 'admin@empresarial-central.com.br',
    password: 'admin123',
    name: 'Carlos Silva',
    role: 'building_admin',
    buildingId: '1'
  },
  {
    id: 'portaria1',
    email: 'portaria@empresarial-central.com.br',
    password: 'portaria123',
    name: 'João Porteiro',
    role: 'front_desk',
    buildingId: '1'
  },
  {
    id: 'rec1',
    email: 'recepcao@techsolutions.com.br',
    password: 'recepcao123',
    name: 'Maria Recepcionista',
    role: 'company_receptionist',
    buildingId: '1',
    companyId: '1'
  }
];

// ========== VISITORS ==========
export const mockVisitors = [
  {
    id: 'v1',
    buildingId: '1',
    companyId: '1',
    fullName: 'João Santos',
    email: 'joao@email.com',
    phone: '(11) 98888-7777',
    hostName: 'Carlos Mendes',
    representingCompany: 'Fornecedor XYZ',
    reason: 'Reunião comercial',
    companions: 2,
    companionsDetails: [],
    document: '123.456.789-00',
    documentImage: null,
    selfie: null,
    serviceProvider: false,
    status: 'pending',
    checkInTime: null,
    checkOutTime: null,
    notes: '',
    createdAt: '2024-12-02T14:30:00',
    language: 'pt'
  },
  {
    id: 'v2',
    buildingId: '1',
    companyId: '2',
    fullName: 'Ana Paula Costa',
    email: 'ana@email.com',
    phone: '(11) 97777-6666',
    hostName: 'Roberto Lima',
    representingCompany: 'Agência ABC',
    reason: 'Apresentação de proposta',
    companions: 0,
    companionsDetails: [],
    document: '987.654.321-00',
    documentImage: null,
    selfie: null,
    serviceProvider: false,
    status: 'approved',
    checkInTime: '2024-12-02T10:00:00',
    checkOutTime: null,
    notes: '',
    createdAt: '2024-12-02T09:45:00',
    language: 'pt'
  },
  {
    id: 'v3',
    buildingId: '1',
    companyId: '1',
    fullName: 'Pedro Oliveira',
    email: 'pedro@email.com',
    phone: '(11) 96666-5555',
    hostName: 'Amanda Souza',
    representingCompany: '',
    reason: 'Entrevista',
    companions: 0,
    companionsDetails: [],
    document: '456.789.123-00',
    documentImage: null,
    selfie: null,
    serviceProvider: true,
    status: 'checked_out',
    checkInTime: '2024-12-01T14:00:00',
    checkOutTime: '2024-12-01T16:30:00',
    notes: 'Visitante regular',
    createdAt: '2024-12-01T13:45:00',
    language: 'pt'
  }
];

// ========== FINANCIAL METRICS ==========
export const mockFinancialMetrics = {
  mrr: 12547,
  arr: 150564,
  netNewMRR: 1200,
  churn: 2.3,
  newBuildingsThisMonth: 5,
  totalBuildings: 47,
  buildingsByPlan: {
    start: 20,
    business: 18,
    corporate: 9
  },
  mrrEvolution: [
    { month: 'Jan', value: 8900 },
    { month: 'Fev', value: 9500 },
    { month: 'Mar', value: 10200 },
    { month: 'Abr', value: 10800 },
    { month: 'Mai', value: 11100 },
    { month: 'Jun', value: 11500 },
    { month: 'Jul', value: 11800 },
    { month: 'Ago', value: 12000 },
    { month: 'Set', value: 12200 },
    { month: 'Out', value: 12400 },
    { month: 'Nov', value: 12500 },
    { month: 'Dez', value: 12547 }
  ],
  forecast: [
    { month: 'Jan 25', value: 13000 },
    { month: 'Fev 25', value: 13500 },
    { month: 'Mar 25', value: 14200 },
    { month: 'Abr 25', value: 15000 },
    { month: 'Mai 25', value: 15800 },
    { month: 'Jun 25', value: 16500 },
    { month: 'Jul 25', value: 17200 },
    { month: 'Ago 25', value: 18000 },
    { month: 'Set 25', value: 18800 },
    { month: 'Out 25', value: 19500 },
    { month: 'Nov 25', value: 20200 },
    { month: 'Dez 25', value: 21000 }
  ]
};

// ========== SYSTEM SETTINGS ==========
export const mockSystemSettings = {
  supportEmail: 'neuraone.ai@gmail.com',
  brandName: 'AcessaAqui',
  brandSlogan: 'Acesso rápido, seguro e digital. Aqui.',
  lgpdText: 'Ao prosseguir, você concorda com o uso dos seus dados exclusivamente para controle de acesso ao prédio, conforme a LGPD. Solicite exclusão pelo e-mail: neuraone.ai@gmail.com',
  lgpdTextEn: 'By proceeding, you agree to the use of your data exclusively for building access control, in accordance with LGPD (Brazilian Data Protection Law). Request deletion via email: neuraone.ai@gmail.com',
  emailTemplates: {
    visitorArrival: {
      subject: 'Chegada do visitante [visitorName] - AcessaAqui',
      body: '[visitorName] chegou para uma visita com [hostName] e aguarda autorização.\n\nRepresentando: [representingCompany]\nMotivo: [reason]\nAcompanhantes: [companions]'
    }
  }
};

// ========== TRANSLATIONS ==========
export const translations = {
  pt: {
    welcome: 'Bem-vindo',
    checkIn: 'Check-in Digital',
    submit: 'Enviar',
    approve: 'Aprovar',
    deny: 'Recusar',
    pending: 'Pendente',
    approved: 'Aprovado',
    denied: 'Recusado',
    checkedOut: 'Finalizado'
  },
  en: {
    welcome: 'Welcome',
    checkIn: 'Digital Check-in',
    submit: 'Submit',
    approve: 'Approve',
    deny: 'Deny',
    pending: 'Pending',
    approved: 'Approved',
    denied: 'Denied',
    checkedOut: 'Checked Out'
  }
};
