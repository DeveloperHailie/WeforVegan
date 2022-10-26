import tweepy

# 트위터 앱의 Keys and Access Tokens 탭 참조(자신의 설정 값을 넣어준다)
consumer_key = ''
consumer_secret = ''

# 1. 인증요청(1차) : 개인 앱 정보 
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)

access_token = ''
access_token_secret= ''

# 2. access 토큰 요청(2차) - 인증요청 참조변수 이용
auth.set_access_token(access_token, access_token_secret)

# 3. twitter API 생성  
api = tweepy.API(auth)

location = "%s,%s,%s" % ("35.95", "128.25", "1000km")
#vegan_recipe_
keyword = "비건레시피";     # 자신이 검색하고 싶은 키워드 입력 
search = [] # 크롤링 결과 저장할 변수   

# twitter 검색 cursor 선언
# tweepy api 는 일주일만 가능?
cursor = tweepy.Cursor(api.search, q=keyword,
                       since='2018-01-01', # 2018-01-01 이후에 작성된 트윗들로 가져옴
                       count=20, # 페이지당 반환할 트위터 수 최대 20
                       geocode=location, # 검색 반경 조건
                       include_entities=True)

for i, tweet in enumerate(cursor.items()):
    print("{}: {}".format(i, tweet.text))
