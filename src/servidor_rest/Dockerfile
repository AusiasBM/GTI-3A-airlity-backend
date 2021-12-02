# @Autor Ausias Bañuls
# @Description Dockerfile lo utilizamos para configurar la parte del contenedor que tendrá el servidor express y copiar dentro del contenedor lo que nos hace falta
FROM node:14

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3500

CMD ["npm", "start"]
