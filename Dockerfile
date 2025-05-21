# Use the official Playwright image as the base image
FROM mcr.microsoft.com/playwright:v1.52.0-jammy

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install required OS-level dependencies for Playwright and build the application
RUN npx playwright install-deps && \
	npx playwright install && \
	npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 