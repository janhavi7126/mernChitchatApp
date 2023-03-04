const asynchandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asynchandler(async(req,res)=>{
    const {name,email,password,pic} = req.body;
    console.log(req.body);

    if(!email || !name || !password){
        res.status(400);
        throw new Error("ok Please Enter all the fields")
    }

    const userExists = await User.findOne({email});

    if(userExists){
        res.status(400);
        throw new Error("User already Exist");
    }

    const user = await User.create({
            name,
            email,
            password,
            pic
            

        });

        if(user){
            console.log("creating")
            res.json({
                _id :user._id,
                name:user.name,
                email:user.email,
                token:generateToken(user._id),
                pic : user.pic,
                
            });
        }else{
            res.status(400);
            throw new Error("Failed to Create User")
        }

});

const authUser = asynchandler(async(req,res) =>{

    const {email,password} = req.body;
    // console.log(req.body);
    const user = await User.findOne({email});
    
    if(user && (await user.matchPassword(password))){
        res.json({
            _id :user._id,
            name:user.name,
            email:user.email,
            pic : user.pic,
            token:generateToken(user._id)
        });
    }else{
        res.status(401);
        throw new Error("Failed to Create User")
    }

})

const allUser = asynchandler(async(req,res)=>{
    console.log(req.body)
    const keyword = req.query.search ?{
        $or:[
            {name:{$regex: req.query.search, $options: "i"}},
            {email:{$regex: req.query.search, $options: "i"}}
            
        ]
    }  :
    {};
    
    const users = await User.find(keyword).find({ _id :{ $ne: req.user._id}})
    res.send(users)
    console.log(users)
});

module.exports = {registerUser,authUser,allUser}