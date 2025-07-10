# Stage 1: Build the application
FROM --platform=linux/arm64 node:20-alpine AS build

ARG NETWORK

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Copy the correct .env file based on the NETWORK argument
COPY .env-boba-sepolia .env
# VITE needs env-vars at build time

# Build the application using pnpm
RUN pnpm run build

# Stage 2: Serve the application
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]