lines = 0
count = 0
for line in open('urls.csv', 'r').readlines():
    lines += 1
    if line[-2] == '|':
        count += 1
        print(line[:-1])

print(lines, count)
