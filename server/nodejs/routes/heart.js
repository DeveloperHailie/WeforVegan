// 넘어온 값이 빈값인지 체크합니다.
// !value 하면 생기는 논리적 오류를 제거하기 위해
// 명시적으로 value == 사용
// [], {} 도 빈값으로 처리
var isEmpty = function(value){
    if (value === null) 
        return true 
    if (typeof value === 'undefined') 
        return true 
    if (typeof value === 'string' && value === '') 
        return true 
    if (Array.isArray(value) && value.length < 1) 
        return true 
    if (typeof value === 'object' && value.constructor.name === 'Object' && Object.keys(value).length < 1 && Object.getOwnPropertyNames(value) < 1) 
        return true 
    if (typeof value === 'object' && value.constructor.name === 'String' && Object.keys(value).length < 1) 
        return true 
    return false
};

const express = require('express');
var path = require('path');
var connection = require('../db');

const router = express.Router();

const userDB = function(req,res){
    // userDB에서 해당 USER 찾아서 좋아요 정보 가져옴
    return new Promise((resolve, reject)=>{
        var sql = 'select usr_likeidx from user where usr_id = ?';
        //usr_idx, usr_id, usr_pw, usr_name, usr_sex, usr_birth, usr_vegantype, usr_likeidx
        var id = req.session.user.id;
        connection.query(sql, id, function(err, result){
            if(err){
                reject(err);
            }
            else{
                if(result.length===0){
                    code = 204;
                    message = '비회원입니다';
                    resolve({'code':code, 'message':message});
                }
                else{
                    // 레시피 idx 정상적으로 가져옴
                    // 인덱스 토그나이저
                    var rp_idx_like = result[0].usr_likeidx;
                    if(isEmpty(rp_idx_like) || rp_idx_like===''){
                        //rp_idx_like='';
                        console.log("rp_idx_like");
                        console.log(rp_idx_like);
                        resolve({'apirecipe':{}, 'snsrecipe':{}});
                    }
                    else{
                        idx_list = rp_idx_like.split(',');
                        for(i=0;i<idx_list.length;i++){
                            idx_list[i] = idx_list[i].replace(' ','');
                        }
                        console.log("userDB: "+idx_list);
                        resolve(idx_list);
                    }
                }
            }
        });
    });
};

const recipeDB = function(req,res,data){
    // data = ['1','2', ...]
    // recipeDB에서 각 data 인덱스에 해당하는 레시피 entry 가져오기 
    return new Promise((resolve, reject)=>{
        recipesql = 'select * from recipe where rp_idx in(';
        for(i=0;i<data.length;i++){
            recipesql = recipesql + "?";
            if(i!=(data.length-1))
                recipesql = recipesql + ",";
        }
        recipesql = recipesql + ")";
        api_recipe=[];
        sns_recipe=[];
        connection.query(recipesql, data, function(err, result){
            if(err){
                reject(err);
            }
            else{
                if(result.length===0){
                    resolve({'code':204, 'message':'존재하지 않는 레시피입니다.'});
                }
                else{
                    for(i=0;i<result.length;i++){
                        rp_idx=result[i].rp_idx;
                        rp_name=result[i].rp_name;
                        rp_source=result[i].rp_source;
                        if(rp_source==='api'){
                            api_recipe.push({'rp_idx':rp_idx,'rp_name':rp_name,'rp_source':rp_source});
                            console.log('2:');
                            console.log(api_recipe);
                        
                        }
                        else{
                            sns_recipe.push({'rp_idx':rp_idx,'rp_name':rp_name,'rp_source':rp_source});
                            console.log('3:');
                            console.log(sns_recipe);
                        }
                    }
                    resolve({'api_recipe':api_recipe, 'sns_recipe':sns_recipe});
                }
            }
        });
    });
};

