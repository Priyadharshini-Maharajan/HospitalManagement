FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Important for Vite or dev mode servers to work from Docker
ENV HOST 0.0.0.0

CMD ["npm", "run", "dev", "--", "--host"]

