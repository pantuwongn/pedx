# nextjs
FROM node:16-alpine
WORKDIR /usr/app
COPY package.json yarn.lock /usr/app/
# RUN yarn install --production
RUN yarn install
COPY . /usr/app
# RUN yarn build
EXPOSE 3000
# CMD yarn start
CMD yarn dev