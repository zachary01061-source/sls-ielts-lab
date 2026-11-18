#!/usr/bin/env python3
"""Verify the final Cambridge question bank independently of its converter."""
import argparse
import importlib.util
import json
from pathlib import Path
import re
import sys
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('cambridge_converter',ROOT/'scripts/convert-cambridge-xdf.py')
converter=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(converter)


def audit_privacy(raw_dir):
    allowed_data={'allCount','article','contentList','docList','initNum','level1Name','level2Name','number','order','parentType','qId','qSource','qTopic','qTopicId','qType','qTypeId','spptName','spptId'}
    allowed_rows={'content','contentAnalyze','contentClean','contentId','contentOrder','pageId','pageOrder','type'}
    allowed_docs={'code','name','list'};allowed_records={'body','docId','id'}
    private_names={'userinfo','userid','studentid','studentname','studentanswer','useranswer','myanswer','bpa','scorelist','answerlist','answertime','usedtime','mobile','phone','email','token','sessionid','sessiontoken','access_token','authorization'}
    unknown=Counter();private=Counter();parse_errors=[];files=list(raw_dir.glob('*.json'))
    def scan(value):
        if isinstance(value,dict):
            for key,item in value.items():
                if key.casefold() in private_names:private[key]+=1
                scan(item)
        elif isinstance(value,list):
            for item in value:scan(item)
        elif isinstance(value,str) and value.lstrip().startswith(('{','[')):
            try:scan(json.loads(value))
            except (ValueError,TypeError):pass
    for file in files:
        try:payload=json.loads(file.read_text())
        except (ValueError,OSError):parse_errors.append(file.name);continue
        data=payload.get('data',{})
        for key in data:
            if key not in allowed_data:unknown['data.'+key]+=1
        for row in data.get('contentList') or []:
            for key in row:
                if key not in allowed_rows:unknown['row.'+key]+=1
            for key in ('content','contentAnalyze','contentClean'):scan(row.get(key))
        for doc in data.get('docList') or []:
            for key in doc:
                if key not in allowed_docs:unknown['doc.'+key]+=1
            for record in doc.get('list') or []:
                for key in record:
                    if key not in allowed_records:unknown['docRecord.'+key]+=1
                scan(record.get('body'))
    return {'rawFiles':len(files),'unexpectedWrapperKeys':dict(unknown),'privateFieldNames':dict(private),'jsonErrors':parse_errors,'passed':not unknown and not private and not parse_errors}


