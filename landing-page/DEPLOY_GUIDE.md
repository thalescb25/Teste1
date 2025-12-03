# Guia de Deploy - Landing Page ChegouAqui

## 📁 Estrutura de Arquivos

```
/app/landing-page/
├── index.html          # Landing page principal
├── css/
│   └── styles.css      # Estilos com identidade visual
├── js/
│   └── script.js       # JavaScript para formulário e animações
├── images/
│   ├── hero-building.jpg           # Imagem hero (2.5MB)
│   ├── resident-happy.jpg          # Imagem benefícios (640KB)
│   └── doorman-professional.jpg    # Imagem processo (648KB)
└── serve.py            # Servidor de desenvolvimento
```

## 🎨 Identidade Visual

A landing page utiliza as cores da marca ChegouAqui:
- **Amarelo Primário:** #FFD839 (botões e destaques)
- **Preto:** #2A2A2A (textos e títulos)
- **Cinza Metal:** #9A9A9A (textos secundários)
- **Teal:** #00E2C6 (acentos e ícones)
- **Branco/Cinza Claro:** Backgrounds

## 🚀 Opções de Deploy

### Opção 1: Servidor Estático (Recomendado para Produção)

A landing page pode ser servida como arquivos estáticos por qualquer servidor web:

#### Nginx
```nginx
server {
    listen 80;
    server_name www.chegouaqui.com chegouaqui.com;
    
    root /app/landing-page;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache de imagens
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName chegouaqui.com
    ServerAlias www.chegouaqui.com
    DocumentRoot /app/landing-page
    
    <Directory /app/landing-page>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Cache de assets
    <FilesMatch "\.(jpg|jpeg|png|gif|js|css)$">
        Header set Cache-Control "max-age=2592000, public"
    </FilesMatch>
</VirtualHost>
```

### Opção 2: CDN (Melhor Performance)

1. **Upload para CDN:**
   - Fazer upload de todos os arquivos para um bucket S3/CloudFront/Netlify/Vercel
   - Configurar domínio customizado

2. **Atualizar API URL:**
   Em `js/script.js`, trocar:
   ```javascript
   const API_URL = 'http://localhost:8001/api';
   ```
   Por:
   ```javascript
   const API_URL = 'https://api.chegouaqui.com/api'; // Seu domínio de produção
   ```

### Opção 3: Integrar ao App Principal

Copiar a landing page para dentro do frontend React:

```bash
# Criar pasta public/landing no frontend
mkdir -p /app/frontend/public/landing

# Copiar arquivos
cp -r /app/landing-page/* /app/frontend/public/landing/

# Configurar rota no React Router
# Em App.js, adicionar rota que serve o HTML estático
```

## 🔧 Configuração da API

### Backend Endpoint

O endpoint `/api/leads` já está implementado em `/app/backend/server.py`:

```python
@api_router.post("/api/leads", response_model=dict)
async def create_lead(lead: LeadCreate):
    # Salva lead no MongoDB
    # Retorna mensagem de sucesso
```

### CORS

Se a landing page estiver em domínio diferente do backend, configure CORS:

```python
# Em /app/backend/server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.chegouaqui.com", "https://chegouaqui.com"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
```

### Variáveis de Ambiente

Atualizar `/app/backend/.env`:
```env
CORS_ORIGINS=https://chegouaqui.com,https://www.chegouaqui.com
```

## 📊 Monitoramento de Leads

### Visualizar Leads pelo Super Admin

Os super admins podem acessar todos os leads via:
```
GET /api/leads
Authorization: Bearer <super_admin_token>
```

### Consulta Direta no MongoDB

```javascript
db.leads.find().sort({created_at: -1}).limit(10)
```

### Script Python para Relatório

```python
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def get_leads_report():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.chegouaqui_db
    
    total = await db.leads.count_documents({})
    new = await db.leads.count_documents({"status": "new"})
    contacted = await db.leads.count_documents({"status": "contacted"})
    converted = await db.leads.count_documents({"status": "converted"})
    
    print(f"Total: {total}")
    print(f"Novos: {new}")
    print(f"Contatados: {contacted}")
    print(f"Convertidos: {converted}")
```

