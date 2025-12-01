FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment
ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]
