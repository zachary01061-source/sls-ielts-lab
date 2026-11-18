#!/usr/bin/env python3
"""Convert authorized XDF Cambridge exports into the SLS static bank schema.

Only source catalog entries are converted. Unknown structures remain pending and
are listed in the report rather than silently dropping questions or answers.
"""
from __future__ import annotations

import argparse
from collections import Counter
from html import escape, unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
BLOCKS = {'p', 'div', 'h1', 'h2', 'h3', 'h4', 'li', 'tr', 'td', 'th', 'br'}
VOID = {'br', 'img', 'hr', 'input', 'meta', 'link', 'source', 'wbr'}
ALLOWED = {'p', 'div', 'span', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'mark', 'blockquote'}
TYPE_LABELS = {'tfng': '判断题', 'ynng': '观点判断', 'text': '填空题', 'choice': '选择题', 'multi': '多选题', 'matching': '匹配题'}
SOURCE_TYPE_LABELS = {'sentence_fill':'句子填空题','table_fill':'图表流程填空题','summary_fill':'Summary填空题','short_answer':'简答题','paragraph_main':'段落大意题','paragraph_info':'段落信息包含题','part1_fill':'Part1填空题','part4_fill':'Part4填空题','single_choice':'单选题','multiple_choice':'多选题','map':'地图题','tfng':'判断题','ynng':'观点判断'}


def html_source(value):
    return str(value or '').replace('\\n', '\n').replace('\\r', '\r').replace('\\t', '\t').replace('\\"', '"').replace('\\/', '/')


class SourceHTML(HTMLParser):
    def __init__(self, markers=None):
        super().__init__(convert_charrefs=True)
        self.markers = markers or {}
        self.html = []
        self.text = []
        self.skip = 0
        self.skip_kind = None
        self.unknown_markers = []
        self.unmapped_inputs = 0
        self.images = []
        self.asset_issues = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower(); attrs = dict(attrs)
        if self.skip:
            if tag not in VOID: self.skip += 1
            return
        if tag in {'script', 'style', 'iframe', 'object'}:
            self.skip = 1; self.skip_kind = 'unsafe'; return
        if attrs.get('role') == 'replace' and attrs.get('sccode'):
            key = attrs['sccode']; number = self.markers.get(key)
            if number is not None:
                numbers=number if isinstance(number,list) else [number]
                marker=' '.join(f'[{number}] ______' for number in numbers)
                self.html.append('<strong>'+escape(marker)+'</strong>'); self.text.append(marker)
                if tag not in VOID: self.skip = 1; self.skip_kind = 'marker'
                return
        if tag in BLOCKS: self.text.append('\n')
        if tag == 'input':
            self.unmapped_inputs += 1
            marker = '______'; self.html.append(marker); self.text.append(marker); return
        if tag == 'select':
            self.html.append('______'); self.text.append('______'); self.skip = 1; self.skip_kind = 'select'; return
        if tag not in ALLOWED: return
        keep = []
        if tag == 'img':
            src = attrs.get('src', '')
            if src.startswith('//'): src = 'https:'+src
            elif src and not re.match(r'^[a-z][a-z0-9+.-]*:',src,re.I): src=urljoin('https://ieltscat.xdf.cn/',src)
            if re.match(r'^(https?://|(?:\.?/)?assets/|data:image/(?:png|jpeg|jpg|gif|webp);base64,)', src, re.I):
                keep.append(('src', src)); keep.append(('alt', attrs.get('alt', '原题配图'))); self.images.append(src)
            else: self.asset_issues.append('Unsupported image source')
        if tag in {'td','th'}:
            for key in ('colspan','rowspan'):
                if re.fullmatch(r'\d{1,2}', attrs.get(key,'')): keep.append((key,attrs[key]))
        self.html.append('<'+tag+''.join(' '+key+'="'+escape(value, quote=True)+'"' for key,value in keep)+'>')

    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag.lower() not in VOID: self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if self.skip:
            self.skip -= 1
            return
        if tag in ALLOWED and tag not in VOID: self.html.append('</'+tag+'>')
        if tag in BLOCKS: self.text.append('\n')

    def handle_data(self, data):
        if self.skip: return
        self.html.append(escape(data)); self.text.append(data)

    def value(self):
        text='\n'.join(re.sub(r'\s+',' ',line).strip() for line in ''.join(self.text).splitlines())
        text=re.sub(r'\n{3,}','\n\n',text).strip()
        return ''.join(self.html), text


