#!/usr/bin/env python3
# Make a backup of our Zendesk help center articles
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os
import json

from zdesk import Zendesk

zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

articles = zendesk.help_center_articles('en-us', get_all_pages=True)['articles']

with open('articles_backup.json', 'w') as backup_file:
    backup_file.write(json.dumps(articles, indent=4, separators=(',', ': ')))
    backup_file.write('\n')
