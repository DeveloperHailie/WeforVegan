from selenium import webdriver
from bs4 import BeautifulSoup
import unicodedata
import time
import pymysql

conn = pymysql.connect(host = 'ㅇㅇ', user = 'ㅇㅇ',
                       password = 'ㅇㅇ', db = 'ㅇㅇ', charset = 'utf8')
cursor = conn.cursor()

driver = webdriver.Chrome()

number = 600

for n in range(1, 5) :
    site = 'https://www.10000recipe.com/recipe/list.html?q=%EC%B1%84%EC%8B%9D&order=reco&page='
    site = site + str(n)
    driver.get(site)
    time.sleep(2)
    sample = driver.find_elements_by_css_selector('.common_sp_link')
    
    for i in range(len(sample)) :
        driver.get(site)
        #레시피 링크
        findurl = driver.find_elements_by_css_selector('.common_sp_link')[i].get_attribute('href')
        print(findurl)
        driver.get(findurl)
        time.sleep(3)
        
        #레시피 이름
        #foodName = driver.find_elements_by_xpath('//*[@id="contents_area"]/div[2]/h3')
        foodName =driver.find_element_by_tag_name('h3')
        print(foodName.text)
        #레시피 사진
        foodImage = driver.find_element_by_xpath('/html/body/div/div/div/div/img').get_attribute('src')
        print(foodImage)
        
        sql = '''INSERT INTO recipe(rp_idx, rp_name, rp_source) VALUES ("%s", "%s", "%s")'''
        data = (number, foodName.text, '1000 recipe')
        cursor.execute(sql, data)
        conn.commit()

        sql = '''INSERT INTO snsrecipe(sns_url, sns_imgurl, recipe_rp_idx, recipe_rp_name, recipe_rp_source) VALUES ("%s", "%s", "%s", "%s", "%s")'''
        data = (findurl, foodImage, number, foodName.text, '1000 recipe')
        cursor.execute(sql, data)
        conn.commit()
        
        number += 1
    
conn.close()
driver.close()
print("End")
