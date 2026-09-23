#!/usr/bin/env python3
"""Import Arabic-language glossary JSONL to validated per-letter JSON. No external dependencies.
Usage: python3 scripts/import-arabic-dictionary.py source.jsonl --output /tmp/dictionary-import
Review licensing and all output BEFORE replacing published data.
"""
import argparse
import json
import pathlib
import re
from collections import defaultdict

NAMES = dict(zip("ابتثجحخدذرزسشصضطظعغفقكلمنهوي",
    ("alef baa taa thaa jeem haa khaa dal thal raa zay seen sheen sad dad taa2 zaa ain ghain faa qaf kaf lam meem noon haa2 waw yaa").split()))
ARABIC = re.compile(r"[ء-ي]")
ALLOWED = re.compile(r"^[ء-يآأإٱ\u064b-\u065f\u0670\u0640\s-]+$")
def letter(word):
    c = word[0].translate(str.maketrans({"أ":"ا","إ":"ا","آ":"ا","ٱ":"ا"}))
    return c if c in NAMES else None
def glosses(item):
    for sense in item.get("senses", []):
        if isinstance(sense, str):
            candidates = [sense]
        elif isinstance(sense, dict):
            candidates = sense.get("glosses") or [sense.get("definition", "")]
        else:
            continue
        for gloss in candidates:
            if not isinstance(gloss, str): continue
            words = ARABIC.findall(gloss)
            if len(words) < 5 or len(words) < len(re.findall(r"[A-Za-z]", gloss)): continue
            yield gloss.strip()
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("source", type=pathlib.Path)
    p.add_argument("--output",type=pathlib.Path,required=True)
    p.add_argument("--source-name",default="Wiktionary-derived import (verify license)")
    p.add_argument("--source-url",default="")
    p.add_argument("--license",required=True,help="Verified license identifier, e.g. CC-BY-SA-4.0")
    args=p.parse_args()
    if args.output.exists() and any(args.output.iterdir()):
        p.error("Output must be a new or empty folder; published files must not be overwritten.")
    grouped=defaultdict(list); seen=set(); skipped=0
    with args.source.open(encoding="utf-8") as f:
        for line_no,line in enumerate(f,1):
            try: item=json.loads(line)
            except json.JSONDecodeError: skipped+=1;continue
            word=item.get("word", "")
            if not isinstance(word,str) or not word.strip() or not ALLOWED.fullmatch(word.strip()): skipped+=1;continue
            word=word.strip();ch=letter(word)
            if not ch: skipped+=1;continue
            meanings=list(dict.fromkeys(glosses(item)))[:8]
            if not meanings: skipped+=1;continue
            key=(word,tuple(meanings))
            if key in seen: continue
            seen.add(key)
            grouped[ch].append({"id":f"import-{line_no:08d}","word":word,"root":None,"pos":item.get("pos") or "",
              "senses":[{"definition":m} for m in meanings],"synonyms":[],"antonyms":[],
              "source":args.source_name,"source_url":args.source_url,"license":args.license,"reviewed":False})
    args.output.mkdir(parents=True,exist_ok=True)
    for ch,words in grouped.items():
        words.sort(key=lambda x:x["word"])
        (args.output/NAMES[ch]).with_suffix(".json").write_text(
            json.dumps({"letter":ch,"entries":words,"license":args.license,"source_url":args.source_url},ensure_ascii=False,indent=2),encoding="utf-8")
    manifest={"version":1,"total":sum(map(len,grouped.values())),"license":args.license,
      "source_url":args.source_url,"editorial_status":"unreviewed imported definitions",
      "letters":{ch:NAMES[ch]+".json" for ch in sorted(grouped)}}
    (args.output/"index.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
    (args.output/"licenses.json").write_text(json.dumps({"source":args.source_name,"source_url":args.source_url,"license":args.license,"attribution_required":True},ensure_ascii=False,indent=2),encoding="utf-8")
    print("Imported",manifest["total"],"entries;",skipped,"skipped. Review rights and quality before publication.")
if __name__=="__main__": main()