const apiDB = function(req,res,data){
    return new Promise((resolve, reject)=>{
        // data = {'api_recipe':api_recipe, 'sns_recipe':sns_recipe};
        // data.api_recipe 배열에 있는 각 인덱스
        // apiDB에서 찾아서 entry를 모음
        // data.api_recipe를 찾은 것으로 바꾸기

        //api_recipe가 있는 경우
        api_recipe_idx = [];
        if(data.api_recipe.length>0){
            apisql = 'select * from apirecipe where recipe_rp_idx in (';
            for(i=0;i<data.api_recipe.length;i++){
                apisql = apisql + "?";
                api_recipe_idx.push(data.api_recipe[i].rp_idx);
                if(i!=(data.api_recipe.length-1))
                    apisql = apisql + ",";
            }
            apisql = apisql + ")";
            apirecipe_all = [];
            connection.query(apisql, api_recipe_idx, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    if(result.length===0){
                        resolve({'code':204, 'message':'존재하지 않는 레시피입니다.'});
                    }
                    else{
                        for(i=0;i<result.length;i++){
                            apirecipe_all.push({
                                'recipe_rp_idx':result[i].recipe_rp_idx,
                                'recipe_rp_name':result[i].recipe_rp_name,
                                'recipe_rp_source':result[i].recipe_rp_source,
                                'api_category' : result[i].api_category,
                                'api_howtocook' : result[i].api_howtocook,
                                'api_carbohydrate' : result[i].api_carbohydrate,
                                'api_protein' : result[i].api_protein,
                                'api_hashtag' : result[i].api_hashtag,
                                'api_imgurlsmall' : result[i].api_imgurlsmall,
                                'api_imgurlbig' : result[i].api_imgurlbig,
                                'api_recipe' : result[i].api_recipe,
                                'api_ingredient' : result[i].api_ingredient,
                                'api_calorie' : result[i].api_calorie
                            });
                        }
                        data.api_recipe = apirecipe_all;
                        console.log("apiDB: ", data);
                        resolve(data);
                    }
                }
            });
        }
        else{
            data.api_recipe=[];
            console.log("apiDB: ", data);
            resolve(data);
        }
    });
};

const snsDB = function(req,res,data){
    return new Promise((resolve, reject)=>{
        // data.sns_recipe 배열에 있는 각 인덱스
        // snsDB에서 찾아서 entry를 모음
        // data.sns_recipe를 찾은 것으로 바꾸기

        if(data.sns_recipe.length>0){
            snssql = "select * from snsrecipe where recipe_rp_idx in (";
            sns_recipe_idx = [];
            for(i=0;i<data.sns_recipe.length;i++){
                snssql = snssql + '?';
                sns_recipe_idx.push(data.sns_recipe[i].rp_idx);
                if(i!=(data.sns_recipe.length-1))
                    snssql = snssql + ',';
                    console.log("sql: "+snssql);
            }
            snssql = snssql + ')';
            console.log("sql: "+snssql);
            snsrecipe_all = [];
            connection.query(snssql, sns_recipe_idx, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    if(result.length===0){
                        resolve({'code':204, 'message':'존재하지 않는 레시피입니다.'});
                    }
                    else{
                        for(i=0;i<result.length;i++){
                            snsrecipe_all.push({
                                'recipe_rp_idx':result[i].recipe_rp_idx,
                                'recipe_rp_name':result[i].recipe_rp_name,
                                'recipe_rp_source':result[i].recipe_rp_source,
                                'sns_url' : result[i].sns_url,
                                'sns_imgurl' : result[i].sns_imgurl
                            });
                        }

                        data.sns_recipe = snsrecipe_all;
                        console.log("snsDB: ", data);
                        resolve(data);
                    }
                }
            });
        }
        else{
            //sns_recipe없는 경우
            data.sns_recipe = [];
            console.log("snsDB: ", data);
            resolve(data);
        }
        
    });
};


