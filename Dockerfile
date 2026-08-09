# Use the official Bun image as the base image
FROM oven/bun:1

# Set the working directory
WORKDIR /usr/src/app

# Copy the package configuration files
COPY package*.json ./

# Install dependencies with Bun
RUN bun install

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client with Bun
RUN bun x prisma generate

# Build the application
RUN bun run build

# Expose the application port
EXPOSE 3000

# Start the application with Bun
CMD ["bun", "dist/main.js"]