#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' 

DEMO_KEY="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"

echo -e "${BLUE}=== INICIANDO CONFIGURAÇÃO AUTOMÁTICA DO PAGGO CASE ===${NC}"

echo -e "\n${GREEN}[1/4] Configurando o Backend...${NC}"
cd backend

if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
fi

npm install

echo -e "${BLUE}Configuração da API Key (IA):${NC}"
echo "Pressione ENTER para usar a chave de demonstração já configurada."
read -p "Ou cole uma nova chave aqui: " input_key

if [ -z "$input_key" ]; then
    echo -e "${GREEN}Usando chave de demonstração...${NC}"
    final_key="$DEMO_KEY"
else
    final_key="$input_key"
fi

sed -i.bak '/OPENAI_API_KEY=/d' .env && rm .env.bak

echo "OPENAI_API_KEY=\"$final_key\"" >> .env

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