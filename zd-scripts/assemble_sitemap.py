#!/usr/bin/env python3
# Create and upload the sitemap for our Zendesk site
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import os
import sys

from zdesk import Zendesk

#TODO-XXX-WARNING: PASSWORD IS CONTAINED IN THIS FILE.
zendesk = Zendesk(os.environ['ZD_URL'], os.environ['ZD_USER'], os.environ['ZD_PASS'])

sitemap_article_id = ''

# Create sitemap.xml file
with open('sitemap.xml', 'w') as sitemap:
    #if False:
    sitemap.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    sitemap.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

    # entry for base URL
    sitemap.write('  <url>\n')
    sitemap.write('    <loc>https://helpdesk.privateinternetaccess.com/hc/en-us</loc>\n')
    sitemap.write('    <changefreq>daily</changefreq>\n')
    sitemap.write('    <priority>1.0</priority>\n')
    sitemap.write('  </url>\n')

    # output urls
    for article in zendesk.help_center_articles('en-us', get_all_pages=True)['articles']:
        if 'sitemap file' in article['title'].lower():
            sitemap_article_id = article['id']
            continue

        # this produces W3C date format
        updated_date = article['updated_at'].split('T')[0]

        sitemap.write('  <url>\n')
        sitemap.write('    <loc>{}</loc>\n'.format(article['html_url']))
        sitemap.write('    <lastmod>{}</lastmod>\n'.format(updated_date))
        sitemap.write('    <changefreq>daily</changefreq>\n')
        sitemap.write('  </url>\n')

    sitemap.write('</urlset>')

# Let user know to create a new sitemap article if necessary
if not sitemap_article_id:
    print('Please create a new article with the title "Sitemap File"')
    sys.exit(1)

# Find the existing attachment
attachments = zendesk.help_center_article_attachments(sitemap_article_id, get_all_pages=True)['article_attachments']

if not attachments:
    # Create new attachment
    #print(zendesk.help_center_article_attachment_create(sitemap_article_id, open('sitemap.xml').read(), file='@sitemap.xml', inline=False))
    print(zendesk.help_center_article_attachment_create(sitemap_article_id, open('sitemap.xml').read()))#, files={'sitemap.xml': open('sitemap.xml', 'r')}))

