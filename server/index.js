const express=require('express');
const app=express();
const db=require('./db');
const router=require('./routes');
const cookieParser=require('cookie-parser');
const userRouter=require('./userRoutes');
const cors=require('cors');

const corsOptions ={
    origin:'http://localhost:3000',
    credentials:true,
}
app.use(cookieParser());
app.use(cors(corsOptions));

const PORT=8000;

app.use(express.json());

db.connect((err)=>{
    if(err){
        throw err;
    }
    console.log("mysql connected");
})

app.use(router);
app.use(userRouter);

app.listen(PORT,()=>{
    console.log(`app is listening on port ${PORT}`);
})