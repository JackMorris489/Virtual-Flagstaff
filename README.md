# Virtual Flagstaff

## Prerequisites
* [Docker Desktop](https://www.docker.com)
* [Node.js](https://nodejs.org)

## Getting Started
Create a copy of `.env.template` file and name it `.env`

`$ cd frontend`

`$ npm i`

`$ cd ..`

`$ docker compose up`

## Hard Reset Services

`docker compose down -v`

`docker compose up --build`