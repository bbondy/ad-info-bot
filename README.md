# ad-info-bot

Uses [ad-info](https://github.com/bbondy/ad-info) across the Alexa top sites and spits out information to stdout and a JSON file.

## Setup

    npm install --global babel
    git clone https://github.com/bbondy/ad-info-bot
    npm install

## Top500 only

    npm start

## Push top 1M sites to local AMQP

    npm run push

## Process sites for add info from locla AMQP

    npm run process

## Clear AMQP qeuue

    npm run clear

## Get queue sizes

    npm run size
