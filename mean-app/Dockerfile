FROM node:8.10
RUN mkdir -p /usr/src/app 
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm cache verify
RUN npm install
COPY . /usr/drc/app
EXPOSE 4200
RUN cd /usr/src/app
CMD ["npm","start"]