const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');

const tracks = require('./routes/tracks');

const app = express();

app.engine('html', mustache());
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(tracks);

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000, () => console.log('Exmample app listening on port 3000!'));