def parsed_html(value, markers=None):
    parser=SourceHTML(markers); parser.feed(html_source(value)); return parser


def plain(value):
    return parsed_html(value).value()[1]


def object_value(value):
    if isinstance(value, str):
        try: return json.loads(value)
        except (ValueError, TypeError): return None
    return value


def answer_variants(value):
    values=value if isinstance(value,list) else [value]
    result=[]
    for item in [part for value in values for part in (str(value).split('|') if isinstance(value,str) else [value])]:
        if item is None: continue
        if isinstance(item,(dict,list)): continue
        item=unescape(str(item)).strip()
        if not item: continue
        candidates=[item]
        if '(' in item and ')' in item:
            candidates += [re.sub(r'\([^)]*\)','',item), item.replace('(','').replace(')','')]
        for candidate in candidates:
            candidate=re.sub(r'\s+',' ',candidate).strip()
            if candidate and candidate not in result: result.append(candidate)
    return result


def options_of(value):
    if not isinstance(value,list): return []
    result=[]
    for i,item in enumerate(value):
        if isinstance(item,str): label=chr(65+i); text=plain(item)
        elif isinstance(item,dict):
            label=str(item.get('name',item.get('value',item.get('key',chr(65+i)))))
            raw=item.get('option',item.get('text',item.get('title','')))
            text=plain(raw)
        else: continue
        multimedia=isinstance(item,dict) and bool(re.search(r'<(?:img|table)\b',html_source(raw),re.I))
        if label and (text or multimedia):
            option={'value':label,'text':text or label}
            if multimedia: option['contentHtml']=parsed_html(raw).value()[0]
            result.append(option)
    return result


def word_rule(instruction):
    text=instruction.upper(); words={'ONE':1,'TWO':2,'THREE':3,'FOUR':4}
    match=re.search(r'(?:NO MORE THAN |UP TO |EXACTLY )?(ONE|TWO|THREE|FOUR|[1-4]) WORD',text)
    result={}
    if match: result['maxWords']=words.get(match[1],int(match[1]) if match[1].isdigit() else 0)
    if 'NUMBER' in text: result['allowNumber']=True
    return result


def paragraphs_of(value):
    text=plain(value)
    lines=[line for line in text.splitlines() if line.strip()]
    return [{'label':str(i+1),'text':line} for i,line in enumerate(lines)]


def doc_rows(data, code):
    for doc in data.get('docList') or []:
        if str(doc.get('code'))==str(code):
            yield from (doc.get('list') or [])


def practice_source_type(group, meta):
    """Reuse the existing site's type rules; no difficulty scores are invented."""
    kind=group['type']; instruction=group.get('instruction','').lower()
    source_types=group.get('sourceContentTypes',[])
    if kind=='text':
        if meta['subject']=='listening':
            if meta['part']==1:return 'part1_fill'
            if meta['part']==4:return 'part4_fill'
            if re.search(r'\b(?:map|plan)\b',instruction):return 'map'
            return 'text'
        if re.search(r'\bsummary\b',instruction):return 'summary_fill'
        if re.search(r'answer\s+the\s+questions?\b',instruction):return 'short_answer'
        if re.search(r'\b(?:table|notes?|flow\s*chart|diagram|chart)\b',instruction) or '<table' in group.get('contextHtml','').lower():return 'table_fill'
        if re.search(r'\bsentences?\b',instruction):return 'sentence_fill'
        return 'text'
    if kind=='matching' and meta['subject']=='reading':
        if '311' in source_types:return 'paragraph_main'
        if re.search(r'which\s+(?:paragraph|section)\b',instruction) and re.search(r'contain|information',instruction):return 'paragraph_info'
    if kind=='choice':return 'single_choice'
    if kind=='multi':return 'multiple_choice'
    return kind


