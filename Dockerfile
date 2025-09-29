# Use a Node.js image suitable for development
FROM node:20-alpine AS development

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker caching.
# If these files don't change, Docker skips the npm install step.
COPY package.json package-lock.json ./

# Install project dependencies, including dev dependencies (concurrently, onchange, sharp, etc.)
RUN npm install

# Copy the rest of the application source code (excluding .dockerignore files)
COPY . .

# Expose the port your React dev server is running on
EXPOSE 5173

# Run the unified script that starts the dev server and the photo file watcher concurrently
# Assumes you defined the "docker:dev" script in package.json:
# "docker:dev": "concurrently \"npm run dev\" \"npm run watch-photos\""
CMD ["npm", "run", "docker:dev"]
