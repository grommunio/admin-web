import json
import os
import sys

# Opening JSON file
i18nDir = sys.argv[1] or "../src/i18n/"
files = os.listdir(i18nDir)

if("de-DE.json" in files):
    with open(i18nDir + 'de-DE.json') as deFile:
        de = json.load(deFile)
        for file in files:
            with open(i18nDir + file) as uncompletedFile:
                fileContent = json.load(uncompletedFile)
                for key, value in de.items():
                    if key in fileContent:
                        continue
                    else:
                        if file == "en-US.json":
                            fileContent[key] = key
                        else:
                            fileContent[key] = ""
            with open(i18nDir + file, 'w') as fp:
                json.dump(fileContent, fp, indent=4, sort_keys=True, ensure_ascii=False)
