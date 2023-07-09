const express = require('express');
require('dotenv').config();
const cors = require('cors');

const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 5171;
// middleware
app.use(cors());

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/file.html');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
