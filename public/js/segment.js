/**
 * Created by wang on 2014/9/16.
 */
$(function(){
    //分词按钮事件
    $('#btn_segment').click(buttonClickHandler);

    //菜单点击事件
    $('#menu_tab').find('a').click(menuClickHandler);

    //加载极性词
    $('#btn_load_words').click(btnLoadWordsHandler);

});

function btnLoadWordsHandler(){
    var tbody=$('#table_grade').find('tbody');

    tbody.html("<tr><td colspan=\"5\">载入中...</td></tr>");

    var request = $.ajax({
        url: "/maintain/loadGradeWords",
        type: "GET"
    });

    request.done(function(data){
        var wordsArr=data;
        tbody.html('');//清空表体元素

        for(var i=0;i<wordsArr.length;i++){
            var line=wordsArr[i];
            var blocks = line.split('\t');
            if(blocks.length>2){
                var row="<tr><td>"+(i+1)+"</td><td>"+blocks[0].trim()+"</td><td>"+blocks[1].trim()+"</td><td><input disabled=\"disabled\" value=\'"+Number(blocks[2])+"\'/></td><td><button class=\'btn btn-primary\' value=\'"+i+"\'>修改</button></td></tr>";
                tbody.append(row);
            }
        }

        //给按钮添加click事件
        tbody.find('button').click(buttonUpdateHandler);
    });
}

function buttonUpdateHandler(){
    var self=$(this);
    var name=$(this).text();
    var gradeInput=self.parent().siblings().find('input');
    var rowNum=self.parent().siblings().eq(0).text();//文本行号
    var w1=self.parent().siblings().eq(1).text();
    var w2=self.parent().siblings().eq(2).text();
    if(name=='修改'){
        gradeInput.removeAttr('disabled');
        self.text('保存');
    }else if(name=='保存'){
        //Save the value to the file.
        var grade=Number(gradeInput.val());

        var request = $.ajax({
            url: "/maintain/updateGradeWords",
            type: "POST",
            data: { w1 : w1,w2: w2, grade:grade,rowNum:rowNum}
        });

        request.done(function(data){
            if(data.success){
                gradeInput.attr({disabled:"disabled"});
                self.text('修改');
            }
        });
    }
}

//分词按钮点击事件处理函数
function buttonClickHandler(){
    $('#segment_result').text('分词处理中...')
        .css({color:"red"});
    getSegmentResult();//分词
    gradeSplit();//极性划分
}

//菜单点击事件处理函数
function menuClickHandler(){
    var name=$(this).attr('name');
    var parent=$(this).parent();
    //移除样式
    parent.addClass('active').siblings()
        .removeClass();

    //页面内容显示
    if(name=='segment'){
        $('#grade_split').hide();
        $('#news_segment').show();
    }else if(name=='grade'){
        $('#grade_split').show();
        $('#news_segment').hide();
    }
}

function gradeSplit(){
    var newsContent=$('#news_content').val();
    var request = $.ajax({
        url: "/maintain/gradeSplit",
        type: "POST",
        data: { newsContent : newsContent }
    });
    request.done(gradeSplitHandler);
}

//发送ajax请求
function getSegmentResult(){
    var newsContent=$('#news_content').val();
    var request = $.ajax({
        url: "/maintain/newsSegment",
        type: "POST",
        data: { newsContent : newsContent }
    });
    request.done(segmentDataHandler);
}

//处理分词结果
function segmentDataHandler(data){
    var result=data;
    var resultString=' | ';
    for(var index in result){
        resultString=resultString+result[index].w+' | ';
    }
    $('#segment_result').text(resultString)
        .css({color:"blue"});
}

//处理极性划分
function gradeSplitHandler(data){
    var result=data;
    var positiveWordsString=' ';
    var negativeWordsString=' ';
    var positiveWords=result.positiveWords;
    var negativeWords=result.negativeWords;

    if(result){
        $('#totalScore').text(result.totalScore).css({color:"blue"});
        $('#positiveScore').text(result.positiveScore).css({color:"blue"});
        $('#negativeScore').text(result.negativeScore).css({color:"blue"});
        $('#positiveWordsCount').text(result.positiveWordsCount).css({color:"blue"});
        $('#negativeWordsCount').text(result.negativeWordsCount).css({color:"blue"});
        $('#noScoreWordsCount').text(result.noScoreWordsCount).css({color:"blue"});

        for(var index in positiveWords){
            var str=', ';
            if(index==(positiveWords.length-1)){
                str='.';
            }
            positiveWordsString=positiveWordsString+positiveWords[index]+str;
        }

        for(var index in negativeWords){
            var str=', ';
            if(index==(negativeWords.length-1)){
                str='.';
            }
            negativeWordsString=negativeWordsString+negativeWords[index]+str;
        }

        $('#positiveWords').text(positiveWordsString)
            .css({color:"blue"});

        $('#negativeWords').text(negativeWordsString)
            .css({color:"blue"});

        var emotionScore=function(){
            if(result.positiveScore>result.negativeScore){
                return 1;
            }else if(result.positiveScore==result.negativeScore){
                return 0;
            }else{
                return -1;
            }
        };

        $('#emotionScore').text(emotionScore)
            .css({color:"blue"});
    }
}
