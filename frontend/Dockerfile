# docker-compose.prod.yml for React
FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

# Удаляем старые зависимости и кэш npm
RUN rm -rf node_modules && npm cache clean --force

# Устанавливаем зависимости без опциональных модулей
#RUN npm install --no-optional
RUN npm install

COPY . .

# Сборка приложения
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]