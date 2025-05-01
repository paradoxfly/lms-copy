FROM node:18

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install express-mysql-session@3.0.3

# Copy app source
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]

# FROM node:latest

# # Set the correct working directory (use /app instead of /src)
# WORKDIR /app

# # Copy package.json and package-lock.json first to install dependencies
# COPY package*.json ./

# # Install dependencies
# RUN npm install -g supervisor && npm install

# # Copy the rest of the project files (views, public, etc.)
# COPY . .

# # Expose the application port (3000)
# EXPOSE 3000

# # Start the application
# CMD ["node", "app.js"]