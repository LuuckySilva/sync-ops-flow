#!/bin/bash

echo "🔐 Testando Sistema de Autenticação - Sync Ops Flow"
echo "=================================================="
echo ""

# 1. Login
echo "1️⃣ Fazendo login..."
LOGIN_RESP=$(curl -s -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "lukasantonyo@hotmail.com", "senha": "Testeintegrado1"}')

TOKEN=$(echo $LOGIN_RESP | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Erro ao fazer login"
    echo "$LOGIN_RESP"
    exit 1
fi

echo "✅ Login realizado com sucesso!"
echo "Token: ${TOKEN:0:50}..."
echo ""

# 2. Testar /auth/me
echo "2️⃣ Testando /auth/me..."
ME_RESP=$(curl -s -X GET "http://localhost:8001/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$ME_RESP" | python3 -m json.tool | head -10
echo ""

# 3. Testar importação com autenticação
echo "3️⃣ Testando importação de Excel com autenticação..."
IMPORT_RESP=$(curl -s -X POST "http://localhost:8001/api/excel/frequencia/import" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test_frequencia.csv")

echo "$IMPORT_RESP" | python3 -m json.tool
echo ""

# 4. Verificar logs (apenas admin)
echo "4️⃣ Verificando logs de auditoria..."
LOGS_RESP=$(curl -s -X GET "http://localhost:8001/api/logs/recent?limite=3" \
  -H "Authorization: Bearer $TOKEN")

echo "$LOGS_RESP" | python3 -m json.tool | head -30
echo ""

# 5. Testar sem autenticação (deve falhar)
echo "5️⃣ Testando acesso SEM autenticação (deve falhar)..."
NO_AUTH=$(curl -s -X GET "http://localhost:8001/api/auth/me")
echo "$NO_AUTH"
echo ""

# 6. Verificar status do sistema
echo "6️⃣ Verificando status do sistema..."
STATUS=$(curl -s -X GET "http://localhost:8001/api/status")
echo "$STATUS" | python3 -m json.tool
echo ""

echo "✅ Testes concluídos!"
