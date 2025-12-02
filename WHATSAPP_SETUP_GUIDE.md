# 📱 Guia Completo de Configuração do WhatsApp - ChegouAqui

Este guia explica como ativar o envio de mensagens via WhatsApp no sistema ChegouAqui.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Opção 1: Twilio (Recomendado)](#opção-1-twilio-recomendado)
3. [Opção 2: Meta WhatsApp Business API](#opção-2-meta-whatsapp-business-api)
4. [Aprovação de Templates pela Meta](#aprovação-de-templates-pela-meta)
5. [Configuração no Sistema](#configuração-no-sistema)
6. [Testes](#testes)
7. [Troubleshooting](#troubleshooting)
8. [Custos](#custos)

---

## 🎯 Visão Geral

O ChegouAqui suporta envio de mensagens via WhatsApp através de duas opções:

| Opção | Vantagens | Desvantagens |
|-------|-----------|--------------|
| **Twilio** | Fácil configuração, documentação excelente, suporte confiável | Custos por mensagem |
| **Meta Direct** | Integração oficial, mais controle | Configuração complexa, aprovação demorada |

**🏆 Recomendação**: Use Twilio para começar rapidamente.

---

## 🚀 Opção 1: Twilio (Recomendado)

### Passo 1: Criar Conta Twilio

1. Acesse: https://www.twilio.com/try-twilio
2. Clique em **"Start your free trial"**
3. Preencha seus dados:
   - Email
   - Nome
   - Senha
   - País: **Brasil**
4. Verifique seu email
5. Adicione um número de telefone para verificação

### Passo 2: Configurar WhatsApp no Twilio

#### 2.1. Acessar Console Twilio
1. Faça login em: https://console.twilio.com/
2. No menu lateral, vá em: **Messaging** > **Try it out** > **Send a WhatsApp message**

#### 2.2. Conectar seu Sandbox WhatsApp
1. Na página do Sandbox, você verá:
   - Um número WhatsApp do Twilio (ex: `+1 415 523 8886`)
   - Um código de ativação (ex: `join <código>`)

2. **Conectar seu WhatsApp pessoal ao Sandbox:**
   - Abra o WhatsApp no seu celular
   - Envie uma mensagem para o número Twilio
   - Digite exatamente: `join <código-fornecido>`
   - Aguarde confirmação

**⚠️ IMPORTANTE**: O Sandbox é APENAS para testes. Para produção, você precisa de um número aprovado.

### Passo 3: Obter Credenciais

#### 3.1. Account SID e Auth Token
1. No Dashboard do Twilio: https://console.twilio.com/
2. Na seção **Account Info**, copie:
   - **Account SID** (ex: `AC1234567890abcdef1234567890abcd`)
   - **Auth Token** (clique no ícone de olho para revelar)

#### 3.2. Número WhatsApp
- **Para Sandbox (Testes)**: `whatsapp:+14155238886` (ou o número fornecido)
- **Para Produção**: Você precisará solicitar um número dedicado

### Passo 4: Solicitar Número WhatsApp para Produção

#### 4.1. Requisitos
- Conta Twilio verificada
- Cartão de crédito cadastrado
- Perfil comercial no WhatsApp Business

#### 4.2. Processo
1. No Console Twilio, vá em: **Phone Numbers** > **Buy a number**
2. Selecione **Brasil** como país
3. Marque a opção **WhatsApp**
4. Escolha um número disponível
5. Complete a compra

#### 4.3. Ativar WhatsApp no Número
1. Vá em: **Messaging** > **WhatsApp** > **Senders**
2. Clique em **+ Add new sender**
3. Selecione o número comprado
4. Preencha informações do negócio:
   - Nome da empresa: **ChegouAqui** (ou nome do condomínio)
   - Categoria: **Serviços Imobiliários**
   - Website (se tiver)
5. Envie para aprovação da Meta

**⏱️ Tempo de aprovação**: 1-3 dias úteis

---

## 📱 Opção 2: Meta WhatsApp Business API

### Passo 1: Criar Conta WhatsApp Business

1. Acesse: https://business.facebook.com/
2. Crie uma conta comercial
3. Adicione informações do seu negócio

### Passo 2: Configurar WhatsApp Business API

1. Acesse: https://developers.facebook.com/apps
2. Clique em **Create App**
3. Escolha **Business** como tipo
4. Preencha:
   - Nome do App: **ChegouAqui**
   - Email de contato
   - Conta comercial

### Passo 3: Adicionar WhatsApp Product

1. No Dashboard do App, clique em **Add Product**
2. Selecione **WhatsApp**
3. Clique em **Set Up**

### Passo 4: Registrar Número de Telefone

1. Na seção **WhatsApp**, vá em **Getting Started**
2. Clique em **Add Phone Number**
3. Escolha entre:
   - **Número novo** (fornecido pela Meta)
   - **Número existente** (migração)
4. Complete o processo de verificação

### Passo 5: Obter Credenciais

1. Acesse: **WhatsApp** > **Configuration**
2. Copie:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
3. Vá em **Settings** > **Basic**
4. Copie o **App ID** e **App Secret**

### Passo 6: Gerar Token de Acesso

1. Vá em **WhatsApp** > **API Setup**
2. Clique em **Generate Access Token**
3. Defina permissões:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Copie e guarde o token (ele só aparece uma vez!)

---

## ✅ Aprovação de Templates pela Meta

### Por que Templates são Necessários?

A Meta exige que todas as mensagens enviadas via WhatsApp Business API sejam pré-aprovadas para evitar spam.

### Templates do ChegouAqui

O sistema possui 5 templates pré-definidos:

1. **Template 1**: Chegou uma entrega para o apartamento [numero]. A retirada está liberada na portaria.
2. **Template 2**: Há uma entrega destinada ao apartamento [numero]. Retire na central de encomendas.
3. **Template 3**: O apartamento [numero] recebeu uma encomenda. Disponível para retirada na portaria.
4. **Template 4**: Chegou uma encomenda para o apartamento [numero]. Retirar na sala de correspondências.
5. **Template 5**: O apartamento [numero] tem uma entrega registrada. A retirada deve ser feita no locker do condomínio.

### Como Submeter Templates para Aprovação

#### Via Twilio

1. Acesse: **Messaging** > **WhatsApp** > **Content** > **Templates**
2. Clique em **Create Template**
3. Preencha:
   - **Template Name**: `chegouaqui_notificacao_1`
   - **Category**: `UTILITY` (Serviços)
   - **Language**: `pt_BR` (Português do Brasil)
4. **Body (Corpo da mensagem)**:
   ```
   Chegou uma entrega para o apartamento {{1}}. A retirada está liberada na portaria.
   ```
   - **⚠️ IMPORTANTE**: Use `{{1}}` onde está `[numero]` no template
5. Clique em **Submit**
6. Repita para os outros 4 templates

#### Via Meta Direct

1. Acesse: https://business.facebook.com/wa/manage/message-templates/
2. Clique em **Create Template**
3. Preencha os mesmos dados acima
4. Adicione variáveis usando `{{1}}`
5. Envie para aprovação

### Tempo de Aprovação

- **Primeira submissão**: 24-72 horas
- **Submissões subsequentes**: 1-24 horas

### Status dos Templates

Você pode verificar o status em:
- **Twilio**: Console > Templates > Status
- **Meta**: Business Manager > Message Templates

**Status possíveis:**
- 🟡 **Pending**: Aguardando aprovação
- 🟢 **Approved**: Aprovado, pronto para usar
- 🔴 **Rejected**: Rejeitado (revise e reenvie)

---

## ⚙️ Configuração no Sistema

### Método 1: Via Variáveis de Ambiente (Recomendado para Produção)

#### Para Kubernetes/Docker
1. No painel de controle da Emergent, adicione as variáveis:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_WHATSAPP_NUMBER=whatsapp:+5511999999999
   ```

#### Para Desenvolvimento Local
1. Edite o arquivo `/app/backend/.env`:
   ```bash
   # Twilio WhatsApp - PRODUÇÃO
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   TWILIO_WHATSAPP_NUMBER="whatsapp:+5511999999999"
   ```

2. Reinicie o backend:
   ```bash
   sudo supervisorctl restart backend
   ```

### Método 2: Via Código (Não Recomendado)

**⚠️ NUNCA FAÇA ISSO EM PRODUÇÃO**

Se você realmente precisar (apenas para testes locais):

1. Edite `/app/backend/server.py`:
   ```python
   TWILIO_ACCOUNT_SID = "ACxxxxx..."  # Seu Account SID
   TWILIO_AUTH_TOKEN = "xxxxxx..."    # Seu Auth Token
   TWILIO_WHATSAPP_NUMBER = "whatsapp:+5511999999999"
   ```

---

## 🧪 Testes

### Teste 1: Verificar Configuração

```bash
# Via curl
curl -X POST http://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@teste.com","password":"senha123"}'

# Guarde o token retornado
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Teste envio de notificação
curl -X POST http://seu-dominio.com/api/doorman/delivery \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apartment_id":"ID_DO_APARTAMENTO"}'
```

### Teste 2: Envio Real via Painel

1. Faça login como **Porteiro**
2. Vá para o **Painel do Porteiro**
3. Clique em um apartamento que tenha telefone cadastrado
4. Aguarde a notificação no WhatsApp

### Teste 3: Verificar Logs

```bash
# Ver últimas mensagens enviadas
tail -50 /var/log/supervisor/backend.err.log | grep WHATSAPP
```

**Log de sucesso:**
```
[WHATSAPP ENVIADO] Para: +5511999999999 | SID: SMxxxxxxxx
```

**Log de erro:**
```
Erro ao enviar WhatsApp para +5511999999999: [detalhes do erro]
```

---

## 🐛 Troubleshooting

### Problema 1: "Unable to create record: Invalid 'To' Phone Number"

**Causa**: Número de telefone inválido ou não verificado no sandbox.

**Solução**:
1. Verifique se o número está no formato: `+5511999999999`
2. Se usar sandbox, verifique se o número foi conectado com `join código`
3. Teste com seu próprio número primeiro

### Problema 2: "Authentication Error"

**Causa**: Credenciais Twilio incorretas.

**Solução**:
1. Verifique `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN`
2. Confirme que não há espaços em branco
3. Teste as credenciais no Console Twilio

### Problema 3: "Messaging service not found"

**Causa**: Número WhatsApp não configurado ou inativo.

**Solução**:
1. Verifique se o número está ativo no Twilio
2. Confirme que WhatsApp está habilitado para o número
3. Use o formato: `whatsapp:+5511999999999`

### Problema 4: "Template not approved"

**Causa**: Template ainda não foi aprovado pela Meta.

**Solução**:
1. Aguarde aprovação (pode levar até 72h)
2. Verifique status no Twilio Console
3. Se rejeitado, revise o conteúdo e reenvie

### Problema 5: "Message blocked as spam"

**Causa**: Muitas mensagens enviadas em curto período.

**Solução**:
1. Reduza frequência de envio
2. Aguarde 24h para limite ser resetado
3. Use templates aprovados apenas

### Problema 6: Mensagens não chegam

**Checklist**:
- [ ] Credenciais Twilio corretas?
- [ ] Número no formato internacional? (`+5511999999999`)
- [ ] Template aprovado pela Meta?
- [ ] Número destinatário verificado no sandbox?
- [ ] Conta Twilio com crédito?
- [ ] Logs do backend mostram sucesso?

---

## 💰 Custos

### Twilio

| Item | Custo (USD) | Observações |
|------|-------------|-------------|
| **Número WhatsApp** | $15/mês | Necessário para produção |
| **Mensagens** | $0.005-0.01/msg | Varia por país |
| **Sandbox** | Grátis | Apenas para testes |
| **Trial Account** | $15.50 crédito | Grátis no início |

**Exemplo de custo mensal:**
- 1 prédio, 50 apartamentos, 5 notificações/dia
- Total: ~7.500 mensagens/mês
- Custo: $15 (número) + $37.50 (mensagens) = **~$52.50/mês**

### Meta WhatsApp Business API

| Item | Custo (USD) | Observações |
|------|-------------|-------------|
| **Setup** | Grátis | - |
| **Mensagens (1-1000)** | Grátis | Primeiras 1000 conversas/mês |
| **Mensagens (1000+)** | $0.01-0.05/msg | Varia por categoria |
| **Número verificado** | Grátis | Fornecido pela Meta |

---

## 📊 Comparação Final

| Critério | Twilio | Meta Direct |
|----------|---------|-------------|
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Custo** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Documentação** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Suporte** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Tempo Setup** | 30 min | 3-7 dias |

---

## 🎯 Recomendação Final

### Para Começar Rapidamente:
**Use Twilio Sandbox** → Configure em 10 minutos → Teste com seu número

### Para Produção Pequena/Média:
**Use Twilio com Número Dedicado** → Melhor custo-benefício → Suporte excelente

### Para Grande Escala:
**Use Meta WhatsApp Business API** → Menor custo → Mais controle

---

## 📞 Suporte

### Documentação Oficial
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **Meta WhatsApp Business**: https://developers.facebook.com/docs/whatsapp

### Problemas com ChegouAqui
- Email: neuraone.ai@gmail.com
- Logs do sistema: `/var/log/supervisor/backend.err.log`

---

## ✅ Checklist de Ativação

Use esta lista para garantir que tudo está configurado:

### Twilio
- [ ] Conta Twilio criada
- [ ] Account SID e Auth Token copiados
- [ ] Número WhatsApp configurado (sandbox ou dedicado)
- [ ] Credenciais adicionadas ao `.env` ou variáveis de ambiente
- [ ] Backend reiniciado
- [ ] Teste de envio realizado com sucesso
- [ ] Templates submetidos para aprovação
- [ ] Templates aprovados pela Meta

### Sistema
- [ ] Variáveis de ambiente configuradas
- [ ] 5 templates de mensagem cadastrados
- [ ] Template padrão selecionado no painel admin
- [ ] Telefone de teste cadastrado em apartamento
- [ ] Notificação de teste enviada com sucesso
- [ ] WhatsApp recebeu a mensagem corretamente

---

**🎉 Pronto! Seu sistema ChegouAqui está configurado para enviar notificações via WhatsApp!**

---

**Última atualização**: Dezembro 2025
**Versão do guia**: 1.0
