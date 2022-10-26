const express = require('express');
const { resolve } = require('path');
var path = require('path');
const { checkServerIdentity } = require('tls');
var connection = require('../db');
const router = express.Router();
//const Drand = require('drand');

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
function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
    //var r = new Drand(Date.now());
    //return r.randInt(min,max);
    return Math.floor(Math.random() * (max - min)) + min;
}



const userDB = function(req,res){
    // userDB에서 USER들이 좋아요 누른 레시피 인덱스 가져오기
    return new Promise((resolve, reject)=>{
        var sql = 'select usr_likeidx from user';
        // 인덱스 저장할 배열
        var all_usr_idx_list = []
        connection.query(sql, function(err, result){
            if(err){
                reject(err);
            }
            else{
                // 각 user의 좋아요 누른 인덱스 가져와서 split
                var user;
                for(user=0;user<result.length;user++){
                    var rp_idx_like = result[user].usr_likeidx;
                    // 좋아요를 누르지 않은 user라면
                    if(isEmpty(rp_idx_like) || rp_idx_like==='' || rp_idx_like === ' '){
                        continue;
                    }
                    // 인덱스 토그나이저
                    idx_list = rp_idx_like.split(',');
                    for(i=0;i<idx_list.length;i++){
                        idx_list[i] = idx_list[i].replace(' ','');
                    }
                    // 기존에 좋아요 눌린 적 있는 레시피라면 count ++
                    var j, j2, count, exist;
                    for(j=0;j<idx_list.length;j++){
                        exist = false;
                        // idxlist 있다면
                        if(idx_list[j]=='')
                            continue;    
                        for(j2=0;j2<all_usr_idx_list.length;j2++){
                            // 기존에 좋아요 눌린 적 있다면
                            if(all_usr_idx_list[j2][0]==idx_list[j]){
                                count = all_usr_idx_list[j2][1]+1;
                                all_usr_idx_list[j2][1] = count;
                                exist = true;
                                break;
                            }
                        }
                        // 기존에 눌린 적 없다면
                        if(exist==false){
                            all_usr_idx_list.push([idx_list[j],1]);
                        }
                    }
                }
                resolve(all_usr_idx_list);
            }
        });
    });
};

const recipeDB = function(req,res,data){
    // data = [[인덱스,카운트], ...]
    // recipeDB에서 각 data 인덱스에 해당하는 레시피 entry 가져오기 
    // api , sns 레시피로 나누고
    // 가장 많이 좋아요 눌린 api, sns 레시피 상위 3개 결정
    // 없으면 그냥 비워두기
    return new Promise((resolve, reject)=>{
        if(data.length==0){
            resolve({ 'api_recipe': [], 'sns_recipe': [] });
        }
        else{
            recipesql = 'select * from recipe where rp_idx in(';
            for(i=0;i<data.length;i++){
                recipesql = recipesql + "?";
                if(i!=(data.length-1))
                    recipesql = recipesql + ",";
            }
            recipesql = recipesql + ")";

            api_recipe = [];
            sns_recipe = [];
            api_idx = [];
            sns_idx = [];

            // data 의 0번째 애들만 all_idx에 넣기
            all_idx = []
            var j;
            for(j=0;j<data.length;j++){
                all_idx.push(data[j][0]);
            }

            connection.query(recipesql, all_idx, function(err, result){
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
                                api_idx.push(rp_idx);
                            }
                            else{
                                sns_idx.push(rp_idx);
                            }
                            var index, ai, si;
                            api = []
                            sns = []
                            for(index=0;index<data.length;index++){
                                for(ai=0;ai<api_idx.length;ai++){
                                    if(data[index][0]==api_idx[ai]){
                                        api.push([api_idx[ai],data[index][1]]);
                                    }
                                }
                                for(si=0;si<sns_idx.length;si++){
                                    if(data[index][0]==sns_idx[si]){
                                        sns.push([sns_idx[si],data[index][1]]);
                                    }
                                }
                            }
                        }

                        // api_recipe, sns_recipe에 상위 애들만 저장
                        // api : (api_idx, count)
                        // 3개 이하면 api_recipe = api_idx
                        if (api.length < 4) {
                            api_recipe = api_idx;
                        }
                        else { // 3개보다 많으면 상위 3개 구하기
                            // sorting 후
                            api.sort(function (a, b) { // 오름차순
                                return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0;
                            });
                            // [0],[1],[2]를 api_recipe에 저장                            
                            api_recipe.push(api[0][0]);
                            api_recipe.push(api[1][0]);
                            api_recipe.push(api[2][0]);
                        }

                        // sns : (sns_idx, count)
                        // 3개 이하
                        if (sns.length < 4) {
                            sns_recipe = sns_idx;
                        }
                        else { // 3개보다 많음
                            // sorting 후
                            sns.sort(function (a, b) { // 오름차순
                                return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0;
                            });
                            // [0],[1],[2]를 api_recipe에 저장
                            sns_recipe.push(sns[0][0]);
                            sns_recipe.push(sns[1][0]);
                            sns_recipe.push(sns[2][0]);
                        }
                        resolve({ 'api_recipe': api_recipe, 'sns_recipe': sns_recipe });
                    }
                }
            });
        }

        
    });
};

const apiDB = function(req,res,data){
    return new Promise((resolve, reject)=>{
        // data = {"api_recipe":[752],"sns_recipe":[150,2,23]}
        // apiDB에서 찾아서 entry를 모음
        // data.api_recipe를 찾은 것으로 바꾸기
        //api_recipe가 있는 경우

        //entry가 들어갈 리스트
        apirecipe_all = [];

        if(data.api_recipe.length>0){
            apisql = 'select * from apirecipe where recipe_rp_idx in (';
            for(i=0;i<data.api_recipe.length;i++){
                apisql = apisql + "?";
                if(i!=(data.api_recipe.length-1))
                    apisql = apisql + ",";
            }
            apisql = apisql + ")"; 
            connection.query(apisql, data.api_recipe, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    if(result.length>0){
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
                    }
                   data.api_recipe = apirecipe_all;
                   resolve(data);
                }
            });
        }
        else{
            resolve(data);
        }  
    });
};

