const express=require('express');
const router=express.Router();
const dotenv=require('dotenv');
dotenv.config();
const jwt=require('jsonwebtoken');
const db = require('./db');


router.get('/record/view',(req,res)=>{
    //extract info from the token
    const token=req.cookies.token;
    //validate the token
    jwt.verify(token,process.env.SECRET_KEY,(err,value)=>{
        if(err){
            res.status(403).json({message:"you are not authenticated"});
        }
        else{
            const email=value.email;
            const search=req.query.search;
            const sql="select phone,name from phonebook where email=? and (name like ? or phone like ?)";
            //look for search parameter while fetching records
            db.query(sql,[[email],[search+"%"],[search+"%"]],(err,result)=>{
                if(err){
                    res.status(500).json({message:err.message});
                }
                else{
                    if(result.length<=0){
                        res.status(404).json({message:"no records found"});
                    }
                    else{
                        res.status(200).json(result);
                    }
                }
            })
        }
    })
   
})

router.post('/record/create',(req,res)=>{
    const name=typeof(req.body.name)=='string' && req.body.name.trim().length>0 ? req.body.name: false;
    const phone=typeof(req.body.phone)=='string' && req.body.phone.trim().length>0? req.body.phone:false;

    if(!name || !phone){
        res.status(401).json({message:"missing required field"});
    } 
    else{
        //validate the token
        const token=req.cookies.token;
    
        jwt.verify(token,process.env.SECRET_KEY,(err,value)=>{
            if(err){
                res.status(403).json({message:"you are not authenticated"});
            }
            else{
                const email=value.email;
                //checking if the record with the email and phone exits
                db.query("select * from phonebook where email=? and phone=?",[[email],[phone]],(err,result)=>{
                    if(err){
                        res.status(500).json({message:err.message});
                    }
                    else{
                        if(result.length>0){
                            res.status(401).json({message:"phone already present"});
                        }
                        else{
                            // console.log(result);
                            const sql="insert into phonebook(email,name,phone) values(?,?,?)";
                           

                            db.query(sql,[[email],[name],[phone]],(err,result)=>{
                                if(err){
                                    res.status(500).json({message:err.message});
                                }
                                else{
                                  res.status(201).json({message:"record created"});
                                }
                            })
                        }
                    }
                })
               
            }
        })
    }
   
})



router.delete('/record/delete/:phone',(req,res)=>{
    //validate the token --> authenticate the user
    const token=req.cookies.token;
    jwt.verify(token,process.env.SECRET_KEY,(err,value)=>{
        if(err){
            res.status(403).json({"message": "you are not authenticated"});
        }
        else{
            const email=value.email;
            const phone=req.params.phone;
            if(email && phone){
                db.query('select* from phonebook where email=? and phone=?',[[email],[phone]],(err,result)=>{
                    if(err){
                        res.status(500);
                    }
                    else{
                        if(result.length<=0){
                            res.status(404);
                        }
                        else{
                            db.query('delete from phonebook where email=? and phone=?',[[email],[phone]],(err,result)=>{
                                if(err){
                                    res.status(500);
                                }
                                else{
                                    res.status(200).json({message:"record deleted"});
                                }
                            })
                        }
                    }
                })
            }
            else{
                res.status(401).json({message:"missing required fields"});
            }
        }
    })
})







module.exports=router;