def prompt_for_gap(context_text, number):
    """Keep the original rich context once; use a concise label for each input."""
    marker=f'[{number}]'
    line=next((line for line in context_text.splitlines() if marker in line),'')
    if not line:return f'Gap {number} (see above)'
    if len(re.findall(r'\[\d+\]\s*_{2,}',line))>1:return f'Answer for gap {number}.'
    if len(line)>500:
        sentences=re.split(r'(?<=[.!?])\s+',line)
        line=next((sentence for sentence in sentences if marker in sentence),line)
    return line


def convert(data, meta):
    problems=[]; observed=Counter(); groups=[]; pending_instruction=[]; pending_context=[]; number=int(data.get('initNum') or 1); local_id=0
    if data.get('qId') is not None and str(data['qId'])!=str(meta.get('sourceQuestionId')):
        problems.append('Source question identifier does not match the catalog')
    if data.get('parentType') is not None and str(data['parentType'])!=('1' if meta['subject']=='listening' else '2'):
        problems.append('Source subject does not match the catalog')
    current=None

    def get_group(kind):
        nonlocal current
        if current is None or current['type'] != kind or pending_instruction:
            instruction='\n'.join(pending_instruction).strip()
            if not instruction and current: instruction=current['instruction']
            current={'id':f'g{len(groups)+1}','type':kind,'instruction':instruction or 'Answer the questions below.','questions':[]}
            if pending_context: current['contextHtml']='\n'.join(pending_context); pending_context.clear()
            current['sourceType']='part1_fill' if kind=='text' and meta['subject']=='listening' and meta['part']==1 else ('part4_fill' if kind=='text' and meta['subject']=='listening' and meta['part']==4 else kind)
            groups.append(current); pending_instruction.clear()
        return current

    def add_question(group, prompt, answers, extra=None):
        nonlocal number, local_id
        local_id += 1
        question={'id':local_id,'sourceSlot':number,'sourceNumber':str(number),'prompt':prompt or f'Question {number}','answers':answers}
        if group['type']=='text': question.update(word_rule(group['instruction']))
        if not answers: problems.append(f'Missing answer at source question {number}')
        if extra: question.update(extra)
        group['questions'].append(question); number += 1
        return question

    def record_source_type(group,source_type):
        group.setdefault('sourceContentTypes',[])
        if source_type not in group['sourceContentTypes']:group['sourceContentTypes'].append(source_type)

    contents=sorted(data.get('contentList') or [],key=lambda row:int(row.get('contentOrder') or 0))
    for row in contents:
        content=object_value(row.get('content')); analysis=object_value(row.get('contentAnalyze')) or {}
        if not isinstance(content,dict): problems.append('Unparseable content '+str(row.get('contentId'))); continue
        source_type=str(content.get('sctype',row.get('type',''))); observed[source_type] += 1
        title=content.get('title',''); instruction=plain(title)
        if source_type=='101':
            pending_instruction.append(instruction)
            if re.search(r'<(?:img|table)\b',html_source(title),re.I): pending_context.append(parsed_html(title).value()[0])
            current=None; continue
        if source_type=='105': continue
        options=options_of(content.get('options'))
        children=content.get('content')
        if source_type=='223':
            # In this source table format options are QUESTION ROWS, title is
            # the RESPONSE BANK, and value is an ordered answer per row.
            response_bank=content.get('title') or []
            answers=content.get('value') or []
            if not isinstance(response_bank,list) or not isinstance(answers,list) or len(options)!=len(answers):
                problems.append('Invalid table matching schema'); continue
            group=get_group('matching')
            record_source_type(group,source_type)
            group['options']=[{'value':str(value),'text':str(value)} for value in response_bank]
            for row_option,value in zip(options,answers):
                add_question(group,row_option['text'],answer_variants(value),{'sourceCode':str(content.get('sccode'))+'-'+row_option['value']})
            continue
        if isinstance(children,list) and children and all(isinstance(x,dict) for x in children):
            # Rich-text fill and select tables carry their own answer records.
            all_options=options or options_of(content.get('list'))
            kind='matching' if all_options else 'text'
            group=get_group(kind)
            record_source_type(group,source_type)
            if all_options: group['options']=all_options
            source_image=content.get('image')
            if isinstance(source_image,dict) and source_image.get('imageName'):
                image_html=parsed_html('<img src="'+escape(str(source_image['imageName']),quote=True)+'" alt="原题配图">').value()[0]
                group['contextHtml']=group.get('contextHtml','')+image_html
            marker_map={}; child_numbers=[]; cursor=number
            for child in children:
                count=int(child.get('sccnt') or 1)
                marker_map[str(child.get('sccode',''))]=list(range(cursor,cursor+count)) if count>1 else cursor
                child_numbers.append(cursor); cursor += count
            parser=parsed_html(title,marker_map); context,context_text=parser.value()
            if parser.unknown_markers: problems.append('Unmapped rich-text blanks: '+','.join(parser.unknown_markers))
            if parser.unmapped_inputs: problems.append(f'Unmapped rich-text inputs: {parser.unmapped_inputs}')
            group['contextHtml']=group.get('contextHtml','')+context
            for child,start in zip(children,child_numbers):
                count=int(child.get('sccnt') or 1); answers=answer_variants(child.get('value'))
                extra={'sourceCode':child.get('sccode')}
                explanation=plain(analysis.get('body',''))
                if explanation: extra['explanation']=explanation
                if count>1:
                    extra['setId']=str(child.get('sccode') or f'{meta["id"]}-{number}')
                for offset in range(count):
                    prompt=prompt_for_gap(context_text,start+offset)
                    slot_answers=answers
                    if count>1 and str(child.get('exchange','1'))=='0' and isinstance(child.get('value'),list) and len(child['value'])==count:
                        slot_answers=answer_variants(child['value'][offset])
                    # Literal underscores in source blanks must not be fed to
                    # the site's Markdown parser as emphasis delimiters.
                    add_question(group,prompt,slot_answers,{**extra,'promptHtml':escape(prompt)})
            continue
        if options:
            raw=answer_variants(content.get('value'))
            values={option['value']:option['text'] for option in options}
            if max(int(content.get('sccnt') or 1),int(content.get('valcnt') or 1))>1 and len(raw)==1:
                parts=re.split(r'[,;\s]+',raw[0])
                if len(parts)==1 and all(len(key)==1 for key in values): parts=list(raw[0])
                if len(parts)>1 and all(part in values for part in parts): raw=parts
            labels={text.upper() for text in values.values()}
            if labels=={'TRUE','FALSE','NOT GIVEN'}: kind='tfng'
            elif labels=={'YES','NO','NOT GIVEN'}: kind='ynng'
            else: kind='multi' if max(int(content.get('sccnt') or 1),int(content.get('valcnt') or 1))>1 else 'choice'
            group=get_group(kind); extra={'sourceCode':content.get('sccode')}
            record_source_type(group,source_type)
            if re.search(r'<(?:img|table)\b',html_source(title),re.I): extra['promptHtml']=parsed_html(title).value()[0]
            if kind in {'tfng','ynng'}: answers=[values.get(value,value).upper() for value in raw]
            else: answers=raw; extra['options']=options
            explanation=plain(analysis.get('body',''))
            if explanation: extra['explanation']=explanation
            count=int(content.get('sccnt') or 1)
            if kind=='multi':
                group['options']=options
                count=max(count,int(content.get('valcnt') or 1),len(answers)); extra['setId']=str(content.get('sccode') or f'{meta["id"]}-{number}'); extra['blockId']=extra['setId']
            for offset in range(count): add_question(group,instruction,answers,extra)
            continue
        # A standalone text answer still has a source title and explicit value.
        if 'value' in content:
            group=get_group('text'); extra={'sourceCode':content.get('sccode')}
            record_source_type(group,source_type)
            explanation=plain(analysis.get('body',''))
            if explanation: extra['explanation']=explanation
            add_question(group,instruction,answer_variants(content.get('value')),extra); continue
        problems.append(f'Unsupported source content type {source_type} ({content.get("name", "")})')

    expected=int(data.get('allCount') or 0)
    actual=sum(len(group['questions']) for group in groups)
    if expected and expected!=actual: problems.append(f'Question count mismatch: source {expected}, converted {actual}')
    if not actual: problems.append('No questions converted')
    for group in groups:
        group['sourceType']=practice_source_type(group,meta)
        for question in group['questions']:
            if group['type'] in {'choice','matching','multi'}:
                choices=question.get('options') or group.get('options') or []
                allowed={option['value'].casefold():option['value'] for option in choices}
                if not allowed or any(answer.casefold() not in allowed for answer in question['answers']):
                    problems.append(f'Answer does not match the source option bank at question {question["sourceSlot"]}')
                else:question['answers']=[allowed[answer.casefold()] for answer in question['answers']]
    subject=meta['subject']; title=plain(data.get('article')) or meta['title']
    if len(title)>200:title=plain(data.get('qTopic')) or meta['title']
    article_word_count=None;article_image_count=0
    result={'id':meta['id'],'title':title,'titleCn':meta['title'],'subject':subject,'part':meta['part'],
        'duration':1200 if subject=='reading' else 600,'source':'剑桥雅思','cambridge':meta['cambridge'],
        'sourceQuestionId':meta.get('sourceQuestionId'),'sourceUrl':meta.get('sourceUrl'),
        'paragraphs':[],'groups':groups,'status':'pending' if problems else 'ready'}
    if subject=='reading':
        articles=[]
        for record in doc_rows(data,'105'):
            body=object_value(record.get('body'))
            if isinstance(body,dict): articles.append(body.get('title',''))
            elif isinstance(body,str): articles.append(body)
        article='\n'.join(articles)
        # Some export formats put an actual full article in the article field;
        # a title is never accepted as a substitute for the source passage.
        if not plain(article) and len(re.findall(r"\b[A-Za-z][A-Za-z'’\u2010-\u2015-]*\b",plain(data.get('article'))))>=150:
            article=html_source(data['article'])
        if not plain(article): problems.append('Missing reading article')
        source_markers={}
        for group in groups:
            for question in group['questions']:
                source_markers.setdefault(question.get('sourceCode'),question['sourceSlot'])
        article_parser=parsed_html(article,source_markers)
        result['articleHtml']=article_parser.value()[0]; result['paragraphs']=paragraphs_of(article)
        article_word_count=len(re.findall(r"\b[A-Za-z][A-Za-z'’\u2010-\u2015-]*\b",plain(article)))
        article_image_count=len(article_parser.images)
        if article_word_count<150 and not article_image_count:
            problems.append(f'Reading article appears incomplete: only {article_word_count} English words and no document images')
    else:
        transcripts=[str(record.get('body') or '') for record in doc_rows(data,'7')]
        transcript='\n'.join(transcripts); result['transcriptHtml']=parsed_html(transcript).value()[0]; result['paragraphs']=paragraphs_of(transcript)
        audio=''
        for record in doc_rows(data,'6'):
            body=object_value(record.get('body'))
            if isinstance(body,dict): audio=body.get('audio',body.get('src','')) or audio
            elif isinstance(body,str) and body.startswith('http'): audio=body
        result['audio']={'src':audio,'status':'ready' if audio else 'pending','mimeType':'audio/mpeg'}
        if not audio: problems.append('Missing listening audio')
        if not plain(transcript): result['transcriptMissing']=True
    result['status']='pending' if problems else 'ready'
    if problems: result['conversionIssues']=problems
    return result, {'id':meta['id'],'qid':meta.get('sourceQuestionId'),'sourceCount':expected,'convertedCount':actual,'status':result['status'],'sourceTypes':dict(observed),'articleWordCount':article_word_count,'articleImageCount':article_image_count,'issues':problems}


