from pyquery import PyQuery as pq
import requests

with open('oldurls.txt', 'w') as oldurls:
    for i in range(300):
        kb_url = 'https://support.privateinternetaccess.com/Knowledgebase/Article/View/{}'.format(i)
        r = requests.get(kb_url)
        p = pq(r.text)

        kb_title = p('.kbtitlemain').text()

        if kb_title:
            oldurls.write('{}\n    {}\n'.format(kb_title, kb_url))
            print('Found', i, '-', kb_title)
        else:
            print('Skipping KB article', i)
