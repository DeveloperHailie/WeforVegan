from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import time
import urllib.request
import re
 
def cleanText(readData):
    #텍스트에 포함되어 있는 특수 문자 제거
    #()제거
    pat = re.compile("\(")
    try:
        matchObject = pat.search(readData)
        text = readData[:matchObject.start()]
        text = re.sub('[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》]', '', text)
        return text
    except Exception as ex:
        text = re.sub('[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》]', '', readData)
        return text
    
def textData(readData):
    text = re.sub('[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》\\n]', '', readData)
    return text

path ="..\\chromedriver.exe"
driver = webdriver.Chrome(path)

url = 'https://opendict.korean.go.kr/search/searchResult?focus_name=query&query='

# 검색할 성분 키워드 모아놓은 txt
g = open("원성분.txt","r")
wordList = g.readlines()
setList = []

#count=0

for n in wordList :
    n = textData(n)
    driver.get(url+n)
    tempSet = {n}
    try :
        click = driver.find_element_by_xpath('//*[@id="searchPaging"]/div[1]/div[2]/ul[2]/li/div/div[1]/dl[1]/dd/a').get_attribute('href')
        driver.get(click)
        text = driver.find_element_by_xpath('//*[@id="content"]/div[1]/div[1]/div[2]/div/div/div[4]/div/dl[1]/dt').text
        if(text=='비슷한말'):
            w = driver.find_elements_by_xpath('//*[@id="content"]/div[1]/div[1]/div[2]/div/div/div[4]/div/dl[1]/dd/a')
            for i in w :
                t = cleanText(i.text)
                tempSet.add(t)
            # 기존 집합에 있는지 확인하기
            for i in range(len(setList)) :
                if(setList[i]&tempSet==set()):
                    setList.append(tempSet)
                    break
                else :
                    setList[i].union(tempSet)
            if(len(setList)==0):
                setList.append(tempSet)
    except Exception as e :
        continue
    #if count == 30 :
    #    break
    #count += 1

g = open("집합분류.txt","w")
for i in setList :
    for j in i :
        g.write(j+",")
    g.write('\n')
g.close()
