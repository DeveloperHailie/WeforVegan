from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
import time
import urllib.request
import re
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait as wait

def page_down():
    main=driver.find_element_by_tag_name('body')
    main.send_keys(Keys.PAGE_DOWN)
    time.sleep(3)

def get_link(number) :
    # number번 페이지 다운
    link_set = set()
    down_count = 0
    while (True) :
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        a = soup.find_all('a',attrs={'class':'css-4rbku5 css-18t94o4 css-1dbjc4n r-1loqt21 r-1ny4l3l r-1udh08x r-1j3t67a r-1vvnge1 r-o7ynqc r-6416eg'})
        for i in a :
            link_set.add( i.attrs['href'])
            #print( i.attrs['href'])
        page_down()
        down_count = down_count+1
        if(down_count>number) :
            break
    return link_set
    
def post_text(link) :
    driver.get(link)
    time.sleep(3)
    try :
        # 리트윗글이 첫번째 글일 경우
        div_xpath='//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[2]/div/section/div/div/div[1]/div/div/article/div/div/div/div[3]/div[1]/div'
        text = driver.find_element_by_xpath(div_xpath).text
        return text
    except :
        # 리트윗글이 두번째 글일 경우
        try :
            div_xpath='//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div/div/div[2]/div/section/div/div/div[2]/div/div/article/div/div/div/div[3]/div[1]/div'
            text = driver.find_element_by_xpath(div_xpath).text
            return text
        except :
            # 리트윗글이 세번째 혹은 그 이상일 경우(보편적인 경우가 아닌, 예외의 경우)
            return ''

        
driver = webdriver.Chrome('..\\chromedriver.exe')
user_id = 'vegan_recipe_'
url = 'https://twitter.com/' + user_id
driver.get(url)
time.sleep(3)

# 리트윗 url 모으기
link_set = get_link(500)

# 각 리트윗들의 내용 모으기 
base_link = 'https://twitter.com'
twitter = dict()
count = 1
for i in link_set :
    link = base_link + i
    post = post_text(link)
    twitter[link] = post
    #print(link, post)
    count = count+1
    # 너무 많이 접속하면 중지되는 경우를 대비
    if(count%100==0) :
        time.sleep(60)

# 트위터.txt
#링크 \\ 내용 
#next 
#링크 \\ 내용 
#next
g = open("트위터.txt","w")
for i in twitter :
    g.write(i+"\\\\"+twitter[i])
    g.write('\nnext\n')
g.close()
    
    
    