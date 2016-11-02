#!/usr/bin/env python3
# Generating JSON for Zendesk macros from Workflowy txt file
# Written by Daniel Oakley <doaks@londontrustmedia.com>
# Property of London Trust Media, inc.

import json

txt = open('macros.txt').read().split('\n')

macro_categories = []
macros = []

indent_width = 2
current_macro_category_tree = []
justadded = False
in_description = False
name_buffer = ''
buffer = ''
current_indent = indent_width * -1

current_line = -1
while True:
    current_line += 1
    try:
        line = txt[current_line]
    except IndexError:
        # file complete
        break
    indent = 0
    for char in line:
        if char == ' ':
            indent += 1
        else:
            break

    if in_description:
        line = line[current_indent:]
        description_ending = False

        # description ending
        if indent < current_indent:
            buffer = buffer[:-1]  # remove last "
            current_line -= 1
            current_indent -= indent_width
            name_buffer = name_buffer.split(' - ')[-1].strip().replace('DDWRT', 'DD-WRT')
            macros.append([list(current_macro_category_tree), name_buffer, buffer])
            print("ADDING DESCRIPTION:", [current_macro_category_tree, name_buffer])
            buffer = ''
            in_description = False
        else:
            buffer += '\n' + line

    else:
        # add buffer as a category
        line = line.lstrip().replace('\ufeff', '')
        if line.startswith('- '):
            print('line:', line)
            name = line[2:]
            if indent == current_indent:
                print('c', current_macro_category_tree, [buffer, name])
                if justadded:
                    justadded = False
                    if buffer:
                        current_macro_category_tree += [buffer]
                elif buffer:
                    macro_categories.append(current_macro_category_tree + [buffer])
                if buffer:
                    current_macro_category_tree += [buffer]
                buffer = name
                print(' c', current_macro_category_tree, [buffer, name])
            elif current_indent < indent:
                print('a', current_macro_category_tree, [buffer, name])
                if justadded or buffer:
                    if buffer:
                        macro_categories.append(current_macro_category_tree + [buffer])
                        current_macro_category_tree += [buffer]
                current_indent = indent
                buffer = name
                if buffer:
                    justadded = True
                print(' a', current_macro_category_tree, [buffer, name])
            elif indent < current_indent:
                print('r', current_macro_category_tree, [buffer, name])
                print(int((current_indent - indent) / indent_width), current_macro_category_tree)
                for i in range(int((current_indent - indent) / indent_width)):
                    current_macro_category_tree = current_macro_category_tree[:-1]
                buffer = name
                current_indent = indent
                justadded = True
                print(' r', current_macro_category_tree, [buffer, name])

        # add buffer as an entry
        elif line.startswith('"'):
            in_description = True
            name_buffer = buffer
            buffer = line[1:]
            current_indent = indent
            continue

# from pprint import pprint
# pprint(macro_categories)

with open('macros.json', 'w') as macro_file:
    macro_file.write(json.dumps({
        'categories': macro_categories,
        'macros': macros,
    }, indent=4, separators=(',', ': ')))
    macro_file.write('\n')
