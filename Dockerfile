FROM node:20-alpine

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o resto do código da aplicação
COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

# Fazer o Build da aplicação Next.js
RUN npm run build

# Expor a porta 3000 para a rede interna do docker
EXPOSE 3000

# Script de inicialização: roda as migrations do Prisma primeiro, depois inicia o Next.js
CMD ["sh", "-c", "npx prisma db push && npm run start"]