// 좋아요 조회
router.get('/',(req,res)=>{
    // 로그인 되어 있다면
    if(req.session.user){
        userDB(req,res).then((data)=>{
            console.log("UDB 성공");
            // 좋아요 누른 항목이 없거나, 로그인 하지 않은 경우
            if(JSON.stringify(data)==="{\"apirecipe\":{},\"snsrecipe\":{}}"||JSON.stringify(data)==="{\"code\":204,\"message\":\"비회원입니다\"}"){
                console.log("if1");
                return res.json(data);
            }
            console.log("return1");
            // 좋아요 누른 항목이 있음
            return recipeDB(req,res,data)})
        .then((data)=>{
            console.log("RDB 성공");
            // 레시피 인덱스가 잘못된 경우
            if(JSON.stringify(data)==="{\"code\":204,\"message\":\"존재하지 않는 레시피입니다.\"}"){
                return res.json(data);
            }
            // data = {'api_recipe':api_recipe, 'sns_recipe':sns_recipe};
            return apiDB(req,res,data);})
        .then((data)=>{
            console.log("ADB 성공");
            // 레시피 인덱스가 잘못된 경우
            if(JSON.stringify(data)==="{\"code\":204,\"message\":\"존재하지 않는 레시피입니다.\"}"){
                return res.json(data);
            }
            return snsDB(req,res,data);})
        .then((data)=>{
            console.log("SDB 성공");
            // 레시피 인덱스가 잘못된 경우
            if(JSON.stringify(data)==="{\"code\":204,\"message\":\"존재하지 않는 레시피입니다.\"}"){
                return res.json(data);
            }
            return res.json(data);})
        .catch((err)=>{
            console.log(err);
            res.json(err);
        });
    }else{// 로그인 되지 않은 경우
        console.log("로그인 안 되어 있음");
        code = 204;
        message = `비회원입니다`;
        res.json({'code':code, 'message':message});
    }
});

// 좋아요 등록
router.post('/add',(req,res)=>{
    // /heart/add 를 post방식으로 보낸다면
    // body에는 rp_idx가 들어있음

    // 로그인 되어 있다면
    if(req.session.user){
        // userDB에서 해당 user 찾아서 좋아요 정보 가져옴
        var sql = 'select usr_likeidx from user where usr_id = ?';
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
                    var rp_idx_like = '';
                    if(isEmpty(result[0].usr_likeidx) || result[0].usr_likeidx==="")
                        rp_idx_like = " " + req.body.rp_idx + ", ";
                    else{
                        rp_idx_like = result[0].usr_likeidx + req.body.rp_idx + ", ";
                    }
                    var updateSQL = 'UPDATE user SET usr_likeidx=? WHERE usr_id=?';
                    var param = [rp_idx_like,id];
                    connection.query(updateSQL,param,function(err, result){
                        // 좋아요정보가져온거+req에 있는거 해서 userDB UPDATE
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
                                message = '수정 완료';
                                res.json({'code':code, 'message':message});
                            }
                        }
                    });                       
                }  
            }              
        });
    }
    else {
        // 로그인이 안되어 있다면
        console.log("로그인 안 되어 있음");
        code = 204;
        message = `비회원입니다.`;
        res.json({'code':code, 'message':message});
    }
});


// 좋아요 삭제
router.post('/cancle',(req,res)=>{
    // /heart/cancle 를 post방식으로 보낸다면
    // body에는 rp_idx가 들어있음
    // 로그인 되어 있다면
    if(req.session.user){
        // userDB에서 해당 user 찾아서 좋아요 정보 가져옴
        var sql = 'select usr_likeidx from user where usr_id = ?';
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
                    // 가져온 result[0].usr_likeidx에서 req.body.rp_idx 삭제
                    rp_idx_like = result[0].usr_likeidx;
                    console.log(rp_idx_like);
                    remove = " "+req.body.rp_idx+",";
                    console.log(remove);
                    rp_idx_like = rp_idx_like.replace(remove,'');
                    console.log(rp_idx_like);

                    var updateSQL = 'UPDATE user SET usr_likeidx=? WHERE usr_id=?';
                    var param = [rp_idx_like,id];
                    connection.query(updateSQL,param,function(err, result){
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
                                message = '수정 완료';
                                res.json({'code':code, 'message':message});
                            }
                        }
                    });                       
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

// 좋아요 테스트
router.get('/test', (req,res)=>{
    console.log(req.session);
    if(!req.session.user){
        res.send(`로그인 먼저 하세요.`);
    }
    else
        res.sendFile(path.join(__dirname,'../html/heart.html'));
});


module.exports=router;