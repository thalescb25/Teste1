# ChegouAqui - API Documentation

## Base URL
```
https://chegou-aqui.preview.emergentagent.com/api
```

## Autenticação

Todos os endpoints protegidos requerem JWT token no header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Auth Endpoints

### POST /auth/login
Login de usuário (todos os roles)

**Request:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAi...",
  "refresh_token": "eyJ0eXAi...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome Usuário",
    "role": "doorman",
    "building_id": "uuid",
    "active": true
  }
}
```

### GET /auth/me
Retorna dados do usuário autenticado

**Headers:** `Authorization: Bearer <token>`

**Response:** `User` object

---

## 👑 Super Admin Endpoints

### POST /super-admin/buildings
Criar novo prédio (super_admin only)

**Request:**
```json
{
  "name": "Edifício Example",
  "admin_name": "Admin Nome",
  "admin_email": "admin@exemplo.com",
  "admin_password": "senha123",
  "num_apartments": 20,
  "plan": "basic"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Edifício Example",
  "registration_code": "ABC123XY",
  "num_apartments": 20,
  "plan": "basic",
  "message_quota": 500,
  "messages_used": 0,
  "active": true,
  "custom_message": null,
  "created_at": "2025-11-30T15:00:00Z"
}
```

### GET /super-admin/buildings
Listar todos os prédios (super_admin only)

**Response:** `Building[]`

### PUT /super-admin/buildings/{building_id}
Atualizar prédio (super_admin only)

**Request:**
```json
{
  "name": "Novo Nome",
  "plan": "premium",
  "active": false,
  "custom_message": "Mensagem customizada"
}
```

**Response:** `Building`

### DELETE /super-admin/buildings/{building_id}
Deletar prédio e todos os dados relacionados (super_admin only)

**Response:**
```json
{
  "message": "Prédio deletado com sucesso"
}
```

**Nota:** Esta ação deleta permanentemente:
- O prédio
- Todos os usuários (admins e porteiros)
- Todos os apartamentos
- Todos os telefones cadastrados
- Histórico de entregas e logs WhatsApp

### GET /super-admin/stats
Estatísticas globais da plataforma

**Response:**
```json
{
  "total_buildings": 4,
  "active_buildings": 4,
  "total_deliveries": 15,
  "today_deliveries": 3
}
```

---

## 🏢 Building Admin Endpoints

### GET /admin/building
Obter dados do prédio atual (building_admin, doorman)

**Response:** `Building`

### PUT /admin/building/message
Atualizar mensagem WhatsApp personalizada (building_admin only)

**Query Params:**
- `message` (string): Nova mensagem. Use `[numero]` para inserir número do apartamento

**Response:**
```json
{
  "message": "Mensagem atualizada com sucesso"
}
```

### POST /admin/users
Criar novo usuário (porteiro ou admin) (building_admin only)

**Request:**
```json
{
  "name": "João Porteiro",
  "email": "joao@exemplo.com",
  "password": "senha123",
  "role": "doorman"
}
```

**Response:** `User`

### GET /admin/users
Listar usuários do prédio (building_admin only)

**Response:** `User[]`

### GET /admin/apartments
Listar apartamentos do prédio (building_admin, doorman)

**Response:**
```json
[
  {
    "id": "uuid",
    "number": "101",
    "building_id": "uuid",
    "created_at": "2025-11-30T15:00:00Z"
  }
]
```

### POST /admin/apartments/{apartment_id}/phones
Adicionar telefone WhatsApp a um apartamento (building_admin only)

**Request:**
```json
{
  "apartment_id": "uuid",
  "whatsapp": "(11) 99999-9999",
  "name": "João Silva"
}
```

**Response:** `ResidentPhone`

### GET /admin/apartments/{apartment_id}/phones
Listar telefones de um apartamento (building_admin, doorman)

**Response:**
```json
[
  {
    "id": "uuid",
    "apartment_id": "uuid",
    "whatsapp": "(11) 99999-9999",
    "name": "João Silva",
    "created_at": "2025-11-30T15:00:00Z"
  }
]
```

### DELETE /admin/phones/{phone_id}
Remover telefone (building_admin only)

**Response:**
```json
{
  "message": "Telefone removido com sucesso"
}
```

### GET /admin/deliveries
Histórico de entregas do prédio (building_admin only)

**Response:**
```json
[
  {
    "id": "uuid",
    "apartment_id": "uuid",
    "apartment_number": "101",
    "building_id": "uuid",
    "doorman_id": "uuid",
    "doorman_name": "João Porteiro",
    "timestamp": "2025-11-30T15:00:00Z",
    "status": "success",
    "phones_notified": [
      "(11) 99999-9999",
      "(11) 88888-8888"
    ]
  }
]
```

### GET /admin/all-phones
Lista consolidada de todos os telefones cadastrados no prédio (building_admin only)

**Response:**
```json
[
  {
    "id": "uuid",
    "apartment_id": "uuid",
    "apartment_number": "101",
    "whatsapp": "(11) 99999-9999",
    "name": "Maria Silva",
    "created_at": "2025-11-30T15:00:00Z"
  }
]
```

**Nota:** Retorna todos os telefones de todos os apartamentos, ordenados por número do apartamento.

---

## 🚪 Doorman Endpoints

### POST /doorman/delivery
Registrar entrega e enviar notificações WhatsApp (doorman only)

**Request:**
```json
{
  "apartment_id": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "apartment_id": "uuid",
  "apartment_number": "101",
  "building_id": "uuid",
  "doorman_id": "uuid",
  "doorman_name": "João Porteiro",
  "timestamp": "2025-11-30T15:00:00Z",
  "status": "success",
  "phones_notified": [
    "(11) 99999-9999"
  ]
}
```

**Erros:**
- `400`: Nenhum telefone cadastrado para o apartamento
- `403`: Cota de mensagens excedida
- `404`: Apartamento não encontrado

### GET /doorman/deliveries/today
Entregas registradas hoje (doorman only)

**Response:** `Delivery[]` (apenas do dia atual)

---

## 🌐 Public Endpoints

### POST /public/register
Cadastrar telefone WhatsApp de morador (sem autenticação)

**Request:**
```json
{
  "registration_code": "ABC123XY",
  "apartment_number": "101",
  "whatsapp": "(11) 99999-9999",
  "name": "Maria Silva"
}
```

**Response:**
```json
{
  "message": "Telefone cadastrado com sucesso!",
  "building_name": "Edifício Example",
  "apartment_number": "101"
}
```

**Erros:**
- `404`: Código de prédio inválido ou apartamento não encontrado
- `400`: Telefone já cadastrado para este apartamento
- `403`: Prédio inativo

### GET /public/building/{registration_code}
Validar código de prédio (sem autenticação)

**Response:**
```json
{
  "name": "Edifício Example",
  "active": true
}
```

---

## 📊 Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "building_admin" | "doorman";
  building_id?: string;
  active: boolean;
}
```

