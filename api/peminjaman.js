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
//add peminjaman (POST) -- addNewTransaction
app.post('/peminjaman/add',async(req,res) => {
    try {
        const {id_anggota, id_buku} = req.body
        await dbPromise.query(`insert into transaksi(id_anggota, id_buku, tgl_mulai, tgl_kembali, status_pinjam)
         values(${id_anggota},${id_buku}, now(), now()+interval '14 days',TRUE)`)
        console.log(req.body)
        const resData = await dbPromise.query(`select * from transaksi order by id_transaksi desc limit 1`)
        res.json(resData.rows)
    } catch (error) {
        console.log(error)
        res.json('error')
    }
})

//update peminjaman ketika mengembalikan (PUT) -- updateTransaction
app.put('/peminjaman/update',async(req,res)=>{
    const {id_anggota, id_buku} = req.body
    await dbPromise.query(`update transaksi set status_pinjam = false, tgl_selesai = now(), denda= durasi_pinjam(tgl_kembali, current_date)*1000
    where id_anggota = '${id_anggota}' and id_buku = '${id_buku}' and status_pinjam= true`)
    console.log(req.body)
    const resData = await dbPromise.query(`select * from transaksi where tgl_selesai = current_date order by tgl_selesai desc limit 1`)
    res.json(resData.rows)
})

//menampilkan data peminjaman berdasarkan id anggota (GET) -- searchTransaction
app.get('/peminjaman/search/anggota/:id_anggota',async(req, res)=>{
    const id_anggota = req.params.id_anggota
    let ret;
    dbPromise.query(`select * from transaksi where id_anggota=$1 order by tgl_mulai desc`, [id_anggota], (err, result) => {
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
                result: 'Data peminjaman tidak ditemukan.'
            };
            res.json(ret)
        }
    })
})

//menampilkan data peminjaman berdasarkan id buku (GET) -- getTransactionList
app.get('/peminjaman/search/buku/:id_buku',async(req, res)=>{
    const id_buku = req.params.id_buku
    let ret;
    dbPromise.query('select * from transaksi where id_buku=$1 order by tgl_mulai desc', [id_buku], (err, result) => {
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
                result: 'Data peminjaman tidak ditemukan.'
            };
            res.json(ret)
        }
    })
})

//menampilkan seluruh data peminjaman (GET)
app.get('/peminjaman/list/all',async(req, res)=>{
    let ret;
    dbPromise.query('SELECT * FROM transaksi ORDER BY id_transaksi DESC', (err, result) => {
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
                result: 'Tidak ada data peminjaman yang tersimpan.'
            };
            res.json(ret)
        }
    })
})

module.exports = app;