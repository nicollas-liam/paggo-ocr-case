#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' 

ENCODED_KEY="Z3NrXzlpV0JOaE1VT01VTTVmblVDOVFxV0dkeWIzRlk0ZkhrUmZZSkhMWnZXSDhZYUVEUTJOUjg="

if [[ "$OSTYPE" == "darwin"* ]]; then
    DEMO_KEY=$(echo "$ENCODED_KEY" | base64 -D)
else
    DEMO_KEY=$(echo "$ENCODED_KEY" | base64 -d)
fi

echo -e "${BLUE}=== INICIANDO CONFIGURAÇÃO AUTOMÁTICA DO PAGGO CASE ===${NC}"

echo -e "\n${GREEN}[1/4] Configurando o Backend...${NC}"

cd backend

if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
else
    echo "Arquivo .env já existe."
fi

npm install

if grep -q "OPENAI_API_KEY=\"PLACEHOLDER_KEY\"" .env; then
    echo -e "${BLUE}Configuração da API Key (IA):${NC}"
    echo "Para a IA funcionar, precisamos de uma API Key (Groq ou OpenAI)."
    echo "Se você não tiver uma, pressione ENTER para usar a chave de demonstração incluída."
    
    read -p "Cole sua API Key (ou ENTER para usar Demo): " input_key
    
    if [ -z "$input_key" ]; then
        echo -e "${GREEN}Usando chave de demonstração...${NC}"
        final_key="$DEMO_KEY"
    else
        final_key="$input_key"
    fi

    sed -i.bak "s/PLACEHOLDER_KEY/$final_key/" .env && rm .env.bak
fi

echo -e "${GREEN}Configurando Banco de Dados...${NC}"
npx prisma migrate dev --name init

cd ..

echo -e "\n${GREEN}[2/4] Configurando o Frontend...${NC}"
cd frontend
npm install
cd ..

echo -e "\n${GREEN}[3/4] Preparando para iniciar...${NC}"
echo "Tudo pronto!"

echo -e "\n${BLUE}=== INICIANDO APLICAÇÃO ===${NC}"
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:3000"
echo "Aguarde... o navegador abrirá automaticamente em 5 segundos."
echo "Pressione Ctrl+C para parar."

(sleep 5 && open "http://localhost:3001" 2>/dev/null || xdg-open "http://localhost:3001" 2>/dev/null || echo "Abra o link manualmente!") &

npx concurrently "cd backend && npm run start:dev" "cd frontend && npm run dev"