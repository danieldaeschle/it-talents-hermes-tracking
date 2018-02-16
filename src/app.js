const express = require('express');
const bodyParser = require('body-parser');
const mustache = require('mustache-express');
const path = require('path');

const tracks = require('./routes/tracks');

const app = express();

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(tracks);

app.get('/', (req, res) => res.render('index'));

app.listen(80, () => console.log('Exmample app listening on port 80!'));
