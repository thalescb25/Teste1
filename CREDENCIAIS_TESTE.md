# 🔑 Credenciais de Teste - ChegouAqui

## 📋 TODOS OS PERFIS - LOGIN COM EMAIL E SENHA

---

## 1️⃣ Super Admin
- **Email**: `superadmin@chegouaqui.com`
- **Senha**: `superadmin123`
- **URL**: http://0.0.0.0:3000/super-admin

---

## 2️⃣ Admin do Prédio
- **Email**: `carlos@sunset.com`
- **Senha**: `carlos123`
- **Prédio**: Edifício Sunset Residence
- **URL**: http://0.0.0.0:3000/admin

---

## 3️⃣ Porteiro
- **Email**: `joao@sunset.com`
- **Senha**: `joao123`
- **Prédio**: Edifício Sunset Residence
- **URL**: http://0.0.0.0:3000/porteiro

---

## 4️⃣ Morador (NOVO!) 🏠
- **Email**: `morador@teste.com`
- **Senha**: `morador123`
- **Apartamento**: 1
- **Prédio**: Edifício Sunset Residence
- **URL**: http://0.0.0.0:3000/morador

---

## 🧪 Como Testar o Fluxo Completo:

### 1. Cadastro de Novo Morador
1. Acesse: http://0.0.0.0:3000/registrar?codigo=33HFYMBPWU4
2. Preencha:
   - Apartamento: **2**
   - Nome: **Seu Nome**
   - Telefone: **(11) 98888-8888**
   - **Email**: **seuemail@teste.com**
   - **Senha**: **sua senha**
3. Aceite os termos
4. Clique em **Cadastrar**

### 2. Enviar Notificação (Porteiro)
1. Login como **porteiro** (joao@sunset.com)
2. Clique no **apartamento 1** (ou o que você cadastrou)
3. Notificação será criada ✅

### 3. Ver Notificação (Morador)
1. Login como **morador** (morador@teste.com)
2. Acesse: http://0.0.0.0:3000/morador
3. Veja suas notificações de encomendas
4. Marque como lida
5. Edite seu perfil

---

## ✅ Mudanças Implementadas:

### ❌ REMOVIDO:
- ~~WhatsApp/Twilio~~
- ~~Templates de mensagens~~
- ~~Envio via API externa~~

### ✅ ADICIONADO:
- **Notificações in-app** (collection `notifications`)
- **Perfil de morador** com login email/senha
- **Histórico de notificações** para morador
- **Edição de perfil** (nome e email)
- **Áreas de monetização** no app do morador

---

## 📱 Código de Registro do Prédio:

**Edifício Sunset Residence**: `33HFYMBPWU4`

Use este código para cadastrar novos moradores via:
http://0.0.0.0:3000/registrar?codigo=33HFYMBPWU4

---

## 🔄 Fluxo de Notificações:

1. **Porteiro** registra entrega → `POST /api/doorman/delivery`
2. **Backend** cria notificação → Collection `notifications`
3. **Morador** recebe notificação no app
4. **Morador** marca como lida → `PUT /api/resident/notifications/{id}/read`

---

## 💡 Notas Importantes:

- **Login**: TODOS os perfis usam **email + senha** (não mais telefone)
- **Cadastro**: Moradores precisam informar **email e senha**
- **Notificações**: In-app (não mais WhatsApp)
- **Mobile**: App Android pronto para build e teste

---

**Data**: Dezembro 2025
**Status**: ✅ Tudo funcionando
