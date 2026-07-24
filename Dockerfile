# Use Node.js LTS Alpine for a small footprint
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Update npm to pull patched bundled dependencies
RUN npm install -g npm@latest

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create writable logs directory for the non-root Node.js user
RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app/logs

# Set environment variable to production
ENV NODE_ENV=production

# The port the app runs on
EXPOSE 3000

# Run the app as a non-root user for security
USER node

# Start the application
CMD ["npm", "start"]
