# -*- coding: utf-8 -*-
import numpy as np
import cv2
from urllib.request import urlopen
import tensorflow as tf
import pymysql
print(tf.__version__)


def url2img(url) :
    resp = urlopen(url)
    image=np.asarray(bytearray(resp.read()), dtype="uint8")
    image=cv2.imdecode(image, cv2.IMREAD_COLOR)
    image = cv2.resize(image, dsize=(224, 224), interpolation=cv2.INTER_AREA)
    return image

def loadModel(model) :
    np.set_printoptions(suppress=True)
    classifierLoad = tf.keras.models.load_model(model)
    return classifierLoad 

# DB 연결
connect = pymysql.connect(host="ㅇㅇㅇ",
                          port=000, user="ㅇㅇㅇ", password="ㅇㅇㅇ", db="ㅇㅇㅇ")
cursor = connect.cursor()

# DB에서 사진 url 가져오기
select_sql = "SELECT sns_imgurl,recipe_rp_idx FROM snsrecipe WHERE recipe_rp_source LIKE 'instagram'"
cursor.execute(select_sql)
rows = cursor.fetchall()

# model path 설정 및 model load
model_path = "keras_model.h5"
model = loadModel(model_path)

for row in rows :
    # 이미지 url 저장
    url = row[0]    
    print()
    # url -> image -> data
    try:
        image = url2img(url)
        image_array = np.asarray(image)
        normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1
        data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
        # 이미지를 배열로
        data[0] = normalized_image_array
        print(row[0],row[1])
        # predict -> y에 저장
        y = model.predict_classes(data)
        # 0 == human, 1 == food
        if ( y==0 ) :
            cursor.execute("delete from snsrecipe where sns_imgurl = '" + url+"'")
            connect.commit()
            cursor.execute("delete from recipe where rp_idx="+str(row[1]))
            connect.commit() 
            print("삭제")
    except:
        # delete
        cursor.execute("delete from snsrecipe where sns_imgurl = '" + url+"'")
        connect.commit()
        cursor.execute("delete from recipe where rp_idx="+str(row[1]))
        connect.commit() 
        print("사진 URL signature expired, 삭제")  
connect.close()





