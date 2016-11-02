#!/usr/bin/env python3
# Remove all tickets. This is bad and do not use it
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os
import sys

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

sys.exit(1)

tickets = zendesk.tickets_list(get_all_pages=True)['tickets']
while len(tickets):
    to_delete = tickets[:100]
    tickets = tickets[100:]

    to_delete = ','.join([str(ticket['id']) for ticket in to_delete])
    print(to_delete)
    print(zendesk.tickets_destroy_many(to_delete))