### Building
```typescript
{
  id: string;
  name: string;
  registration_code: string;
  num_apartments: number;
  plan: "free" | "basic" | "premium";
  message_quota: number;
  messages_used: number;
  active: boolean;
  custom_message?: string;
  created_at: string;
}
```

### Apartment
```typescript
{
  id: string;
  number: string;
  building_id: string;
  created_at: string;
}
```

### ResidentPhone
```typescript
{
  id: string;
  apartment_id: string;
  whatsapp: string;
  name?: string;
  created_at: string;
}
```

### Delivery
```typescript
{
  id: string;
  apartment_id: string;
  apartment_number: string;
  building_id: string;
  doorman_id: string;
  doorman_name: string;
  timestamp: string;
  status: "success" | "failed";
  phones_notified: string[];
}
```

---

## 🔒 Authorization Matrix

| Endpoint | super_admin | building_admin | doorman | public |
|----------|-------------|----------------|---------|--------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ❌ |
| POST /super-admin/buildings | ✅ | ❌ | ❌ | ❌ |
| GET /super-admin/buildings | ✅ | ❌ | ❌ | ❌ |
| PUT /super-admin/buildings/{id} | ✅ | ❌ | ❌ | ❌ |
| GET /super-admin/stats | ✅ | ❌ | ❌ | ❌ |
| GET /admin/building | ❌ | ✅ | ✅ | ❌ |
| PUT /admin/building/message | ❌ | ✅ | ❌ | ❌ |
| POST /admin/users | ❌ | ✅ | ❌ | ❌ |
| GET /admin/users | ❌ | ✅ | ❌ | ❌ |
| GET /admin/apartments | ❌ | ✅ | ✅ | ❌ |
| POST /admin/apartments/{id}/phones | ❌ | ✅ | ❌ | ❌ |
| GET /admin/apartments/{id}/phones | ❌ | ✅ | ✅ | ❌ |
| DELETE /admin/phones/{id} | ❌ | ✅ | ❌ | ❌ |
| GET /admin/deliveries | ❌ | ✅ | ❌ | ❌ |
| GET /admin/all-phones | ❌ | ✅ | ❌ | ❌ |
| DELETE /super-admin/buildings/{id} | ✅ | ❌ | ❌ | ❌ |
| POST /doorman/delivery | ❌ | ❌ | ✅ | ❌ |
| GET /doorman/deliveries/today | ❌ | ❌ | ✅ | ❌ |
| POST /public/register | ✅ | ✅ | ✅ | ✅ |
| GET /public/building/{code} | ✅ | ✅ | ✅ | ✅ |

