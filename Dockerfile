# Use Node.js 20 as the base image
FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Environment variable to listen on the correct port for Cloud Run
ENV PORT=8080

# Start the application
CMD ["npm", "run", "start"] 