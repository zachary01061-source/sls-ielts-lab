import importlib.util
import json
from pathlib import Path
import unittest

SPEC=importlib.util.spec_from_file_location('cambridge_converter',Path(__file__).parents[1]/'scripts/convert-cambridge-xdf.py')
module=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(module)


def row(content,order=1):
    return {'content':json.dumps(content),'contentOrder':str(order),'type':content['sctype']}


def base(contents,count,subject='reading',start=1,article=None):
    article=article if article is not None else '<p>'+' '.join(['A source passage contains actual full English material.']*25)+'</p>'
    docs=[{'code':'105','list':[{'body':json.dumps({'title':article})}]}] if subject=='reading' else [
        {'code':'7','list':[{'body':'<p>A source transcript.</p>'}]},
        {'code':'6','list':[{'body':{'audio':'https://example.com/part.mp3'}}]}]
    return {'article':'Source title','allCount':str(count),'initNum':str(start),'contentList':[row(content,i) for i,content in enumerate(contents)],'docList':docs}


def meta(subject='reading'):
    return {'id':'cambridge-5-test-1-'+subject+'-1','title':'剑5 Test1','part':1,'subject':subject,'sourceQuestionId':'1','sourceUrl':'https://example.com/source','cambridge':{'volume':5,'test':1}}


