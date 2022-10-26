from urllib.request import urlopen
from urllib.parse import quote_plus
from bs4 import BeautifulSoup
from selenium import webdriver
import time
import re
import pymysql
import unicodedata

conn = pymysql.connect(host = 'dbinstance.c4nf0uecennm.us-east-2.rds.amazonaws.com', user = 'weforvegan',
                       password = 'sungshin18', db = 'weforvegan', charset = 'utf8')
cursor = conn.cursor()

baseUrl = 'https://www.instagram.com/explore/tags/'
plusUrl = '비건레시피'
url = baseUrl + quote_plus(plusUrl)

driver = webdriver.Chrome()
driver.get(url)

time.sleep(3)

html = driver.page_source
soup = BeautifulSoup(html)

insta = soup.select('.v1Nh3.kIKUG._bz0w')

n = 93
for h in range(1000) :
    driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
    time.sleep(2)
    
    for i in insta:
        driver.get(url)       
        instaUrl = 'https://www.instagram.com'+ i.a['href'] #인스타주소
        #print(instaUrl)
        imgUrl = i.select_one('.KL4Bh').img['src'] #이미지주소
        #print(imgUrl)

        driver.get(instaUrl)
        time.sleep(2)

        #try:  # 여러 태그중 첫번째([0]) 태그를 선택
        content = driver.find_element_by_css_selector('div.C4VMK > span').text  # 첫 게시글 본문 내용이 <div class="C4VMK"> 임을 알 수 있다.
        content_edit = unicodedata.normalize('NFC', content)
        # 태그명이 div, class명이 C4VMK인 태그 아래에 있는 span 태그를 모두 선택.
        
                    
        # 본문 내용에서 해시태그 가져오기(정규표현식 활용)
        tags = re.findall(r'#[^\s#,\\]+', content)

        for j in range(len(tags)):
            tags_edit = unicodedata.normalize('NFC', tags[j])

        sql = '''INSERT INTO recipe(rp_idx, rp_name, rp_source) VALUES (%s, %s, %s)'''
        data = (n, content_edit, "instagram")
        cursor.execute(sql, data)
        conn.commit()

        sql = '''INSERT INTO snsrecipe(sns_url, sns_imgurl, recipe_rp_idx, recipe_rp_name, recipe_rp_source) VALUES (%s, %s, %s, %s, %s)'''
        data = (instaUrl, imgUrl, n, content_edit, "instagram")
        cursor.execute(sql, data)
        conn.commit()
        
        n += 1
        
        print()

driver.close()
conn.close()
print("End")

