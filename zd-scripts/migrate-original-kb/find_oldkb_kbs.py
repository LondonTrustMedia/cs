#!/usr/bin/env python3
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

for article in zendesk.help_center_articles('en-us', get_all_pages=True)['articles']:
    if 'support.privateinternetaccess.com/hc' in article['body']:
        print(article['name'])
    if 'londontrustmedia.zendesk.com/hc' in article['body'].lower():
        print('Fixing', article['name'])
    if False:
        article['body'] = article['body'].replace('londontrustmedia.zendesk.com/hc', 'support.privateinternetaccess.com/hc')
        val = zendesk.help_center_article_update(article['id'], {
            'article': article,
        })
