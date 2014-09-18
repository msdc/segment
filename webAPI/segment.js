/**
 * Created by wang on 2014/9/18.
 */
var easypost = require('easypost');
var Segment=require('segment').Segment;
var fs = require('fs');
var path = require('path'),
    dictFileName=path.resolve("lib", "dict/", "./grade.txt");
var segment=new Segment();
// 使用默认的识别模块及字典，载入字典文件需要1秒，仅初始化时执行一次即可
segment.useDefault();

//分词处理
exports.newsSegment=function(req,res){
    easypost.get(req, res, function (data) {
        var segmentWords=segment.doSegment(data.newsContent);
        res.send(segmentWords);
    });
};

exports.gradeSplit=function(req,res){
    easypost.get(req, res, function (data) {
        var segmentWords=segment.doSegment(data.newsContent);
        var grade=gradeSplit(segmentWords);
        res.send(grade);
    });
};

//极性划分
function gradeSplit(words){
    var splitResult={};
    var totalScore=0;//总分
    var positiveScore=0;//正得分
    var negativeScore=0;//负得分
    var positiveWords=[];//正情感词集合
    var positiveWordsCount=0;//正得分单词数
    var negativeWordsCount=0;//负得分单词数
    var negativeWords=[];//负情感词集合
    var noScoreWordsCount=0;//没有情感倾向词个数

    if (!fs.existsSync(dictFileName)) {
        throw Error('Cannot find dict file "' + dictFileName + '".');

    } else {
        var data = fs.readFileSync(dictFileName, 'utf8');
        data = data.split(/\r?\n/);

        for (var wordIndex in words) {
            var word=words[wordIndex];
            for (var dictIndex in data) {
                var line = data[dictIndex];
                var blocks = line.split('\t');
                if (blocks.length > 2) {
                    var w1 = blocks[0].trim();
                    var w2 = blocks[1].trim();
                    var grade = Number(blocks[2]);

                    if ( word.w==w1 || word.w==w2 ) {//有情感词
                        if (grade > 0) {//正得分
                            positiveScore = positiveScore + grade;//正得分
                            positiveWords.push(word.w+"="+grade);//正得分集合
                            positiveWordsCount++;//正得分数量
                            break;//查找到则终止循环
                        } else {
                            negativeScore = negativeScore + grade;//负得分
                            negativeWords.push(word.w+"="+grade);//负得分集合
                            negativeWordsCount++;//负得分数量
                            break;
                        }
                    }
                }
            }
        }

        noScoreWordsCount=words.length-(positiveWordsCount+negativeWordsCount);
        totalScore=positiveScore+negativeScore;

        splitResult.positiveScore=positiveScore;
        splitResult.positiveWords=positiveWords;
        splitResult.positiveWordsCount=positiveWordsCount;
        splitResult.negativeScore=negativeScore;
        splitResult.negativeWords=negativeWords;
        splitResult.negativeWordsCount=negativeWordsCount;
        splitResult.totalScore=totalScore;
        splitResult.noScoreWordsCount=noScoreWordsCount;

        return splitResult;
    }
};

//加载极性词
exports.loadGradeWords=function(req,res){
    var data=[];
    if (!fs.existsSync(dictFileName)) {
        throw Error('Cannot find dict file "' + dictFileName + '".');

    } else {
        data = fs.readFileSync(dictFileName, 'utf8');
        data = data.split(/\r?\n/);
    }
    res.send(data);
};

//更新极性词值
exports.updateGradeWords=function(req,res){
    easypost.get(req, res, function (postData){
        var data=[];
        if (!fs.existsSync(dictFileName)) {
            throw Error('Cannot find dict file "' + dictFileName + '".');

        } else {
            data = fs.readFileSync(dictFileName, 'utf8');
            data = data.split(/\r?\n/);
        }

        var updatedData=[];

        //data是行数组
        for(var lineIndex in data){
            var line = data[lineIndex];
            var blocks = line.split('\t');//列数组
            if(blocks.length>2){
                if(blocks[0]==postData.w1&&blocks[1]==postData.w2){
                    blocks[2]=postData.grade;
                    line=blocks.join('\t');
                }
            }
            updatedData.push(line);
        }

        //更新后的文件
        var updatedFileString=updatedData.join('\r\n');
        fs.writeFile(dictFileName,updatedFileString,function(err){
            if(err){
                console.log(err);
                res.send({success:false});
            }else{
                res.send({success:true});
            }
        });
    });
};

