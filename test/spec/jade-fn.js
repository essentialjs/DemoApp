var expect = require('chai').expect,
    path = require('path'),
    jade = require('jade'),
    cheerio = require('cheerio'),
    _ = require('lodash');

var FNs = {
            "describeEnum": function(name) {
                var values = [];
                switch(name) {
                    case 'NUMS':
                        values = ['1','2','3','4','5'];
                        break;
                }
                return {
                    name: name,
                    values: values
                };
            },

            "list1": function(a,b) {
                var r = [];
                for(var i=0,arg; arg = arguments[i]; ++i) r.push("_"+arg+"_");
                return r
            }
        };


describe('Rich Jade Template',function() {

    it('should iterate function result', function() {
        var fn = jade.compileFile('test/rich.jade', {
            filename: 'jade-name'
        });
        var html = fn(FNs);

        var $ = cheerio.load(html);
        expect($('#NUMS').html()).to.equal('<h6>Values:</h6><ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li></ul>')
    });
});

