import os
rules = open(os.path.expanduser('~') + '/firestore.rules', 'r').read() if os.path.exists(os.path.expanduser('~') + '/firestore.rules') else open('firestore.rules', 'r').read()
print(rules[:100])