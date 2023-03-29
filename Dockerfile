# Use the official Node.js v16.x image as the base image
FROM node:16-alpine

# Install yarn
RUN apk add --no-cache yarn

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and yarn.lock files to the working directory
COPY package.json yarn.lock ./

# Install the dependencies using yarn
RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript source code using esbuild with yarn
RUN yarn build

# Add a volume to include the secret .env file
VOLUME [ "/app/.env" ]
VOLUME [ "/app/storage" ]

# Set the command to run when the container starts
CMD [ "node", "build/index.js" ]