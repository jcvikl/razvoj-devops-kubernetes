FROM node:16-alpine as builder
# Default application directory for all subsequent commands (COPY, RUN, CMD etc.).
WORKDIR /usr/src/app
# Copy package.json and install dependencies.
# Docker will cache node_modules, if package.json and package-lock.json are not changed.
COPY package*.json ./
# Install packages as defined in lockfile
RUN npm install --frozen-lockfile

FROM node:16-alpine as runner
# Default application directory for all subsequent commands (COPY, RUN, CMD etc.).
WORKDIR /usr/src/app
# Copy required source code of the application
COPY api api
COPY hbs hbs
COPY public public
COPY server.js .
COPY package.json .
# Copy node_modules required for app from builder to runner
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules

EXPOSE 3000

CMD [ "npm", "run", "start" ]
