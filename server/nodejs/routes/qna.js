const express = require('express');
var path = require('path');
var connection = require('../db');

const router = express.Router();

// 테스트용
router.get('/',(req,res)=>{ 
    // 로그인 되어 있다면
    if(req.session.user){
        res.sendFile(path.join(__dirname,'../html/qna.html'));
    }
    else {
        // 로그인이 안되어 있다면
        console.log("로그인 안 되어 있음");
        code = 204;
        message = `비회원입니다.`;
        res.json({'code':code, 'message':message});
    }
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
        id = req.session.user.id;
        content = req.body.content;
        mail = req.body.mail;

        // user db에서 usr idx 찾기
        var sql = 'select usr_idx from user where usr_id = ?';
        //usr_idx, usr_id, usr_pw, usr_name, usr_sex, usr_birth, usr_vegantype, usr_likeidx'

        connection.query(sql, id, function(err,result){
            if(err){
                res.json(err);
            }
            else{
                if(result.length===0){
                    code = 204;
                    message = '존재하지 않는 계정입니다';
                    res.json({'code':code, 'message':message});
                }else{
                    idx = result[0].usr_idx;
                    var qnasql = 'INSERT INTO qna (qna_content, qna_mail, user_usr_idx) VALUES(?, ?, ?)'
                    var params = [content, mail, idx];
                    // db에 삽입
                    connection.query(qnasql,params,function(err, result){
                        if(err){
                            console.log(err);
                            res.json(err);
                        }else{
                            code = 200;
                            message = `문의 글 올리기 성공`;
                            res.json({'code':code, 'message':message});
                        }
                    });
                }
            }
        });
    }
});

module.exports=router;