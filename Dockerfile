# Используем официальный образ Node.js
FROM node:20-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Vite по умолчанию запускается на порту 5173
EXPOSE 5173

# Команда для запуска dev-сервера
# Убедитесь, что в package.json есть скрипт "dev"
# Он должен выглядеть как "dev": "vite --host 0.0.0.0"
CMD ["npm", "run", "dev"]