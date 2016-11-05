#!/usr/bin/env python3
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os

from zdesk import Zendesk

zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

for macro in zendesk.macros_list(access='shared', get_all_pages=True)['macros']:
    name = macro['title'].casefold()

    if name.startswith('tech') || name.startswith('tier 2'):
        print('Applying tech tag to macro', macro['title'])
        macro['actions'].append({
            'field': 'current_tags',
            'value': 'tech',
        })
    elif name.startswith('account'):
        print('Applying account tag to macro', macro['title'])
        macro['actions'].append({
            'field': 'current_tags',
            'value': 'account',
        })
    elif name.startswith('billing'):
        print('Applying payment tag to macro', macro['title'])
        macro['actions'].append({
            'field': 'current_tags',
            'value': 'payment',
        })
    else:
        print('Skipping macro', macro['title'])
        continue

    val = zendesk.macro_update(macro['id'], {
        'macro': macro,
    })
