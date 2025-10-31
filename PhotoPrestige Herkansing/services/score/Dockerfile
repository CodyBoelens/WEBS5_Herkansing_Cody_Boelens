# Use Node.js 20 as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Create uploads folder for image storage
RUN mkdir -p uploads

# Expose the app port
EXPOSE 3004

# Start the app
CMD ["npm", "start"]
