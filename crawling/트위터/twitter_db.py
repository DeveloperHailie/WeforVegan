import pymysql

conn = pymysql.connect(host = 'ㅇㅇ', user = 'ㅇㅇ',
                       password = 'ㅇㅇ', db = 'ㅇㅇ', charset = 'utf8')
cursor = conn.cursor()

f = open("트위터.txt", "r", encoding='UTF8')

count = 1

while True:
    line = f.readline()
    if not line: break
    if ";" in line:
        splitline = line.split(';')
        sql = """insert into snsrecipe(sns_url, sns_imgurl, recipe_rp_idx, recipe_rp_name, recipe_rp_source) values (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (splitline[0], None, count, splitline[1], 'twitter'))
        
        
        conn.commit()
        count = count + 1
    if "next" in line : continue
    
f.close()
conn.close()
