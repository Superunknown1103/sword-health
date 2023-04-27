FROM node:14-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port on which the app will listen
EXPOSE 3000

# Start the app
CMD ["npm", "start"]