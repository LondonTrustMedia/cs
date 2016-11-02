
import re
RE_OLD_URL_EXPANDED = re.compile(r"((https://support.privateinternetaccess.com/Knowledgebase/Article/View/([0-9]+))(/.+)?)")
RE_OLD_URL_REPLACE = re.compile(r"(https://support.privateinternetaccess.com/Knowledgebase/Article/View/[0-9]+(?:/.+)?)")

# https://support.privateinternetaccess.com/Knowledgebase/Article/View/119

first_line = True
written_urls = []
with open('goodurls.txt', 'w') as goodurls:
    for line in open('urls.csv', 'r').readlines():
        if first_line:
            first_line = False
            goodurls.write(line)
            continue
        if line[-2] == '|':
            continue
        else:
            found = RE_OLD_URL_EXPANDED.findall(line)
            full_url, short_url, article_id, article_extra = found[0]

            if full_url not in written_urls:
                written_urls.append(full_url)
                goodurls.write(line)

            if article_extra and (short_url not in written_urls):
                written_urls.append(short_url)
                goodurls.write(RE_OLD_URL_REPLACE.sub(short_url, line))
