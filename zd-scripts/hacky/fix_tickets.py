#!/usr/bin/env python3
# Fixing a dodgy mistake in all the Technical:: macros.
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import json
import os

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

tickets = zendesk.tickets_list(get_all_pages=True)['tickets']

tickets_to_fix = []

for ticket in tickets:
    if ticket['status'] == 'open' and len(zendesk.ticket_comments(ticket['id'], get_all_pages=False).get('comments', [])) == 1:
        tickets_to_fix.append(ticket['id'])

while len(tickets_to_fix):
    to_fix = tickets_to_fix[:100]
    tickets_to_fix = tickets_to_fix[100:]

    to_fix = ','.join([str(ticket_id) for ticket_id in to_fix])
    print('Fixing tickets {}'.format(to_fix))
    print(zendesk.tickets_update_many({
        "ticket": {
                "status": "new"
            }
        }, to_fix))
    #break

print('Fixed bad tickets')
