#!/bin/bash

# Script para ativar WhatsApp Real no ChegouAqui
# Uso: bash /app/scripts/ativar_whatsapp.sh

echo "=================================================="
echo "   ATIVAÇÃO DE WHATSAPP REAL - ChegouAqui"
echo "=================================================="
echo ""

# Verificar se já está ativo
if grep -q "WHATSAPP ENVIADO" /var/log/supervisor/backend.*.log 2>/dev/null; then
    echo "⚠️  WhatsApp real parece já estar ativo!"
    echo ""
fi

echo "📋 Este script irá ajudá-lo a ativar o envio real de WhatsApp."
echo ""
echo "Você precisará de:"
echo "  1. Conta no Twilio (https://www.twilio.com)"
echo "  2. Account SID (começa com AC...)"
echo "  3. Auth Token"
echo "  4. Número WhatsApp do Twilio"
echo ""
read -p "Você possui essas credenciais? (s/n): " tem_credenciais

if [ "$tem_credenciais" != "s" ]; then
    echo ""
    echo "❌ Primeiro obtenha as credenciais do Twilio."
    echo ""
    echo "Leia o guia completo em: /app/ATIVAR_WHATSAPP_REAL.md"
    echo ""
    echo "Passos rápidos:"
    echo "  1. Acesse: https://www.twilio.com/try-twilio"
    echo "  2. Crie conta gratuita"
    echo "  3. Ative WhatsApp Sandbox ou solicite número business"
    echo "  4. Copie: Account SID, Auth Token e Número WhatsApp"
    echo "  5. Execute este script novamente"
    echo ""
    exit 0
fi

echo ""
echo "=================================================="
echo "  PASSO 1: Configurar Credenciais"
echo "=================================================="
echo ""

# Ler credenciais
read -p "Account SID (AC...): " account_sid
read -p "Auth Token: " auth_token
read -p "Número WhatsApp (ex: whatsapp:+14155238886): " whatsapp_number

# Backup do .env atual
echo ""
echo "Criando backup de /app/backend/.env..."
cp /app/backend/.env /app/backend/.env.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar .env
echo "Atualizando /app/backend/.env..."
sed -i "s|TWILIO_ACCOUNT_SID=.*|TWILIO_ACCOUNT_SID=\"$account_sid\"|g" /app/backend/.env
sed -i "s|TWILIO_AUTH_TOKEN=.*|TWILIO_AUTH_TOKEN=\"$auth_token\"|g" /app/backend/.env
sed -i "s|TWILIO_WHATSAPP_NUMBER=.*|TWILIO_WHATSAPP_NUMBER=\"$whatsapp_number\"|g" /app/backend/.env

echo "✅ Credenciais configuradas!"
echo ""

echo "=================================================="
echo "  PASSO 2: Ativar Código Real"
echo "=================================================="
echo ""

# Backup do server.py
echo "Criando backup de /app/backend/server.py..."
cp /app/backend/server.py /app/backend/server.py.backup.$(date +%Y%m%d_%H%M%S)

echo ""
echo "⚠️  ATENÇÃO: Você precisa editar manualmente o server.py"
echo ""
echo "Abra o arquivo:"
echo "  nano /app/backend/server.py"
echo ""
echo "Localize a função 'send_whatsapp_message' (por volta da linha 260)"
echo ""
echo "Descomente o código REAL e comente a SIMULAÇÃO"
echo ""
echo "Veja o exemplo completo em: /app/ATIVAR_WHATSAPP_REAL.md"
echo ""
read -p "Pressione ENTER quando terminar de editar o server.py..."

echo ""
echo "=================================================="
echo "  PASSO 3: Reiniciar Backend"
echo "=================================================="
echo ""

echo "Reiniciando backend..."
sudo supervisorctl restart backend
sleep 3

# Verificar se iniciou
if sudo supervisorctl status backend | grep -q "RUNNING"; then
    echo "✅ Backend reiniciado com sucesso!"
else
    echo "❌ Erro ao reiniciar backend. Verifique os logs:"
    echo "   tail -f /var/log/supervisor/backend.*.log"
    exit 1
fi

echo ""
echo "=================================================="
echo "  PASSO 4: Testar"
echo "=================================================="
echo ""

echo "Para testar o envio real:"
echo ""
echo "1. Se estiver usando SANDBOX:"
echo "   - Adicione o número Twilio nos seus contatos"
echo "   - Envie: 'join <palavra-chave>' (veja no console Twilio)"
echo ""
echo "2. Cadastre seu número no sistema:"
echo "   - Acesse: /registrar?codigo=<CODIGO_DO_PREDIO>"
echo "   - Preencha com seu número"
echo ""
echo "3. Registre uma entrega:"
echo "   - Login como porteiro"
echo "   - Clique no seu apartamento"
echo ""
echo "4. Verifique os logs:"
echo "   tail -f /var/log/supervisor/backend.*.log"
echo ""
echo "   Deve aparecer: [WHATSAPP ENVIADO] SID: SMxxxxx"
echo ""
echo "5. Verifique seu WhatsApp:"
echo "   Você deve receber a mensagem! 🎉"
echo ""

echo "=================================================="
echo "  ✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "=================================================="
echo ""
echo "Leia o guia completo: /app/ATIVAR_WHATSAPP_REAL.md"
echo ""
