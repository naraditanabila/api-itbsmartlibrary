const Express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const port = process.env.PORT||3000
const app = Express()
const Pool = require('pg').Pool
require('dotenv').config()

const db = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: true
})

db.connect();

const anggotaRouter = require('./api/anggota')
const bukuRouter = require('./api/buku')
const peminjamanRouter = require('./api/peminjaman')


app.use(bodyParser())
app.use(cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method == 'OPTIONS') {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELEETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

app.use(anggotaRouter)
app.use(bukuRouter)
app.use(peminjamanRouter)

app.listen(port, function() {
    console.log(`Server Starts on ${port}`)
});

//module.exports = app;