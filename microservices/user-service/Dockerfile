FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY microservices/user-service/package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código fuente del microservicio
COPY microservices/user-service ./

# Copiar código compartido
COPY shared /shared

# Compilar la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando por defecto
CMD ["npm", "run", "start:prod"]
