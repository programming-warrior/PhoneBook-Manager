const express=require('express');
const router=express.Router();
const dotenv=require('dotenv');
dotenv.config();
const jwt=require('jsonwebtoken');
const db = require('./db');


router.post('/signup',async (req,res)=>{
    console.log(req.body);
    //extract the user info from the req body
    const email=typeof(req.body.email)=='string'&& req.body.email.trim().length>0?req.body.email:false;
    let password= typeof(req.body.password)=='string' && req.body.password.trim().length>0?req.body.password:false;
    //validate them
    if(!email || !password){
        res.json({status:"400",message:"missing required field"});
    }
    else{
        //check if the user with the specified email exists already or not
        db.query("select * from users where email=?",[email],(err,result)=>{
            if(err){
                res.json({status:500,message:err.message});
            }
            else{
                if(result.length>0){
                    res.json({status:401,message:"user already exists"});
                }
                else{
                        //store them in the table
                        let sql="insert into users values(?)";
                        db.query(sql,[[email,password]],(err)=>{
                            if(err){
                                res.json({status:500,message:err.message});
                            }
                            else{
                                //create a token/session
                                const key=process.env.SECRET_KEY;
                                const token=jwt.sign({email},key);
                                //send the token to the client
                                res.cookie('token',token,{
                                    httpOnly:true,
                                }).json({status:201,token:token,message:"user created successfully"});
                            }
                        })
                }
            }
        })

         }

});

router.post('/login',(req,res)=>{
    //extract the user info from the req body
    const email=req.body.email;
    const password=req.body.password;
    console.log(email);
    console.log(password);
    //authenticate the user by searching in the table
    let sql="select * from users where email=?";
    db.query(sql,email,async(err,result)=>{
        if(err){
            res.json({status:500,message:err.message});
        }
        else{
            if(result.length>0){
                //authenticates the user
                console.log(result[0].password);
                const match=password==result[0].password?true:false;
                if(match==true){
                    //creates a token/session
                    const key=process.env.SECRET_KEY;
                    const token=jwt.sign({email},key);
                
                    //sent the token to the client
                    res.cookie('token',token,{
                        httpOnly:true
                    }).json({status:201,token,message:'you are successfully logged in'});
                    // res
                    // .cookie("access_token", token, {
                    //   httpOnly: true,
                    //   secure: process.env.NODE_ENV === "production",
                    // })
                }
                else{
                    res.json({status:401,message:"wrong credentials"});
                }
            }
            else{
                res.status(404).json({message:"no user found"});
            }
        }
    });
})

module.exports=router;