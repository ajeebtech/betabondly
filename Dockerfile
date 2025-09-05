FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Cloud Run will use $PORT, Next.js dev defaults to 3000
# So tell Next.js to use PORT instead
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "-p", "8080"]