## ⚡ Otimizações

### 1. Comprimir Imagens

```bash
# Instalar imagemagick
apt-get install imagemagick

# Comprimir imagens
cd /app/landing-page/images
for img in *.jpg; do
    convert "$img" -quality 85 -strip "optimized-$img"
done
```

### 2. Minificar CSS e JS

```bash
# Instalar minificadores
npm install -g uglifycss uglify-js

# Minificar
uglifycss css/styles.css > css/styles.min.css
uglifyjs js/script.js -o js/script.min.js -c -m
```

Atualizar `index.html`:
```html
<link rel="stylesheet" href="css/styles.min.css">
<script src="js/script.min.js"></script>
```

### 3. Adicionar Service Worker (PWA)

Criar `/app/landing-page/sw.js`:
```javascript
const CACHE_NAME = 'chegouaqui-v1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/script.js',
  '/images/hero-building.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 📱 Teste Mobile

```bash
# Testar responsividade
curl -A "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  http://localhost:8080 > /dev/null
```

## 🔍 SEO Checklist

- ✅ Meta tags otimizadas
- ✅ Schema.org structured data
- ✅ Open Graph tags para redes sociais
- ✅ Títulos e descrições únicos
- ✅ Alt text em todas as imagens
- ✅ URLs amigáveis
- ✅ Sitemap.xml (criar manualmente)
- ✅ Robots.txt (criar manualmente)

### Criar Sitemap

Criar `/app/landing-page/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chegouaqui.com/</loc>
    <lastmod>2025-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>
```

### Criar Robots.txt

Criar `/app/landing-page/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://chegouaqui.com/sitemap.xml
```

## 📧 Integração com Email

### Adicionar Notificação por Email

Em `/app/backend/server.py`, adicionar envio de email ao criar lead:

```python
import smtplib
from email.mime.text import MIMEText

@api_router.post("/api/leads")
async def create_lead(lead: LeadCreate):
    # ... salvar no banco ...
    
    # Enviar notificação por email
    msg = MIMEText(f"""
    Novo lead capturado!
    
    Nome: {lead.name}
    Email: {lead.email}
    Telefone: {lead.phone}
    Condomínio: {lead.building_name}
    Mensagem: {lead.message}
    """)
    
    msg['Subject'] = f'Novo Lead: {lead.building_name}'
    msg['From'] = 'noreply@chegouaqui.com'
    msg['To'] = 'neuraone.ai@gmail.com'
    
    # Enviar via SMTP
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('seu@email.com', 'senha')
        server.send_message(msg)
```

## 🧪 Testes

### Teste Manual

1. Acessar http://localhost:8080
2. Preencher formulário
3. Verificar mensagem de sucesso
4. Confirmar lead no banco de dados

### Teste Automatizado

```bash
# Testar endpoint de leads
curl -X POST http://localhost:8001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "phone": "11999999999",
    "building_name": "Teste Building"
  }'
```

## 📈 Analytics

### Google Analytics

Adicionar no `<head>` do `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🆘 Troubleshooting

### Formulário não envia

1. Verificar console do navegador (F12)
2. Conferir se backend está rodando na porta 8001
3. Validar CORS no backend
4. Verificar URL da API em `js/script.js`

### Imagens não carregam

1. Verificar permissões: `chmod 644 images/*`
2. Conferir paths no HTML
3. Validar servidor web está servindo arquivos estáticos

### Erro 500 no backend

1. Checar logs: `tail -f /var/log/supervisor/backend.*.log`
2. Verificar MongoDB está rodando
3. Validar schema do modelo Lead

## 📞 Suporte

Para dúvidas ou problemas:
- Email: neuraone.ai@gmail.com
- Backend logs: `/var/log/supervisor/backend.*.log`
- Frontend: Console do navegador (F12)
