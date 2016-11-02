#!/usr/bin/env python3
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

for macro in zendesk.macros_list(access='shared', get_all_pages=True)['macros']:
    print('Fixing macro:', macro['title'])
    change_made = False
    new_actions = []
    for action in macro['actions']:
        if action['field'] == 'comment_value':
            original_comment = action['value'][1]
            new_comment = original_comment.replace('londontrustmedia.zendesk.com/hc', 'support.privateinternetaccess.com/hc')
            change_made = original_comment != new_comment
            try:
                action['value'][1] = new_comment
            except Exception as ex:
                print("IGNORED")
                print(ex)
                from pprint import pprint
                pprint(action)
        new_actions.append(action)
    macro['actions'] = new_actions
    if change_made:
        val = zendesk.macro_update(macro['id'], {
            'macro': macro,
        })
