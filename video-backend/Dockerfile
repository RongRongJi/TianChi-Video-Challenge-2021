FROM jrottenberg/ffmpeg:3-vaapi

RUN apt-get update

RUN apt-get install -y nodejs  \
    && apt install -y npm 

RUN npm install -g npm
# RUN apt-get install -y curl && npm cache clean -f && npm install -g n && n stable

ENV TZ=Asia/Shanghai

WORKDIR /app

COPY package*.json ./

RUN npm install -g @babel/cli @babel/core \
    && npm install

COPY . .

RUN npm run build

EXPOSE ${EXPOSE_PORT}

ENTRYPOINT [ "node", "/app/dist/app.js" ]