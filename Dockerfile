FROM --platform=linux/amd64 node:18 as builder

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
COPY *.lock .

RUN yarn install --frozen-lockfile

COPY ./prisma ./prisma

RUN npx prisma generate

FROM --platform=linux/amd64 node:18-alpine as production

WORKDIR /usr/src/app

COPY . .

# COPY --from=builder /usr/src/app/build build/
COPY --from=builder /usr/src/app/node_modules node_modules/
COPY package.json ./

ENV NODE_ENV=production
CMD ["npm", "start" ]

FROM node:18 as development

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY *.lock /usr/src/app

RUN yarn install

COPY . .

# COPY ./prisma/schema.prisma /usr/src/app/prisma/schema.prisma

RUN npx prisma generate

ENV NODE_ENV=development

CMD [ "npm", "run", "dev" ]
