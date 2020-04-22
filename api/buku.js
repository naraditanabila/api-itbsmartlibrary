const express = require('express')
const app = express()

const Pool = require('pg').Pool
require('dotenv').config()

const dbPromise = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    ssl: true
})

dbPromise.connect()
//add data buku baru (POST)
app.post('/buku/add',async(req,res) => {
    try {
        const {id_buku, judul, author, lokasi, jml_total} = req.body
        const jml_avail = jml_total;
        const jml_pinjam= 0;
        await dbPromise.query(`insert into buku(id_buku, judul, author, lokasi, jml_total, jml_pinjam, jml_avail)
            values('${id_buku}','${judul}','${author}','${lokasi}','${jml_total}','${jml_pinjam}','${jml_avail}')`)
        console.log(req.body)
        res.json(req.body)
    } catch (error) {
        console.log(error)
        res.json('error')
    }
})

//Menambah stok buku lama (PUT)
app.put('/buku/add/:id_buku',async(req,res) => {
    const id_buku = req.params.id_buku
    const {jml_buku} = req.body

    await dbPromise.query(`UPDATE buku SET jml_total=jml_total+${jml_buku}, jml_avail=jml_avail+${jml_buku}
        WHERE id_buku = ${id_buku}`)
    console.log(req.body)
    res.json('Stok buku berhasil ditambahkan.')
})

//Cari buku berdasarkan judul (GET)
app.get('/buku/search/title/:judul', async(req,res) => {
    let ret;
    const judul = req.params.judul
    dbPromise.query('SELECT * FROM buku WHERE judul=$1',[judul], (err,result) => {
        if (!err){
            ret={
                status:200,
                result: result.rows
            };
            res.status(200).json(ret)
        }
        else {
            ret={
                status:err.code,
                result: 'Data buku tidak ditemukan'
            };
            res.json(ret)
        }
    })
})

//Cari buku berdasarkan author (GET)
app.get('/buku/search/author/:author', async(req,res) => {
    let ret;
    const author = req.params.author
    dbPromise.query('SELECT * FROM buku WHERE author=$1',[author], (err,result) => {
        if (!err){
            ret={
                status:200,
                result: result.rows
            };
            res.status(200).json(ret)
        }
        else {
            ret={
                status:err.code,
                result: 'Data buku tidak ditemukan'
            };
            res.json(ret)
        }
    })
})

//Menampilkan semua data buku yang tersedia di perpustakaan
app.get('/buku/list/available',async(req, res) =>{
    let ret;
    dbPromise.query('SELECT id_buku, judul, author, lokasi, jml_avail FROM buku WHERE jml_avail<>0 ORDER BY id_buku', (err, result) => {
        if (!err){
            ret={
                status:200,
                result: result.rows
            };
            res.status(200).json(ret)
        }
        else {
            ret={
                status:err.code,
                result: 'Tidak ada buku yang tersedia saat ini.'
            };
            res.json(ret)
        }
    })
})

//display semua data buku
app.get('/buku/list/all',async(req, res) =>{
    let ret;
    dbPromise.query('SELECT * FROM buku ORDER BY id_buku', (err, result) => {
        if (!err){
            ret={
                status:200,
                result: result.rows
            };
            res.status(200).json(ret)
        }
        else {
            ret={
                status:err.code,
                result: 'Tidak ada data buku yang tersimpan.'
            };
            res.json(ret)
        }
    })
})

module.exports = app;