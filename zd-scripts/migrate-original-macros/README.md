# Macro Migration

These are a few little scripts to migrate macros from my editing pad on
[Workflowy](https://workflowy.com/) to our Zendesk installation.

Requires [zdesk](https://github.com/fprimex/zdesk/) and its' dependencies.

Basic workflow is:

1. Export macros from Worlflowy as text file.
2. Name text file `macros.txt` and run `generate_macro_json.py`.
3. **WARNING!! DANGER!!** The next step **will remove all Technical macro data**. Read it carefully before executing it.
3. Run `remove_technical_macros.py` to remove the existing technical macros from Zendesk. **WARNING!! DANGER!! THIS WILL DELETE ALL Technical MACRO DATA**
4. Run `push_macros.py` to push the new macros from the generated json file to Zendesk.
