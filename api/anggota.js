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
//add anggota baru (POST)
app.post('/anggota/register',async(req,res) => {
    try {
        //const id_umum = req.params.id_umum
        const {nama, alamat, no_hp, email, pekerjaan} = req.body
        await dbPromise.query(`insert into umum(nama, alamat, no_hp, email, pekerjaan)
            values('${nama}','${alamat}','${no_hp}','${email}','${pekerjaan}')`)
        console.log(req.body)
        const resData = await dbPromise.query(`select * from umum order by id_umum desc limit 1`)
        res.json(resData.rows)
    } catch (error) {
        console.log(error)
        res.json('error')
    }
})

//cek validasi anggota berdasarkan id umum (GET)
app.get('/anggota/umum/:id_umum', async(req,res) => {
    let ret;
    const id_umum = req.params.id_umum
    dbPromise.query('SELECT * FROM umum WHERE id_umum=$1',[id_umum], (err, result) => {
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
                result: 'Nomor identitas tidak terdaftar.'
            };
            res.json(ret)
        }
    }) 
})

//cek validasi anggota berdasarkan nim (GET)
app.get('/anggota/mahasiswa/:nim', async(req,res) => {
    let ret;
    const nim = req.params.nim
    dbPromise.query('SELECT * FROM mahasiswa WHERE nim=$1',[nim], (err, result) => {
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
                result: 'NIM tidak valid.'
            };
            res.json(ret)
        }
    }) 
})

//display semua data mahasiswa
app.get('/anggota/mahasiswa', async(req,res) => {
    let ret;
    dbPromise.query('SELECT * FROM mahasiswa', (err, result) => {
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
                result: 'Tidak ada data mahasiswa yang tersimpan.'
            };
            res.json(ret)
        }
    }) 
})

//display semua data umum
app.get('/anggota/umum', async(req,res) => {
    let ret;
    dbPromise.query('SELECT * FROM umum', (err, result) => {
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
                result: 'Tidak ada data anggota non-mahasiswa ITB yang disimpan.'
            };
            res.json(ret)
        }
    })
}) 

module.exports = app;