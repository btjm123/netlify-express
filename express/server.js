'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const superagent = require('superagent');
const parseISO = require('date-fns/parseISO')
const { DateTime } = require("luxon");

app.set('view engine','ejs');
app.use(express.static(__dirname + '/public'));

const router = express.Router();
router.get('/', (req, res) => {

  superagent
    .get('https://api.github.com/gists/public')
    .set('User-Agent', 'btjm123')
    .then(data => {
        var arrayDates = [];
        for (var i=0;i<data.body.length;i++) {
          var theDate = data.body[i].created_at;
          var formattedDate = DateTime.fromISO(theDate, {setZone: true});
          var finalDate = finalizeDate(formattedDate);
          console.log(finalDate);
          arrayDates.push(finalDate);
        }
        res.render('pages/index',{
          data: data.body,
          dates: arrayDates
        });
  })
  .catch(err => {
    console.log(err.message);
    console.log(err.response);
    res.render('pages/error');
  });
});





router.get('/another', (req, res) => res.json({ route: req.originalUrl }));
router.post('/', (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function finalizeDate(a) {
  var year = a.c.year;
  var month = a.c.month;
  var day = a.c.day;
  var hour = a.c.hour;
  var minute = a.c.minute;
  var second = a.c.second;
  return pad(day, 2) + "/" + pad(month, 2) + "/" + year + " at " + pad(hour, 2) + ":" + pad(minute, 2) + ":" + pad(second, 2);
}