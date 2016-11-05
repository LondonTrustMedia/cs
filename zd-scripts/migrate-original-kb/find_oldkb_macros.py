#!/usr/bin/env python3
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os

from zdesk import Zendesk

zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

for macro in zendesk.macros_list(access='shared', get_all_pages=True)['macros']:
    # skip deactivated macros
    if not macro['active']:
        continue
    change_made = False
    new_actions = []
    for action in macro['actions']:
        if action['field'] == 'comment_value':
            original_comment = action['value'][1]
            if 'londontrustmedia.zendesk.com/hc' in original_comment:

                print('Fix:', macro['title'])
