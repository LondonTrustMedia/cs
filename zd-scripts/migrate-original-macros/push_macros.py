#!/usr/bin/env python3
# Push the macros in the JSON file to ZenDesk
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import json
import os

macros = json.loads(open('macros.json').read())

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

print("Adding Macro")

for categories, name, value in macros['macros']:
    zendesk_macro_name = '::'.join(categories + [name])

    # The only T2 team is the Tech team, so just combine them here
    zendesk_macro_name = zendesk_macro_name.replace('Tier 2::Technical', 'Tier 2 Technical')

    print("Adding Macro:", zendesk_macro_name)
    ticket_url = zendesk.macro_create(data={
            'macro': {
                'title': zendesk_macro_name,
                'actions': [
                    {
                        'field': 'comment_value',
                        'value': value,
                    },
                    {
                        'field': 'comment_mode_is_public',
                        'value': 'true',
                    },
                    {
                        'field': 'current_tags',
                        'value': 'technical',
                    },
                ]
            }
        })
    print('  ', ticket_url)