def localize_media(passage, manifest):
    assets={item['source_url']:item for item in manifest.get('assets',[]) if item.get('source_url')}
    replacements={url:'/api/guest/cambridge/media/'+item['relative_path'] for url,item in assets.items() if item.get('status')=='ready'}
    audio=passage.get('audio')
    if audio:
        asset=assets.get(audio.get('src'))
        if asset and asset.get('status')=='ready':
            audio['src']=replacements[asset['source_url']]
            audio['durationSeconds']=asset.get('duration_seconds',0)
            if audio['durationSeconds']:
                passage['duration']=max(60,round(audio['durationSeconds']))
            audio['status']='ready'
        else:
            audio['status']='pending'
    def replace(value):
        if isinstance(value,str):
            for before,after in replacements.items(): value=value.replace(before,after)
            return value
        if isinstance(value,list):return [replace(item) for item in value]
        if isinstance(value,dict):return {key:replace(item) for key,item in value.items()}
        return value
    return replace(passage)


def run(raw_dir, media_manifest=None):
    directory=ROOT/'public/data/cambridge'; index=json.loads((directory/'index.json').read_text())
    media=json.loads(media_manifest.read_text()) if media_manifest else None
    destination=directory/'passages'; destination.mkdir(parents=True,exist_ok=True)
    report=[]; by_id={}; missing=[]
    for meta in index['passages']:
        if not meta.get('sourceQuestionId'): continue
        source=raw_dir/(str(meta['sourceQuestionId'])+'.json')
        if not source.exists(): missing.append(meta['id']); continue
        payload=json.loads(source.read_text())
        if payload.get('code')!=200 or not isinstance(payload.get('data'),dict):
            report.append({'id':meta['id'],'qid':meta['sourceQuestionId'],'status':'pending','issues':['Source export did not return question data']}); continue
        passage,audit=convert(payload['data'],meta)
        if media is not None: passage=localize_media(passage,media)
        (destination/(meta['id']+'.json')).write_text(json.dumps(passage,ensure_ascii=False,indent=2)+'\n')
        updated={**meta,'title':passage['title'],'titleCn':meta['title'],'questionCount':sum(len(group['questions']) for group in passage['groups']),
            'types':list(dict.fromkeys(SOURCE_TYPE_LABELS.get(group.get('sourceType'),TYPE_LABELS[group['type']]) for group in passage['groups'])),
            'file':f'data/cambridge/passages/{meta["id"]}.json','status':passage['status']}
        if passage.get('audio'): updated.update(audio=passage['audio'],audioStatus=passage['audio']['status'])
        if audit['issues']: updated['conversionIssues']=audit['issues']
        else: updated.pop('conversionIssues',None)
        by_id[meta['id']]=updated; report.append(audit)
    index['passages']=[by_id.get(meta['id'],meta) for meta in index['passages']]
    for volume in index['volumes']:
        for test in volume['tests']:
            for subject in ('reading','listening'): test[subject]=[by_id.get(meta['id'],meta) for meta in test[subject]]
    ready=sum(meta['status']=='ready' for meta in index['passages'])
    pending_audio=sum(meta['status']=='ready' and meta['subject']=='listening' and not (meta.get('audio',{}).get('status')=='ready' and meta.get('audio',{}).get('src')) for meta in index['passages'])
    playable=ready-pending_audio
    question_count=sum(meta.get('questionCount',0) for meta in index['passages'])
    index['summary'].update(importedParts=ready,questionCount=question_count,playableParts=playable,pendingAudioParts=pending_audio)
    if ready==len(index['passages']):
        index['migrationStatus']='partial_audio' if pending_audio else 'complete'
        index['note']=f'全部题目与答案已收录；{pending_audio} 个听力部分音频待补齐。' if pending_audio else '全部题目、答案与听力音频已收录。'
    else:
        index['migrationStatus']='in_progress'
        index['note']=f'已导入 {ready} / {len(index["passages"])} 个来源部分；未完成条目保留待迁移状态。'
    (directory/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    summary={'catalogParts':len(index['passages']),'rawFilesFound':len(report),'readyParts':ready,'questionCount':question_count,'playableParts':playable,'pendingAudioParts':pending_audio,'pendingExports':len(missing),
        'conversionIssueParts':sum(bool(row.get('issues')) for row in report),'sourceTypes':dict(sum((Counter(row.get('sourceTypes',{})) for row in report),Counter()))}
    output={'summary':summary,'missingExports':missing,'parts':report}
    (ROOT/'docs/cambridge-migration-report.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(summary))
    return summary


if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--raw-dir',type=Path,required=True); parser.add_argument('--media-manifest',type=Path)
    args=parser.parse_args(); run(args.raw_dir,args.media_manifest)
