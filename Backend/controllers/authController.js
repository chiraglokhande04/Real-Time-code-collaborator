exports.loginSuccess = async(req,res)=>{
    try{
        if(req.user){
            res.status(200).json({message:"User Logged In",user:req.user})
        }else{
            res.status(400).json({message:"Not Authorize"})
        }

    }catch(err){
        console.log('ERR in login success controller: ',err)
    }
}

exports.logout = async(req,res,next)=>{
    try{
        req.logout(function(err){
            if(err){
                return next(er)
            }
            res.redirect('http://localhost:5000')
        })

    }catch(err){
        console.log('err in logout controller: ',err)
    }
}