const rand_apiDB = function(req,res,data){
    return new Promise((resolve, reject)=>{
        // data = {"api_recipe":[{~~},{~~},{~~}],"sns_recipe":[150,2,23]}
        if(data.api_recipe.length<3){ // api_recipe가 2개 이하인 경우
            var randCount = 3-data.api_recipe.length;
            // randCount개수만큼 entry 구하기
            var sql = 'select * from apirecipe';
            connection.query(sql, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    rand = []
                    var i;
                    for(i=0;i<randCount;i++){
                        rand[i] = getRandomInt(0,result.length-1);
                        if(i>0){
                            while(rand[i-1]==rand[i]){
                                rand[i] = getRandomInt(0,result.length-1);
                                console.log("random index 중복");
                            }
                        }
                    }
                    for(i=0;i<rand.length;i++){
                        data.api_recipe.push({
                            'recipe_rp_idx':result[rand[i]].recipe_rp_idx,
                            'recipe_rp_name':result[rand[i]].recipe_rp_name,
                            'recipe_rp_source':result[rand[i]].recipe_rp_source,
                            'api_category' : result[rand[i]].api_category,
                            'api_howtocook' : result[rand[i]].api_howtocook,
                            'api_carbohydrate' : result[rand[i]].api_carbohydrate,
                            'api_protein' : result[rand[i]].api_protein,
                            'api_hashtag' : result[rand[i]].api_hashtag,
                            'api_imgurlsmall' : result[rand[i]].api_imgurlsmall,
                            'api_imgurlbig' : result[rand[i]].api_imgurlbig,
                            'api_recipe' : result[rand[i]].api_recipe,
                            'api_ingredient' : result[rand[i]].api_ingredient,
                            'api_calorie' : result[rand[i]].api_calorie
                        });
                    }
                    resolve(data);
                }
            });
        }
        else{
            resolve(data);
        } 
    });           
};

const snsDB = function(req,res,data){
    return new Promise((resolve, reject)=>{
        // data = {"api_recipe":[~,~],"sns_recipe":[150,2,23]}
        // data.sns_recipe 배열에 있는 각 인덱스
        // snsDB에서 찾아서 entry를 모음
        // data.sns_recipe를 찾은 것으로 바꾸기

        //entry가 들어갈 리스트
        snsrecipe_all = [];

        if(data.sns_recipe.length>0){
            snssql = "select * from snsrecipe where recipe_rp_idx in (";
            sns_recipe_idx = [];
            for(i=0;i<data.sns_recipe.length;i++){
                snssql = snssql + '?';
                if(i!=(data.sns_recipe.length-1))
                    snssql = snssql + ',';
            }
            snssql = snssql + ')';
            connection.query(snssql, data.sns_recipe, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    if(result.length>0){
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
                        resolve(data);
                    }
                }
            });
        }else{
            resolve(data);
        }
    });
};

const rand_snsDB = function(req,res,data){
    return new Promise((resolve, reject)=>{
        if(data.sns_recipe.length<3){
            var randCount = 3 - data.sns_recipe.length;
            var sql = 'select * from snsrecipe';
            connection.query(sql, function(err, result){
                if(err){
                    reject(err);
                }
                else{
                    rand=[];
                    var i;
                    for(i=0;i<randCount;i++){
                        rand[i] = getRandomInt(0, result.length-1);
                        if(i>0){
                            while(rand[i-1]==rand[i]){
                                rand[i] = getRandomInt(0,result.length-1);
                                console.log("random index 중복");
                            }
                        }
                    }
                    for(i=0;i<rand.length;i++){
                        data.sns_recipe.push({
                            'recipe_rp_idx':result[i].recipe_rp_idx,
                            'recipe_rp_name':result[i].recipe_rp_name,
                            'recipe_rp_source':result[i].recipe_rp_source,
                            'sns_url' : result[i].sns_url,
                            'sns_imgurl' : result[i].sns_imgurl
                        });
                    }
                    resolve(data);
                }
            });
        }else{
            resolve(data);
        }
    });
};

// 가장 좋아요 개수 많은 레시피 상위 6개 조회 (api 3개, sns 3개)
router.get('/',(req,res)=>{
    // 로그인 되어 있다면
    if(req.session.user){
        userDB(req,res).then((data)=>{
            console.log("UDB 성공");
            // data = [[1:2],[3:4],[5:4]] <= 모든 유저들이 좋아요 누른 [레시피의 인덱스:좋아요개수]의 배열
            return recipeDB(req,res,data)})
        .then((data)=>{
            console.log("RDB 성공");
            console.log(data);
            // data = {"api_recipe":[752],"sns_recipe":[150,2,23]}
            return apiDB(req,res,data);})
        .then((data)=>{
            console.log("ADB 성공");
            // data = {"api_recipe":[{...},{...},{...}],"sns_recipe":[150,2,23]}
            return rand_apiDB(req,res,data);})
        .then((data)=>{
            console.log("randADB 성공");
            // data = {"api_recipe":[{...},{...},{...}],"sns_recipe":[150,2,23]}
            return snsDB(req,res,data);})
        .then((data)=>{
            console.log("SDB 성공");
            return rand_snsDB(req,res,data);
        })
        .then((data)=>{
            console.log("randSDB 성공");
            console.log(data);
            res.json(data);})
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


module.exports=router;