const express = require('express');
var path = require('path');
var connection = require('../db');

const router = express.Router();

// 조회용
router.get('/',(req,res)=>{
    // 로그인 되어 있다면
    if(req.session.user){
        // userDB에서 해당 user 찾아서
        var sql = 'select * from user where usr_id = ?';
        //usr_idx, usr_id, usr_pw, usr_name, usr_sex, usr_birth, usr_vegantype, usr_likeidx
        var id = req.session.user.id;
        connection.query(sql, id, function(err, result){
            if(err){
                res.json(err);
            }
            else{
                if(result.length===0){
                    code = 204;
                     message = '존재하지 않는 계정입니다.';
                     res.json({'code':code, 'message':message});
                }
                else{
                    code = 200;
                    message = {
                        'usr_id' : result[0].usr_id,
                        'usr_pw' : result[0].usr_pw,
                        'usr_name' : result[0].usr_name,
                        'usr_sex' : result[0].usr_sex,
                        'usr_birth' : result[0].usr_birth,
                        'usr_vegantype' : result[0].usr_vegantype,
                        'usr_likeidx' : result[0].usr_likeidx
                    };
                    // 정보 전달
                     res.json({'code':code, 'message':message});                           
                }  
            }              
        });
    }
    else {
        // 로그인이 안되어 있다면
        console.log("로그인 안 되어 있음");
        code = 204;
        message = `비회원입니다`;
        res.json({'code':code, 'message':message});
    }
});

// mypage 수정 테스트 
router.get('/test', (req,res)=>{
    console.log(req.session);
    if(!req.session.user){
        res.send(`비회원입니다`);
    }
    else
        res.sendFile(path.join(__dirname,'../html/mypage.html'));
});

// 수정용
router.post('/',(req,res) => 
{
    if(!req.session.user){
        // 로그인이 안되어 있다면
        console.log("로그인 안 되어 있음");
        code = 204;
        message = `비회원입니다`;
        res.json({'code':code, 'message':message});
    }
    else{
        originID = req.session.user.id;
        id = req.body.id;
        pwd = req.body.pwd;
        name = req.body.name;
        /*
        if(req.body.sex=='여자')
            sex = 'F';
        else
            sex = 'M';
        birth = req.body.birth;*/
        vegantype = req.body.vegantype;
        var sql = 'UPDATE user SET usr_id=?, usr_pw=?, usr_name=?, usr_vegantype=? WHERE usr_id=?' 
        //usr_idx, usr_id, usr_pw, usr_name, usr_sex, usr_birth, usr_vegantype, usr_likeidx
        var params = [id, pwd, name, vegantype, originID];
        // db에 삽입
        connection.query(sql,params,function(err, result){
            if(err){
                console.log(err);
                if(err.code=="ER_DUP_ENTRY")
                    message = '아이디 중복';
                else
                    message = err;
                res.json({'code':204, 'message':message});
            }else{
                req.session.user.id = id;
                resultCode=200;
                code = 200;
                message = `정보 수정 성공`;
                res.json({'code':code, 'message':message});
            }
        });
    }
});

module.exports=router;