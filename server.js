const express = require('express');
const path = require('path');
const mysql = require('mysql')

const app = express();
app.listen(5000,()=>{
    console.log("Server is Listening : 5000")
})

// static assets
app.use(express.static(path.resolve(__dirname,'static_files')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//database connection
require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT


const data_con = mysql.createPool({
    connectionLimit: 100,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
})
 

// login post
app.post('/login', async (req,res)=>{
    try {
        let enroll_id = req.body.enroll_id;
        let Pass = req.body.password;

        if(User && Pass) {
            data_con.query('SELECT * from Accounts where enroll_id = ? AND password = ?',[enroll_id,Pass],function(err,result,fields){
                if(err) throw err;
                if(result.length != 0) {
                    res.redirect('/home')
                } else {
                    res.send('<script>alert("Invalid Creds !!!!");</sctipt>')
                }

                res.end();
            });
        } else {
            res.sendStatus(401).sendDate('<script>alert("Creds Required !!!!");</script>');
            res.end();
        }
    } catch {
        res.sendStatus(500).sendDate('<h1>Internal Server Error !! </h1>')
    }
})

app.post('/signup', async (req,res)=> {
    const user = req.body.user;
    const enroll_id = req.body.enroll_id;
    const password = req.body.password;

    data_con.getConnection( async(err,con) => {
        if(err) throw err;

        //query
        const searchQ = mysql.format("SELECT * FROM Accounts WHERE enroll_id = ?",[enroll_id])
        await con.query(searchQ, async(err,result)=>{
            if(err) throw err;
            if(result.length != 0) {
                con.release();
                res.sendStatus(409).send('<script>alert("User Exists !!!");</script>')
            } else {
                const insertQ = mysql.format("INSERT INTO Accounts VALUES (?,?,?)",[enroll_id,user,password])
                await con.query(insertQ,(err,result)=>{
                    con.release()
                    if(err) throw err;
                    res.sendStatus(201).send('<script>alert("Registered !!!!")</script>')
                    res.redirect('/')
                })
            }
        })
    })
})

app.all('*',(req,res)=>{
    res.status(404).send("<h1>Oops , Page Not Found !!!</h1>")
})
