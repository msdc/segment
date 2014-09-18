/**
 * Created by wang on 2014/9/16.
 */
$(function(){
    $('#btn_segment').click(function(){
        $('#segment_result').text('分词处理中...')
            .css({color:"red"});
        getSegmentResult();//分词
        gradeSplit();//极性划分
    });
});

function gradeSplit(){
    var newsContent=$('#news_content').val();
    var request = $.ajax({
        url: "/gradeSplit",
        type: "POST",
        data: { newsContent : newsContent }
    });
    request.done(gradeSplitHandler);
}

//发送ajax请求
function getSegmentResult(){
    var newsContent=$('#news_content').val();
    var request = $.ajax({
        url: "/newsSegment",
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
