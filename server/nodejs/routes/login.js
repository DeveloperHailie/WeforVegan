const express = require('express');
var path = require('path');
var connection = require('../db');


const router = express.Router();


// test용으로 get
router.get('/',(req,res)=>{
    console.log(req.session);
    if(req.session.user){
        console.log("쿠키");
        console.log(req.cookies);
        console.log(req.session);
        console.log(req.session.id);
        console.log("이미 로그인 되어 있음");
        res.send(`${req.session.user.id}님 이미 접속 되어 있음.<a href="/logout">logout</a>`);
        return;
    }
    res.sendFile(path.join(__dirname,'../html/login.html'));
});

router.post('/',(req,res) => 
{

    if(req.session.user){
        console.log("이미 로그인 되어 있음");
        console.log(req.session.user.id);
        code = 204;
        message = `중복 로그인`;
        res.json({'code':code, 'message':message});
    }
    else{
        var id = req.body.id;
        var pwd = req.body.pwd;
        var sql = 'select * from user where usr_id = ?';
        //usr_idx, usr_id, usr_pw, usr_name, usr_sex, usr_birth, usr_vegantype, usr_likeidx'

        connection.query(sql, id, function(err,result){
            if(err){
                res.json(err);
            }
            else{
                if(result.length===0){
                    code = 204;
                    message = '존재하지 않는 계정입니다.';
                    res.json({'code':code, 'message':message});
                    req.session.destroy();
                }
                else if(pwd !== result[0].usr_pw){
                    code = 204;
                    message = '비밀번호가  틀렸습니다.';
                    res.json({'code':code, 'message':message});
                    req.session.destroy();
                }else{
                    code = 200;
                    message = `로그인 성공`;
                    req.session.user = {
                        id : req.body.id,
                        login : true
                    }
                    req.session.save(()=>{
                        console.log("로그인");
                        res.json({'code':code, 'message':message});
                    });  
                }
            }
        });
    }
});

module.exports=router;