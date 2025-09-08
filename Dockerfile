FROM node:22-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN rm -rf package-lock.json node_modules
RUN npm install

FROM node:22-alpine AS production-dependencies-env
COPY ./package.json /app/
WORKDIR /app
RUN rm -rf package-lock.json node_modules
RUN npm install --omit=dev

FROM node:22-alpine AS build-env
COPY package.json /app/
COPY prisma /app/prisma
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npx prisma generate
COPY . /app/
RUN npm run build

FROM node:22-alpine
COPY ./package.json server.js /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY --from=build-env /app/prisma /app/prisma
WORKDIR /app
RUN npx prisma generate
CMD ["npm", "run", "start"]
