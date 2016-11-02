
urls = []

with open('helpdesk_redirects.csv', 'r') as csvfile:
    for line in csvfile:
        name, new, old = line.strip().split('|')
        if name == 'name':
            continue
        old = old.replace('https://', '')
        urls.append([old, new])

with open('extra_kb_redirects.csv', 'r') as csvfile:
    for line in csvfile:
        old, new = line.strip().split('|')
        if old == 'old':
            continue
        urls.append([old, new])

with open('master_redirect_list.csv', 'w') as redirect_file:
    redirect_file.write('old|new\n')
    for old, new in sorted(urls):
        redirect_file.write('{}|{}\n'.format(old, new))