---

## 📝 Exemplos de Uso

### Fluxo Completo: Registro de Entrega

```bash
# 1. Porteiro faz login
TOKEN=$(curl -s -X POST "https://chegou-aqui.preview.emergentagent.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@sunset.com","password":"joao123"}' \
  | jq -r '.access_token')

# 2. Buscar apartamentos
APARTMENTS=$(curl -s "https://chegou-aqui.preview.emergentagent.com/api/admin/apartments" \
  -H "Authorization: Bearer $TOKEN")

APT_ID=$(echo $APARTMENTS | jq -r '.[0].id')

# 3. Registrar entrega
curl -X POST "https://chegou-aqui.preview.emergentagent.com/api/doorman/delivery" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"apartment_id\":\"$APT_ID\"}"

# 4. Ver histórico do dia
curl "https://chegou-aqui.preview.emergentagent.com/api/doorman/deliveries/today" \
  -H "Authorization: Bearer $TOKEN"
```

### Fluxo: Morador Cadastra WhatsApp

```bash
# 1. Validar código do prédio
curl "https://chegou-aqui.preview.emergentagent.com/api/public/building/ABC123XY"

# 2. Cadastrar telefone
curl -X POST "https://chegou-aqui.preview.emergentagent.com/api/public/register" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_code": "ABC123XY",
    "apartment_number": "101",
    "whatsapp": "(11) 99999-9999",
    "name": "Maria Silva"
  }'
```

---

## ⚠️ Rate Limits

Atualmente não implementado. Recomendado para produção:
- Login: 5 tentativas / minuto / IP
- Registro público: 10 cadastros / hora / IP
- Delivery: Limitado pela quota do plano

---

## 🐛 Error Responses

Formato padrão:
```json
{
  "detail": "Mensagem de erro descritiva"
}
```

Códigos HTTP:
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Bad Request (validação falhou)
- `401`: Não autenticado
- `403`: Não autorizado (sem permissão)
- `404`: Não encontrado
- `500`: Erro interno do servidor

---

## 📞 Suporte

Para dúvidas sobre a API:
- Documentação: Este arquivo
- Swagger UI: `/docs` (FastAPI auto-generated)
- ReDoc: `/redoc` (FastAPI auto-generated)
