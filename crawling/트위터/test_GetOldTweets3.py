import GetOldTweets3 as got

# 최근 인기글 
tweetCriteria = got.manager.TweetCriteria().setUsername("vegan_recipe_")\
                                           .setTopTweets(True)\
                                           .setMaxTweets(10)
tweet = got.manager.TweetManager.getTweets(tweetCriteria)[0]
print(tweet.text)



# 특정 유저의 트윗글(특정 범위) => 리트윗글은 포함 안됨
# 가져올 범위 정의
# 시작일: 2019년 2월 01일
import datetime    # datetime 패키지

days_range = []


# datetime 패키지, datetime 클래스(날짜와 시간 함께 저장)
# strptime 메서드: 문자열 반환
start = datetime.datetime.strptime("2019-02-01", "%Y-%m-%d")
end = datetime.datetime.strptime("2020-09-06", "%Y-%m-%d")

date_generated = [start+datetime.timedelta(days=x) for x in range(0, (end-start).days)]

for date in date_generated:
    days_range.append(date.strftime("%Y-%m-%d"))

print("===설정된 트윗 수집 기간: {} ~ {}===".format(days_range[0], days_range[-1]))
print("===총 {}일 간의 데이터 수집===".format(len(days_range)))
 
# tweetCriteria로 수집 기준 정의
tweetCriteria = got.manager.TweetCriteria().setUsername("vegan_recipe_").setSince("2019-02-01").setUntil("2020-09-06")

import time # 수집 print("데이터 수집 시작========") 
start_time = time.time() 
tweet = got.manager.TweetManager.getTweets(tweetCriteria) 
print("데이터 수집 완료======== {0:0.2f}분".format((time.time() - start_time)/60)) 
print("=== 총 트윗 개수 {} ===".format(len(tweet)))

for i in range(len(tweet)) :
    # 링크
    print(tweet[i].permalink)
    # 유저이름
    print(tweet[i].username)
    print(tweet[i].text)
    print(tweet[i].mentions)