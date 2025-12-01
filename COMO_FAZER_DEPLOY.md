# 🚀 Como Fazer Deploy do ChegouAqui

## 📋 Visão Geral

O ChegouAqui é uma aplicação full-stack composta por:
- **Backend**: FastAPI (Python)
- **Frontend**: React.js
- **Banco de Dados**: MongoDB

---

## 🎯 Opções de Deploy

### Opção 1: Deploy Nativo na Emergent (Recomendado para Testes)

A plataforma Emergent oferece deploy nativo com um clique.

**Como fazer**:
1. No chat da Emergent, digite: "fazer deploy" ou "deploy do app"
2. O sistema vai criar automaticamente:
   - Container Docker com backend e frontend
   - MongoDB configurado
   - URL pública para acesso
   - SSL/HTTPS automático

**Vantagens**:
- ✅ Mais rápido (1 clique)
- ✅ Configuração automática
- ✅ Ideal para testes e desenvolvimento

**Limitações**:
- ⚠️ Melhor para ambientes de teste/staging
- ⚠️ Para produção em larga escala, considere outras opções

---

### Opção 2: Deploy Manual em VPS/Servidor (Produção)

Para produção com controle total, você pode fazer deploy em qualquer VPS (Digital Ocean, AWS, etc).

#### Requisitos do Servidor
- **Sistema**: Ubuntu 20.04+ ou similar
- **RAM**: Mínimo 2GB (4GB recomendado)
- **CPU**: 2 cores
- **Disco**: 20GB
- **Software**: Docker e Docker Compose

---

## 📦 Guia Passo a Passo - Deploy Manual

### 1. Preparar o Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

### 2. Clonar o Código

Se você salvou o código no GitHub:
```bash
git clone https://github.com/seu-usuario/chegouaqui.git
cd chegouaqui
```

**OU** se não tem GitHub, copie os arquivos manualmente via SCP/SFTP.

### 3. Criar Arquivo docker-compose.yml

Crie na raiz do projeto:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: chegouaqui-mongo
    restart: always
    environment:
      MONGO_INITDB_DATABASE: chegouaqui
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: chegouaqui-backend
    restart: always
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=chegouaqui
      - JWT_SECRET=seu_jwt_secret_super_seguro_aqui
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_WHATSAPP_NUMBER=${TWILIO_WHATSAPP_NUMBER}
    depends_on:
      - mongodb
    ports:
      - "8001:8001"

  frontend:
    build: ./frontend
    container_name: chegouaqui-frontend
    restart: always
    environment:
      - REACT_APP_BACKEND_URL=https://seu-dominio.com
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### 4. Criar Dockerfiles

**Backend Dockerfile** (`/backend/Dockerfile`):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copiar requirements e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Expor porta
EXPOSE 8001

# Comando de inicialização
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Frontend Dockerfile** (`/frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copiar código e fazer build
COPY . .
RUN yarn build

# Stage 2: Servir com nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Config** (`/frontend/nginx.conf`):
```nginx
server {
    listen 3000;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz:
```bash
# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# JWT
JWT_SECRET=gere_uma_string_aleatoria_segura_aqui
```

### 6. Fazer Build e Iniciar

```bash
# Build das imagens
docker-compose build

# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 7. Configurar Domínio e SSL

**Instalar Nginx como Reverse Proxy**:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

**Configurar Nginx** (`/etc/nginx/sites-available/chegouaqui`):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Ativar site e gerar SSL**:
```bash
sudo ln -s /etc/nginx/sites-available/chegouaqui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Gerar certificado SSL gratuito
sudo certbot --nginx -d seu-dominio.com
```

---

## 🔄 Atualizar a Aplicação

```bash
# Parar containers
docker-compose down

# Puxar código atualizado
git pull origin main

# Rebuild e reiniciar
docker-compose build
docker-compose up -d
```

---

## 📊 Monitoramento

**Ver logs em tempo real**:
```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

**Ver status dos containers**:
```bash
docker-compose ps
```

---

## 🛡️ Segurança

### Checklist de Segurança para Produção:

- [ ] Alterar JWT_SECRET para valor único e seguro
- [ ] Configurar firewall (UFW):
  ```bash
  sudo ufw allow 22/tcp  # SSH
  sudo ufw allow 80/tcp  # HTTP
  sudo ufw allow 443/tcp # HTTPS
  sudo ufw enable
  ```
- [ ] Configurar SSL/HTTPS via Certbot
- [ ] Fazer backup regular do MongoDB
- [ ] Usar variáveis de ambiente (não hardcode)
- [ ] Configurar MongoDB com autenticação
- [ ] Limitar tentativas de login
- [ ] Implementar rate limiting no backend

---

## 💾 Backup do Banco de Dados

**Fazer backup**:
```bash
docker exec chegouaqui-mongo mongodump --out /backup --db chegouaqui
docker cp chegouaqui-mongo:/backup ./backup-$(date +%Y%m%d)
```

**Restaurar backup**:
```bash
docker cp ./backup-20250101 chegouaqui-mongo:/backup
docker exec chegouaqui-mongo mongorestore /backup/chegouaqui --db chegouaqui
```

---

## 🚨 Solução de Problemas

### Backend não inicia
```bash
# Ver logs
docker-compose logs backend

# Verificar variáveis de ambiente
docker-compose config
```

### Frontend não carrega
```bash
# Verificar build
docker-compose logs frontend

# Testar conexão com backend
curl http://localhost:8001/api/health
```

### MongoDB não conecta
```bash
# Verificar se está rodando
docker-compose ps mongodb

# Ver logs
docker-compose logs mongodb
```

---

## 📞 Suporte

- **Documentação completa**: `/app/README_CHEGOUAQUI.md`
- **API Docs**: `/app/API_DOCUMENTATION.md`
- **Guia WhatsApp**: `/app/COMO_TESTAR_WHATSAPP.md`

---

## 🎉 Resumo de Comandos Rápidos

```bash
# Deploy completo do zero
git clone <seu-repo>
cd chegouaqui
docker-compose build
docker-compose up -d

# Atualizar aplicação
docker-compose down
git pull
docker-compose build
docker-compose up -d

# Ver logs
docker-compose logs -f

# Backup
docker exec chegouaqui-mongo mongodump --out /backup

# Reiniciar tudo
docker-compose restart
```

---

## ✅ Pronto para Produção!

Depois de seguir este guia:
1. ✅ Aplicação estará rodando em seu servidor
2. ✅ SSL/HTTPS configurado
3. ✅ MongoDB com backups automáticos
4. ✅ Monitoramento ativo
5. ✅ Pronto para receber usuários!

**URL de acesso**: https://seu-dominio.com
