import re


g = open('db_raw.txt', 'r', encoding='UTF8')
cList = open('나라이름.txt', 'r', encoding='UTF8').read().split('\n')
f = open("db_set.txt", "w", encoding='UTF8')


def deleteToken(raw, rawSet):

    findc = []

    for j in range(len(cList)):
        p = re.compile(
            f'(\({cList[j]}산?\))|' + f'(\({cList[j]}산?/.*?\))|' + f'(\(.*?/{cList[j]}산?\))|' + f'(\(.*?/{cList[j]}산?/.*?\))|' +
            f'(\({cList[j]}산?.*?\))|' + f'(\(.*?{cList[j]}산?\))|' + f'(\(.*?{cList[j]}산?.*?\))|' + f'(\[{cList[j]}산?\])|' +
            f'(\[{cList[j]}산?/.*?\])|' + f'(\[.*?/{cList[j]}산?\])|' + f'(\[.*?/{cList[j]}산?/.*?\])|'+
            f'(\[{cList[j]}산?.*?\])|' + f'(\[.*?{cList[j]}산?\])|' + f'(\[.*?{cList[j]}산?.*?\])|' + f'({cList[j]})')
        if cList[j] in raw:
            q = re.sub(p, "", raw)
            findc.append(q)
            raw = q
        else:
            findc.append(0)
            continue

    rawSet.add(findc[-1])
    return rawSet


rawSet = set()

while True:
    wordList = g.readline()
    if not wordList:
        break
    deleteToken(wordList, rawSet)



for i in rawSet:
    f.write(i+'\n')
    
f.close()

g.close()
