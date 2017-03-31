#!/usr/bin/env python3
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os

from zdesk import Zendesk

zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

for macro in zendesk.macros_list(access='shared', get_all_pages=True)['macros']:
    # print('Fixing macro:', macro['title'])
    change_made = False
    new_actions = []
    for action in macro['actions']:
        if action['field'] == 'comment_value':
            original_comment = action['value'][1]
            new_comment = original_comment
            # totally remove first line
            if '\n' in new_comment and (new_comment.lower().startswith('hi ') or new_comment.lower().startswith('hello ')):
                new_comment = new_comment.split('\n', 1)[1].lstrip('\n')

            change_made = original_comment != new_comment
            try:
                action['value'][1] = new_comment
                if change_made:
                    print('fixed macro', macro['title'])
            except Exception as ex:
                print("IGNORED", macro['title'])
                # print(ex)
                # from pprint import pprint
                # pprint(action)
        elif action['field'] == 'comment_value_html':
            original_comment = action['value']
            new_comment = original_comment

            if '</p>' in new_comment and (new_comment.lower().startswith('<p>hi ') or new_comment.lower().startswith('<p>hello ')):
                new_comment = new_comment.split('</p>', 1)[1]
                if new_comment.startswith('<p><br></p>'):
                    new_comment = new_comment.split('<p><br></p>', 1)[1]

            change_made = original_comment != new_comment
            try:
                action['value'] = new_comment
                if change_made:
                    print('fixed macro', macro['title'])
            except Exception as ex:
                print("IGNORED", macro['title'])
                # print(ex)
                # from pprint import pprint
                # pprint(action)
        new_actions.append(action)
    macro['actions'] = new_actions
    if change_made:
        val = zendesk.macro_update(macro['id'], {
            'macro': macro,
        })
