const mongoose = require('mongoose');
const colors = require("colors");
const connectdb = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONOGO_URI,{
            useNewUrlParser :true,
            useUnifiedTopology : true,
            
            
        });
        console.log(`MongoDb Connected : ${conn.connection.host}`.cyan.underline)
    }catch(error){
        console.log(`error :${error.message}`.red.bold)
        process.exit();
    }
};
module.exports = connectdb;