class CambridgeConverterTests(unittest.TestCase):
    def test_table_keeps_words_and_both_numbered_blanks(self):
        contents=[{'sctype':'101','title':'Write NO MORE THAN TWO WORDS for each answer.'},
            {'sctype':'216','title':'<table><tr><td>Before <span role="replace" sccode="answer"><input /></span> after <span role="replace" sccode="junk">.</span></td></tr></table>',
             'content':[{'sccode':'answer','sccnt':2,'value':['first','second'],'exchange':'1'}]}]
        passage,audit=module.convert(base(contents,2,'listening',11),meta('listening'))
        self.assertEqual(audit['issues'],[])
        group=passage['groups'][0]
        self.assertIn('[11] ______ [12] ______',group['contextHtml'])
        self.assertIn(' after ',group['contextHtml'])
        self.assertIn('</table>',group['contextHtml'])
        self.assertEqual([q['sourceSlot'] for q in group['questions']],[11,12])
        self.assertEqual(group['questions'][0]['maxWords'],2)
        self.assertEqual(group['questions'][0]['setId'],group['questions'][1]['setId'])

    def test_multi_letters_are_individual_answers(self):
        content={'sctype':'201','sccnt':2,'value':'CE','title':'Choose TWO answers.',
            'sccode':'set','options':[{'name':letter,'option':'Option '+letter} for letter in 'ABCDE']}
        passage,audit=module.convert(base([content],2),meta())
        self.assertEqual(audit['issues'],[])
        group=passage['groups'][0]
        self.assertEqual(group['type'],'multi')
        self.assertEqual(len(group['questions']),2)
        self.assertEqual(group['questions'][0]['answers'],['C','E'])
        self.assertEqual(group['questions'][0]['blockId'],group['questions'][1]['blockId'])

    def test_table_choice_is_ordered_not_unordered_multi(self):
        content={'sctype':'223','sccnt':2,'value':['C','A'],'title':['A','B','C'],
            'options':[{'name':1,'option':'First statement'},{'name':2,'option':'Second statement'}]}
        passage,audit=module.convert(base([content],2,start=14),meta())
        self.assertEqual(audit['issues'],[])
        group=passage['groups'][0]
        self.assertEqual(group['type'],'matching')
        self.assertEqual(group['options'],[{'value':letter,'text':letter} for letter in 'ABC'])
        self.assertEqual([q['answers'] for q in group['questions']],[['C'],['A']])
        self.assertEqual([q['prompt'] for q in group['questions']],['First statement','Second statement'])

    def test_tfng_and_yes_no_map_source_option_codes(self):
        for source_options,answer,kind,expected in [([('T','TRUE'),('F','FALSE'),('NG','NOT GIVEN')],'F','tfng','FALSE'),([('Y','YES'),('N','NO'),('NG','NOT GIVEN')],'NG','ynng','NOT GIVEN')]:
            content={'sctype':'203','sccnt':1,'value':answer,'title':'A statement.',
                'options':[{'name':name,'option':text} for name,text in source_options]}
            passage,audit=module.convert(base([content],1),meta())
            self.assertEqual(audit['issues'],[])
            self.assertEqual(passage['groups'][0]['type'],kind)
            self.assertEqual(passage['groups'][0]['questions'][0]['answers'],[expected])

    def test_article_heading_marker_keeps_original_number(self):
        content={'sctype':'311','options':[{'name':'i','option':'First heading'},{'name':'ii','option':'Second heading'}],
            'content':[{'sccode':'heading','sccnt':1,'value':'ii'}]}
        article='<p>'+' '.join(['A source paragraph contains the article text.']*25)+'</p><b role="replace" sccode="heading"></b>'
        passage,audit=module.convert(base([content],1,start=14,article=article),meta())
        self.assertEqual(audit['issues'],[])
        self.assertIn('[14] ______',passage['articleHtml'])
        self.assertEqual(passage['groups'][0]['questions'][0]['sourceSlot'],14)
        self.assertEqual(passage['groups'][0]['sourceType'],'paragraph_main')

    def test_count_mismatch_and_unknown_types_stay_pending(self):
        passage,audit=module.convert(base([{'sctype':'999','title':'Unsupported'}],2),meta())
        self.assertEqual(passage['status'],'pending')
        self.assertTrue(any('Unsupported' in issue for issue in audit['issues']))
        self.assertTrue(any('count mismatch' in issue for issue in audit['issues']))

    def test_source_answer_alternatives_and_optional_words(self):
        self.assertEqual(module.answer_variants(['move around|move about']),['move around','move about'])
        self.assertEqual(module.answer_variants(['(the) roof']),['(the) roof','roof','the roof'])

    def test_image_only_options_keep_original_images_and_choice_type(self):
        content={'sctype':'202','sccnt':1,'value':'B','title':'<p>Choose the graph.</p><img src="/figures/key.png" />',
            'options':[{'name':'A','option':'<img src="https://example.com/a.png" />'},{'name':'B','option':'<img src="https://example.com/b.png" />'}]}
        passage,audit=module.convert(base([content],1),meta())
        self.assertEqual(audit['issues'],[])
        group=passage['groups'][0];self.assertEqual(group['type'],'choice')
        question=group['questions'][0]
        self.assertEqual(len(question['options']),2)
        self.assertIn('https://example.com/b.png',question['options'][1]['contentHtml'])
        self.assertIn('https://ieltscat.xdf.cn/figures/key.png',question['promptHtml'])

    def test_verified_audio_localization_uses_real_duration(self):
        passage={'audio':{'src':'https://example.com/part.mp3','status':'ready'},'duration':600,
            'articleHtml':'<img src="https://example.com/figure.png">'}
        manifest={'assets':[{'source_url':'https://example.com/part.mp3','relative_path':'audio/1.mp3','status':'ready','duration_seconds':327.42},
            {'source_url':'https://example.com/figure.png','relative_path':'images/a.png','status':'ready'}]}
        localized=module.localize_media(passage,manifest)
        self.assertEqual(localized['audio']['src'],'/api/guest/cambridge/media/audio/1.mp3')
        self.assertEqual(localized['duration'],327)
        self.assertEqual(localized['audio']['durationSeconds'],327.42)
        self.assertIn('/api/guest/cambridge/media/images/a.png',localized['articleHtml'])

    def test_unverified_audio_remains_pending(self):
        localized=module.localize_media({'audio':{'src':'https://example.com/unknown.mp3','status':'ready'}},{'assets':[]})
        self.assertEqual(localized['audio']['status'],'pending')

    def test_fill_subtypes_follow_actual_instructions_and_context(self):
        for instruction,context,expected in [('Complete the summary below.','','summary_fill'),('Complete the notes below.','','table_fill'),('Complete the sentences below.','','sentence_fill'),('Write one word.','<table></table>','table_fill')]:
            group={'type':'text','instruction':instruction,'contextHtml':context,'sourceContentTypes':['216']}
            self.assertEqual(module.practice_source_type(group,meta()),expected)
        for part,expected in [(1,'part1_fill'),(4,'part4_fill')]:
            metadata=meta('listening');metadata['part']=part
            self.assertEqual(module.practice_source_type({'type':'text'},metadata),expected)

    def test_generic_matching_is_not_promoted_to_paragraph_information(self):
        group={'type':'matching','instruction':'Match each person with their opinion.','sourceContentTypes':['208']}
        self.assertEqual(module.practice_source_type(group,meta()),'matching')
        group['instruction']='Which paragraph contains the following information?'
        self.assertEqual(module.practice_source_type(group,meta()),'paragraph_info')

    def test_reading_title_cannot_replace_missing_full_article(self):
        content={'sctype':'216','title':'<p><span role="replace" sccode="gap"><input /></span></p>',
            'content':[{'sccode':'gap','sccnt':1,'value':['answer']}]}
        passage,audit=module.convert(base([content],1,article='<p>Only a title.</p>'),meta())
        self.assertEqual(passage['status'],'pending')
        self.assertTrue(any('appears incomplete' in issue for issue in audit['issues']))
        self.assertEqual(audit['articleWordCount'],3)

    def test_actual_6958_summary_is_rendered_once_without_repeated_markdown(self):
        source=json.loads((Path(__file__).parent/'fixtures/cambridge-xdf-6958.json').read_text())['data']
        metadata=meta();metadata['sourceQuestionId']='6958'
        passage,audit=module.convert(source,metadata)
        self.assertEqual(audit['issues'],[])
        questions={question['sourceSlot']:question for group in passage['groups'] for question in group['questions']}
        group=next(group for group in passage['groups'] if any(q['sourceSlot']==4 for q in group['questions']))
        self.assertIn('accepted the contract to produce a dictionary',module.plain(group['contextHtml']))
        self.assertEqual(group['contextHtml'].count('accepted the contract'),1)
        for number in range(4,8):
            self.assertIn(f'[{number}] ______',group['contextHtml'])
            self.assertEqual(questions[number]['prompt'],f'Answer for gap {number}.')
            self.assertEqual(questions[number]['promptHtml'],f'Answer for gap {number}.')
            self.assertNotIn('______',questions[number]['prompt'])
        self.assertEqual([questions[number]['answers'] for number in range(4,8)],
            [['clerks','copying clerks'],['library'],['stability'],['pension']])


if __name__=='__main__':unittest.main()
