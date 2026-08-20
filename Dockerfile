# Use the official Bun image as the base image
FROM oven/bun:1

# Set the working directory
WORKDIR /usr/src/app

# Copy the dependency manifest and lockfile before installing dependencies.
COPY package.json bun.lock ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Generate the Prisma client with Bun
RUN bunx --bun prisma generate

# Build the application
RUN bun run build

# Expose the application port
EXPOSE 3000

# Start the application with Bun
CMD ["sh", "-c", "bunx --bun prisma migrate deploy && bun dist/main.js"]
