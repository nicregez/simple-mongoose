const express = require('express')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')

const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();

const app = express()
const router = express.Router()

app.use(bodyParser.json())
app.use(methodOverride())

mongoose.connect(appEnv.getServiceURL('mongodb'));

restify.serve(router, mongoose.model('Person', new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true }
})))

app.use(router)

app.listen(3000, () => {
  console.log('Express server listening on port 3000')
})

app.listen(appEnv.port, function () {
  console.log('Express server listening on port %s', appEnv.port);
});
