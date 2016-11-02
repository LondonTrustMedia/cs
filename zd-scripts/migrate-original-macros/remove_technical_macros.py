#!/usr/bin/env python3
# Remove all the Technical:: macros from Zendesk
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

for macro in zendesk.macros_list(access='shared', get_all_pages=True)['macros']:
    if macro['title'].startswith('Technical::') or macro['title'].startswith('Tier 2 Technical::'):
        print('Removing macro:', macro['title'])
        zendesk.macro_delete(macro['id'])
