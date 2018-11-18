simple-mongoose (express-restify-mongoose)
==========================================

Create MongoDB and Push Application
-----------------------------------

    $ cf create-service mongodb-2 free mongodb
    $ cf push simple-mongoose -c "node index.js" -m 128mb --no-start --random-route
    $ cf bind-service simple-mongoose mongodb
    $ cf start simple-mongoose

    $ cf app simple-mongoose

Use
---

Put the randomly generated route into variables DOMAIN and HOST for ease of use

    $ DOMAIN=scapp.io
    $ HOST=...
    $ curl https://${HOST}.${DOMAIN}/api/v1/person -s | jq "."

Create person

    $ curl -X POST \
        -H "content-type: application/json" \
        -d '{
          "lastname": "Meier",
          "firstname": "Gerd"
        }' \
        https://${HOST}.${DOMAIN}/api/v1/person

Read id of person

    $ id=$(curl https://${HOST}.${DOMAIN}/api/v1/person -s \
        | jq ".[] | if .lastname == \"Meier\" then ._id else empty end" | tr -d '"')

Update person

    $ curl -X PUT \
        -H "content-type: application/json" \
        -d '{
          "lastname": "Meier-Müller",
          "firstname": "Gerd"
        }' \
        https://${HOST}.${DOMAIN}/api/v1/person/$id

blue/green with service
-----------------------

Push new version with tmp route for testing

    $ cf rename simple-mongoose simple-mongoose-old
    $ cf push simple-mongoose -c "node index.js" -m 128mb --no-start -d $DOMAIN -n $HOST-tmp
    $ cf bind-service simple-mongoose mongodb
    $ cf start simple-mongoose

Verify correct route-mapping and service-binding

    $ cf apps
    $ cf services

Create person with age

    $ curl -X POST \
        -H "content-type: application/json" \
        -d '{
          "lastname": "Huber",
          "firstname": "Jakob",
          "age": 47
        }' \
        https://${HOST}-tmp.${DOMAIN}/api/v1/person
    $ curl https://${HOST}-tmp.${DOMAIN}/api/v1/person -s | jq "."

After successful testing, new version goes online

    $ cf map-route simple-mongoose $DOMAIN -n $HOST
    $ cf unmap-route simple-mongoose $DOMAIN -n $HOST-tmp

When operations are smooth, delete old version, else, roll back

    $ cf delete simple-mongoose-old -f

Clean up
--------

Delete the application and the service instance

    $ cf delete simple-mongoose -f
    $ cf delete-service mongodb -f
