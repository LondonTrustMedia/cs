#!/usr/bin/env python3
# Fixing a dodgy mistake in all the Technical:: macros.
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import json
import os
import sys

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

if False:
    users = zendesk.users_list(get_all_pages=True)['users']
    staff = [user['id'] for user in users if user['role'] != 'end-user']

staff = [5643460397, 5986635108, 6069244928, 6417449527, 6879022508, 6879291988, 7564426168, 7570703767, 7570719387, 7586091547, 7586130647, 7586145347, 7586184687, 7586231287, 7586261347, 7586283487, 7586301007, 7586312767, 7586325087, 7586340287, 7586355847, 7586382727, 7586615447, 7586651327, 7586839347, 7636184788, 7636193488, 7650209428, 7650302788, 7650527428, 7650548228, 7650742988, 7650835028, 7659479468, 7659618068, 7699962427, 7971763747, 7971974647, 8082548948, 8090959828]

tickets = zendesk.tickets_list(get_all_pages=True)['tickets']
tickets_to_fix = []


for ticket in tickets:
    if ticket['status'] == 'pending':
        if zendesk.ticket_comments(ticket['id'])['comments'][0]['author_id'] in staff:
            tickets_to_fix.append(ticket['id'])
            print('fixing', ticket['id'])
        else:
            #print(ticket['id'], 'is fine')
            pass
print('you should fix', tickets_to_fix)
sys.exit()

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
