# Acesso aos Leads - Super Admin

## 🔐 Como Visualizar Leads Capturados

O Super Admin pode visualizar todos os leads capturados pela landing page através da API.

### Endpoint

```
GET /api/leads
```

**Requer autenticação:** Sim (Super Admin apenas)

### Como Acessar

#### 1. Fazer Login como Super Admin

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chegouaqui.com",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "...",
  "user": {
    "role": "super_admin",
    ...
  }
}
```

#### 2. Consultar Leads

```bash
curl -X GET http://localhost:8001/api/leads \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

Resposta:
```json
[
  {
    "id": "uuid-here",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(11) 99999-9999",
    "building_name": "Condomínio Teste",
    "message": "Gostaria de saber mais",
    "status": "new",
    "created_at": "2025-01-01T10:00:00Z"
  },
  ...
]
```

### Status dos Leads

- `new` - Lead recém capturado, ainda não contatado
- `contacted` - Lead já foi contatado pela equipe
- `converted` - Lead se tornou cliente

## 📊 Interface de Gerenciamento (Futuro)

Recomendação: Adicionar uma seção no SuperAdminPanel para visualizar e gerenciar leads:

```jsx
// Em /app/frontend/src/pages/SuperAdminPanel.js

const [leads, setLeads] = useState([]);

useEffect(() => {
  const fetchLeads = async () => {
    const response = await axios.get(`${API}/leads`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setLeads(response.data);
  };
  fetchLeads();
}, []);

// Renderizar tabela de leads
<Table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Email</th>
      <th>Telefone</th>
      <th>Condomínio</th>
      <th>Status</th>
      <th>Data</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {leads.map(lead => (
      <tr key={lead.id}>
        <td>{lead.name}</td>
        <td>{lead.email}</td>
        <td>{lead.phone}</td>
        <td>{lead.building_name}</td>
        <td>{lead.status}</td>
        <td>{new Date(lead.created_at).toLocaleDateString()}</td>
        <td>
          <Button onClick={() => contactLead(lead)}>Contatar</Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

## 🗄️ Consulta Direta no MongoDB

```javascript
// Conectar ao MongoDB
mongo chegouaqui_db

// Ver todos os leads
db.leads.find().sort({created_at: -1}).pretty()

// Contar leads por status
db.leads.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Leads dos últimos 7 dias
db.leads.find({
  created_at: {
    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
}).sort({created_at: -1})
```

## 📧 Script de Relatório Diário

```python
#!/usr/bin/env python3
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime, timedelta
import os

async def daily_leads_report():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client.chegouaqui_db
    
    # Leads das últimas 24 horas
    yesterday = datetime.now() - timedelta(days=1)
    
    new_leads = await db.leads.find({
        "created_at": {"$gte": yesterday.isoformat()}
    }, {"_id": 0}).to_list(100)
    
    print(f"📊 Relatório de Leads - {datetime.now().strftime('%d/%m/%Y')}")
    print(f"Total de novos leads (24h): {len(new_leads)}\n")
    
    for i, lead in enumerate(new_leads, 1):
        print(f"Lead #{i}")
        print(f"  📝 Nome: {lead['name']}")
        print(f"  📧 Email: {lead['email']}")
        print(f"  📱 Telefone: {lead['phone']}")
        print(f"  🏢 Condomínio: {lead['building_name']}")
        print(f"  💬 Mensagem: {lead.get('message', 'N/A')}")
        print(f"  ⏰ Data: {lead['created_at']}")
        print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(daily_leads_report())
```

Salvar como `/app/scripts/daily_leads_report.py` e executar:
```bash
python3 /app/scripts/daily_leads_report.py
```

## 🔄 Atualizar Status de um Lead

```bash
# Via API (criar endpoint se necessário)
curl -X PATCH http://localhost:8001/api/leads/{lead_id} \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "contacted"}'
```

Ou via MongoDB:
```javascript
db.leads.updateOne(
  { email: "joao@example.com" },
  { $set: { status: "contacted", updated_at: new Date() } }
)
```

## 📈 Métricas Úteis

```javascript
// Taxa de conversão
const totalLeads = db.leads.countDocuments();
const converted = db.leads.countDocuments({status: "converted"});
const conversionRate = (converted / totalLeads) * 100;

// Leads por condomínio
db.leads.aggregate([
  { $group: { 
      _id: "$building_name", 
      count: { $sum: 1 } 
  }},
  { $sort: { count: -1 } }
])

// Origem dos leads (se implementado tracking)
db.leads.aggregate([
  { $group: { 
      _id: "$source", 
      count: { $sum: 1 } 
  }}
])
```

## 🎯 Próximos Passos Recomendados

1. **Adicionar dashboard de leads no SuperAdminPanel**
   - Visualizar todos os leads
   - Filtrar por status
   - Marcar como contatado/convertido

2. **Integração com CRM**
   - Enviar leads automaticamente para HubSpot/Pipedrive/etc
   - Sincronizar status bidirecionalmente

3. **Notificações automáticas**
   - Email para time de vendas quando novo lead chega
   - WhatsApp/SMS para follow-up automático

4. **Analytics avançado**
   - Tempo médio até primeiro contato
   - Taxa de conversão por fonte
   - Valor médio do cliente (LTV)
