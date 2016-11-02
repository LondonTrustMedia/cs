#!/usr/bin/env python3
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import csv
import os

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

with open('urls.csv', 'w') as url_file:
    urlcsv = csv.writer(url_file, delimiter='|', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    urlcsv.writerow(['name', 'newurl', 'oldurl'])

    for article in zendesk.help_center_articles('en-us', get_all_pages=True)['articles']:
        print(article['name'], article['html_url'].replace('londontrustmedia.zendesk.com', 'support.privateinternetaccess.com'))
        urlcsv.writerow([article['name'], article['html_url'].replace('londontrustmedia.zendesk.com', 'support.privateinternetaccess.com'), ''])
