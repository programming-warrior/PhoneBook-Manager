const express=require('express');
const router=express.Router();
const dotenv=require('dotenv');
dotenv.config();
const jwt=require('jsonwebtoken');
const db = require('./db');


router.get('/record/view',(req,res)=>{
    //extract info from the token
    const token=req.cookies.token;
    console.log(req.cookies);
    //validate the token
    jwt.verify(token,process.env.SECRET_KEY,(err,value)=>{
        if(err){
            res.status(403).json({message:"you are not authenticated"});
        }
        else{
            const email=value.email;
            console.log(email);
            const search=req.query.search;
            const sql="select phone,name from phonebook where email=? and name like ? or phone like ?";
            //look for search parameter while fetching records
            db.query(sql,[[email],[search+"%"],[search+"%"]],(err,result)=>{
                if(err){
                    res.status(500).json({message:err.message});
                }
                else{
                    if(result.length<0){
                        res.status(404).json({message:"no records found"});
                    }
                    else{
                        res.status(200).json(JSON.stringify(result[0]));
                    }
                }
            })
        }
    })
   
})

router.post('/record/create',(req,res)=>{
    const name=typeof(req.body.name)=='string' && req.body.name.trim().length>0 ? req.body.name: false;
    const phone=typeof(req.body.phone)=='string' && req.body.phone.trim().length>0? req.body.phone:false;

    console.log(name);
    console.log(phone);
    if(!name || !phone){
        res.status(401).json({message:"missing required field"});
    } 
    else{
        //validate the token
        const token=req.cookies.token;
        console.log(token);
        console.log(req.cookies);
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
                            const sql="insert into phonebook values(?,?,?)";
                           

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

router.put('/record/:phone/update',(req,res)=>{
    //validate the token
    const token=req.cookies.token;
    const phone=req.params.phone;
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
                        //update the record
                        const new_name=typeof(req.body.name)=='string' && req.body.name.trim().length>0 ? req.body.name:false;
                        const new_phone=typeof(req.body.phone)=='string' && req.body.phone.trim().length>0?req.body.phone:false;
                        //any of the two should not be false;
                        if(new_name || new_phone ){
                            const changeParam=new_name?"name":"phone";
                            const changeValue=new_name?new_name:new_phone;
                            db.query(`update phonebook set ${changeParam}=? where email=? and phone=?`,[[changeValue],[email],[phone]],(err,value)=>{
                                if(err){
                                    res.status(500).json({message:err.message});
                                }
                                else{
                                  res.status(201).json({message:"record updated"});
                                }
                            })
                        }
                        else{
                            res.status(401).json({message:"missing required field"});
                        }
                    }
                    else{
                        res.status(404).json({message:"record not found"});
                    }
                }
            })
           
        }
    })
    //extract the email out of the token
    //extract the record details out of the req.param
    //find the record in the table
    //update the record
});

router.delete('/record/delete',(req,res)=>{
    //validate the token --> authenticate the user
    //extract the details out of the token
    //extract the record details out of the req.param
    //find the record in the table
    //delete it
})







module.exports=router;