def audit(raw_dir=None):
    index=json.loads((ROOT/'public/data/cambridge/index.json').read_text())
    errors=[];source_articles=[];records=[];all_ids=set();all_qids=set();questions_total=0;ready_parts=0;playable_parts=0;pending_audio=[]
    if [volume['volume'] for volume in index['volumes']]!=list(range(5,21)):errors.append('Volume list is not exactly5–20')
    for volume in index['volumes']:
        expected_tests=[5,6,7,8] if volume['volume']==12 else [1,2,3,4]
        if [test['testNumber'] for test in volume['tests']]!=expected_tests:errors.append(f'Unexpected test labels in volume{volume["volume"]}')
        for test in volume['tests']:
            for subject,parts in [('reading',[1,2,3]),('listening',[1,2,3,4])]:
                metas=test[subject];slots=[];total=0
                if [meta['part'] for meta in metas]!=parts:errors.append(f'Incomplete parts: volume{volume["volume"]} test{test["testNumber"]} {subject}')
                for meta in metas:
                    identity=meta['id']
                    if identity in all_ids:errors.append('Duplicate passage ID: '+identity)
                    all_ids.add(identity)
                    if meta.get('status')!='ready':errors.append('Question part is not ready: '+identity)
                    else:ready_parts+=1
                    filename=(ROOT/'public'/str(meta.get('file',''))).resolve()
                    if not filename.is_relative_to((ROOT/'public/data/cambridge/passages').resolve()) or not filename.is_file():
                        errors.append('Invalid/missing passage file: '+identity);continue
                    passage=json.loads(filename.read_text())
                    if passage.get('id')!=identity or passage.get('subject')!=subject or passage.get('part')!=meta['part']:errors.append('Passage metadata mismatch: '+identity)
                    questions=[question for group in passage.get('groups',[]) for question in group.get('questions',[])]
                    total+=len(questions);questions_total+=len(questions)
                    if meta.get('questionCount')!=len(questions):errors.append('Indexed question count mismatch: '+identity)
                    if len({question['id'] for question in questions})!=len(questions):errors.append('Duplicate local question IDs: '+identity)
                    for group in passage.get('groups',[]):
                        if re.search(r'<(?:script|iframe|form|input|button)\b',group.get('contextHtml',''),re.I):errors.append('Unsafe/raw controls in source context: '+identity)
                        for question in group.get('questions',[]):
                            slot=question.get('sourceSlot');slots.append(slot)
                            answers=question.get('answers')
                            if not isinstance(answers,list) or not answers or not all(isinstance(answer,str) and answer.strip() for answer in answers):errors.append(f'Missing answer: {identity}:{slot}')
                            if group['type'] in ('choice','matching','multi'):
                                options=question.get('options') or group.get('options') or []
                                allowed={option['value'].casefold() for option in options}
                                if not allowed or any(answer.casefold() not in allowed for answer in answers or []):errors.append(f'Answer outside option bank: {identity}:{slot}')
                            if group['type'] in ('tfng','ynng'):
                                allowed={'TRUE','FALSE','NOT GIVEN'} if group['type']=='tfng' else {'YES','NO','NOT GIVEN'}
                                if any(answer.upper() not in allowed for answer in answers or []):errors.append(f'Invalid judgment answer: {identity}:{slot}')
                    if subject=='reading':
                        html=passage.get('articleHtml','');parser=converter.parsed_html(html)
                        words=len(re.findall(r"\b[A-Za-z][A-Za-z'’\u2010-\u2015-]*\b",parser.value()[1]));images=len(parser.images)
                        if words<150 and not images:errors.append('Reading article missing or only a title: '+identity)
                        if volume['volume']<=20:source_articles.append(words)
                    audio=passage.get('audio',{})
                    playable=meta.get('status')=='ready' and (subject!='listening' or (audio.get('status')=='ready' and bool(audio.get('src'))))
                    if playable:playable_parts+=1
                    if subject=='listening' and not playable:pending_audio.append(identity)
                    if subject=='listening' and volume['volume']<=20:
                        if not playable:errors.append('XDF listening audio is not verified: '+identity)
                        if not str(audio.get('src','')).startswith('/api/guest/cambridge/media/'):errors.append('XDF audio is not localized: '+identity)
                        if not isinstance(audio.get('durationSeconds'),(int,float)) or audio['durationSeconds']<=0:errors.append('Missing decoded audio duration: '+identity)
                    qid=meta.get('sourceQuestionId')
                    if qid:
                        if qid in all_qids:errors.append('Duplicate source question ID: '+str(qid))
                        all_qids.add(qid)
                        if raw_dir:
                            raw_file=raw_dir/(str(qid)+'.json')
                            if not raw_file.exists():errors.append('Missing source export: '+str(qid))
                            else:
                                raw=json.loads(raw_file.read_text())
                                if raw.get('code')!=200 or str(raw.get('data',{}).get('qId'))!=str(qid):errors.append('Invalid source export identity: '+str(qid))
                    records.append({'id':identity,'questions':len(questions),'questionStatus':meta.get('status'),'playable':playable})
                if total!=40:errors.append(f'Test question count is not40: volume{volume["volume"]} test{test["testNumber"]} {subject} ({total})')
                if slots!=list(range(1,41)):errors.append(f'Original question numbers are not1–40: volume{volume["volume"]} test{test["testNumber"]} {subject}')
    expected={'parts':448,'questions':5120,'readyParts':448,'playableParts':448,'pendingAudioParts':0,'xdfParts':448,'xdfReadingArticles':192}
    actual={'parts':len(records),'questions':questions_total,'readyParts':ready_parts,'playableParts':playable_parts,'pendingAudioParts':len(pending_audio),'xdfParts':len(all_qids),'xdfReadingArticles':len(source_articles)}
    for key,value in expected.items():
        if actual[key]!=value:errors.append(f'Final total mismatch for {key}: expected{value}, actual{actual[key]}')
    for key,value in [('importedParts',ready_parts),('questionCount',questions_total),('playableParts',playable_parts),('pendingAudioParts',len(pending_audio))]:
        if index['summary'].get(key)!=value:errors.append('Summary mismatch: '+key)
    if index.get('migrationStatus')!='complete':errors.append('Final migrationStatus must be complete for volumes5–20')
    privacy=audit_privacy(raw_dir) if raw_dir else None
    if privacy and not privacy['passed']:errors.append('Raw source privacy/schema audit did not pass')
    report={'passed':not errors,'actual':actual,'minimumXdfReadingEnglishWords':min(source_articles) if source_articles else None,'privacy':privacy,'pendingAudioIds':pending_audio,'errors':errors,'parts':records}
    (ROOT/'docs/cambridge-bank-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({key:value for key,value in report.items() if key not in ('parts','pendingAudioIds')},ensure_ascii=False))
    return not errors


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--raw-dir',type=Path);args=parser.parse_args()
    sys.exit(0 if audit(args.raw_dir) else 1)
