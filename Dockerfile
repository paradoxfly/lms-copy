# Base image to use
FROM node:latest

# set a working directory
WORKDIR /src

# Copy across project configuration information
# Install application dependencies
COPY package*.json /src/

# Ask npm to install the dependencies
RUN npm install -g supervisor && npm install && npm install supervisor

# Copy across all our files
COPY . /src

# Expose our application port (3000)
EXPOSE 3000




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