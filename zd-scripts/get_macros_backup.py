#!/usr/bin/env python3
# Make a backup of our Zendesk macros
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os
import json

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

macros = zendesk.macros_list(access='shared', get_all_pages=True)['macros']

with open('macros_backup.json', 'w') as backup_file:
    backup_file.write(json.dumps(macros, indent=4, separators=(',', ': ')))
    backup_file.write('\n')
