var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var router = express.Router();

router.get('/quarters/:id', function(req, res, next) {
    var db = new sqlite3.Database('db/mydb.db');
    var quarters = [];
    var ids = [];
    var lids = [];
    var kinds = [];
    var titles = [];
    var authors = [];
    var memnums = [];
    var disabled = [];

    db.all("SELECT rowid AS id, quarter FROM quarters" , function(err, rows) {
        if (err) {
            console.log('do not load quarters');
            console.log(err);
            db.close();
            res.render('errorInfo', {});
        } else {
            var quarter_id = req.params.id;
            var quarter_name = "";

            rows.forEach(function (row) {
                ids.push(row.id);
                quarters.push(row.quarter)
                if (quarter_id == row.id)
                    quarter_name = row.quarter;
            });

            db.all("SELECT rowid AS id, kind, title, author, members, memnum FROM lectures where quarter_id=" + quarter_id, function(err, rows) {
                db.close();
                if (err) {
                    console.log('do not load lectures');
                    console.log(err);
                    db.close();
                    res.render('errorInfo', {});
                } else {
                    rows.forEach(function (row) {
                        var current = 0;
                        if (row.members.length > 0)
                            current = row.members.split('^').length;
                        lids.push(row.id);
                        kinds.push(row.kind);
                        titles.push(row.title);
                        authors.push(row.author);
                        memnums.push(current+'/'+row.memnum);

                        if (current == row.memnum)
                            disabled.push('disabled');
                        else
                            disabled.push('');
                    });
                    res.render('index', { quarters:quarters, lids:lids, quarter_id:quarter_id, quarter_name:quarter_name, ids:ids, kinds:kinds, titles:titles, authors:authors, memnums:memnums, disabled:disabled});
                }
            });
        }
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = new sqlite3.Database('db/mydb.db');
    var quarters = [];
    var kinds = [];
    var ids = [];
    var lids = [];
    var titles = [];
    var authors = [];
    var memnums = [];
    var disabled = [];

    db.serialize(function() {
        db.run("CREATE TABLE if not exists quarters(quarter TEXT UNIQUE)");
        db.run("CREATE TABLE if not exists lectures(quarter_id INTEGER, title TEXT, author TEXT, condition TEXT, howto TEXT, members TEXT, memnum INTEGER, one TEXT, two TEXT, three TEXT, four TEXT, five TEXT, six TEXT, seven TEXT, eight TEXT, etc TEXT, purpose TEXT, kind TEXT)");
    });

    db.all("SELECT rowid AS id, quarter FROM quarters", function(err, rows) {
        if (err) {
            console.log('do not load quarters at home');
            console.log(err);
            db.close();
            res.render('errorInfo', {});
        }  else {
           var quarter_id = 0;
           var quarter_name = "";

           rows.forEach(function (row) {
               ids.push(row.id);
               quarters.push(row.quarter)
               quarter_id = row.id;
               quarter_name = row.quarter;
           });

           db.all("SELECT rowid AS id, kind, title, author, members, memnum FROM lectures where quarter_id=" + quarter_id, function(err, rows) {
               db.close()
               if (err) {
                   console.log('do not load lectures at home');
                   console.log(err);
                   res.render('errorInfo', {});
               } else {
                   rows.forEach(function (row) {
                       var current = 0;
                       if (row.members.length > 0)
                           current = row.members.split('^').length;
                       lids.push(row.id);
                       titles.push(row.title);
                       authors.push(row.author);
                       memnums.push(current+'/'+row.memnum);
                       kinds.push(row.kind);

                       if (current == row.memnum)
                           disabled.push('disabled');
                       else
                           disabled.push('');
                   });
                   res.render('index', { quarters:quarters, quarter_id:quarter_id, quarter_name:quarter_name, kinds:kinds, lids:lids, ids:ids, titles:titles, authors:authors, memnums:memnums, disabled:disabled});
               }
           });
        }
    });
});

router.post('/applyLecture', function(req, res, next) {
    var lid = req.body.LectureId;
    var qid = req.body.QuarterId;
    var name = req.body.InputName;
    var db = new sqlite3.Database('db/mydb.db');

    db.all("SELECT members FROM lectures where rowid=" + lid, function(err, rows) {
        if (err) {
            console.log('do not read members data from lectures');
            console.log(err);
            db.close();
            res.render('errorInfo', {});
        } else {
            var name_list = rows[0].members;

            if (name_list.length == 0)
                name_list = name;
            else
                name_list = name_list + '^' + name;

            db.run('UPDATE lectures SET members="'+name_list+'" where rowid='+lid);
            db.close();
            console.log ('[apply lecture] qid:'+qid+', lid:'+lid+', name:'+name);
            res.redirect('/quarters/'+qid);
        }
    });
});

router.get('/applyLecture', function(req, res, next) {
    var quarter_id = req.query.qid;
    var lecture_id = req.query.lid;
    res.render('applyLecture', { quarter_id:quarter_id, lecture_id:lecture_id });
});

router.get('/lecture/:id', function(req, res, next) {
    var db = new sqlite3.Database('db/mydb.db');
    var quarters = [];
    var ids = [];
    var lid = req.params.id;

    db.all("SELECT rowid AS id, quarter FROM quarters" , function(err, rows) {
        if (err) {
            console.log('do not read members data from lectures');
            console.log(err);
            db.close();
            res.render('errorInfo', {});
        }
        else {
            rows.forEach(function (row) {
                ids.push(row.id);
                quarters.push(row.quarter)
            });

            db.all("SELECT * FROM lectures where rowid=" + lid, function (err, rows) {
                db.close();
                if (err) {
                    console.log('do not load detailed lecture info');
                    console.log(err);
                    res.render('errorInfo', {});
                } else {
                    var kind = rows[0].kind;
                    var title = rows[0].title;
                    var author = rows[0].author;
                    var condition = rows[0].condition;
                    var howto = rows[0].howto;
                    var one = rows[0].one;
                    var two = rows[0].two;
                    var three = rows[0].three;
                    var four = rows[0].four;
                    var five = rows[0].five;
                    var six = rows[0].six;
                    var seven = rows[0].seven;
                    var eight = rows[0].eight;
                    var etc = rows[0].etc;
                    var purpose = rows[0].purpose;

                    var memnum = '';
                    var members = rows[0].members.split('^');

                    if (rows[0].members.length > 0)
                        memnum = members.length + '/'+rows[0].memnum;
                    else
                        memnum = '0/' + rows[0].memnum;

                    res.render('lecture', { quarters: quarters, ids: ids, lid: lid, kind:kind, title: title, author: author, condition: condition, howto: howto, members: members, memnum: memnum,
                        one: one, two: two, three: three, four: four, five: five, six: six, seven: seven, eight: eight, purpose: purpose, etc: etc
                    });
                }
            });
        }
    });
});

router.get('/createQuarter', function(req, res, next) {
    res.render('createQuarter', {});
});

router.get('/deleteLecture/:id', function(req, res, next) {
    var lid = req.params.id;
    var db = new sqlite3.Database('db/mydb.db');
    db.run("DELETE from lectures where rowid="+lid);
    db.close();
    // [TODO] 강좌 삭제 하고 난 뒤에는 해당 quarter로 이동해야 한다.
    console.log('[delete lecture] lid:'+lid);
    res.redirect('/');
});

router.get('/warningDeleteQuarter/:id', function(req, res, next) {
    var id = req.params.id;
    var db = new sqlite3.Database('db/mydb.db');
    db.all("SELECT quarter FROM quarters where rowid=" + id, function(err, rows) {
        db.close();
        var quarter_name = '';
        if (err) {
            console.log('do not load warning page to delete quarter');
            console.log(err);
            res.render('errorInfo', {});
        } else {
            quarter_name = rows[0].quarter;
            res.render('deleteQuarter', { qid:id, quarter_name:quarter_name });
        }
    });
});

router.get('/warningDeleteLecture/:id', function(req, res, next) {
    var id = req.params.id;
    var db = new sqlite3.Database('db/mydb.db');
    db.all("SELECT title FROM lectures where rowid=" + id, function(err, rows) {
        db.close();
        var title = '';
        if (err) {
            console.log('do not load warning page to delete lecture');
            console.log(err);
            res.render('errorInfo', {});
        } else {
            title = rows[0].title;
            res.render('deleteLecture', { lid:id, title:title});
        }
    });
});

router.get('/warningDeleteUser', function(req, res, next) {
    var name = req.query.name;
    var id = req.query.id;
    res.render('deleteUser', { lid:id, name:name});
});

router.get('/deleteUser', function(req, res, next) {
    var name = req.query.name;
    var id = req.query.id;

    var db = new sqlite3.Database('db/mydb.db');

    db.all("SELECT members FROM lectures where rowid=" + id, function(err, rows) {
        if (err) {
            console.log('do not execute to delete user');
            console.log(err);
            db.colse();
            res.render('errorInfo', {});
        } else {
            var name_list = rows[0].members.split('^');
            var update_name_list = [];
            for (i=0; i<name_list.length; i++) {
                if (name_list[i] != name)
                    update_name_list.push(name_list[i]);
            }
            db.run('UPDATE lectures SET members="' + update_name_list.join('^') + '" where rowid='+id);
            db.close();
            console.log('[delete user] lid:'+id+', name:'+name);
            res.redirect('/lecture/'+id);
        }
    });
});

router.get('/deleteQuarter/:id', function(req, res, next) {
    var id = req.params.id;
    var db = new sqlite3.Database('db/mydb.db');
    db.run("DELETE from quarters where rowid="+id);
    db.run("DELETE from lectures where quarter_id="+id);
    db.close();
    console.log('[delete quarter] qid:'+id);
    res.redirect('/');
});

router.post('/modifyQuarter', function(req, res, next) {
    var id = req.body.QuarterId;
    var quarter = req.body.QuarterName;
    var db = new sqlite3.Database('db/mydb.db');
    db.run('UPDATE quarters SET quarter = "'+quarter+'" where rowid='+id);
    db.close();
    console.log('[modify quarter] qid:'+id);
    res.redirect('/quarters/'+id);
});

router.get('/modifyQuarter/:id', function(req, res, next) {
    var quarter_id = req.params.id;
    var quarter_name = "";
    var db = new sqlite3.Database('db/mydb.db');
    db.all("SELECT quarter FROM quarters where rowid=" + quarter_id, function(err, rows) {
        db.close();
        if (err) {
            console.log('do not load to modifyQuarter');
            console.log(err);
            res.render('errorInfo', {});
        } else {
            quarter_name = rows[0].quarter;
            res.render('modifyQuarter', {quarter_id:quarter_id, quarter_name:quarter_name});
        }
    });
});

router.get('/createLecture/:id', function(req, res, next) {
    var quarter_id = req.params.id;
    res.render('createLecture', { quarter_id:quarter_id });
});

router.post('/modifyLecture', function(req, res, next) {
    var body = req.body;
    var lid = body.LectureId;
    var kind = body.Kind;
    var title = body.Title.replace(/'/g, '"');
    var author = body.Author.replace(/'/g, '"');
    var condition = body.Condition.replace(/'/g, '"');
    var howto = body.Howto.replace(/'/g, '"');
    var memnum = body.Memnum;
    var one = body.One.replace(/'/g, '"');
    var two = body.Two.replace(/'/g, '"');
    var three = body.Three.replace(/'/g, '"');
    var four = body.Four.replace(/'/g, '"');
    var five = body.Five.replace(/'/g, '"');
    var six = body.Six.replace(/'/g, '"');
    var seven = body.Seven.replace(/'/g, '"');
    var eight = body.Eight.replace(/'/g, '"');
    var etc = body.Etc.replace(/'/g, '"');
    var purpose = body.Purpose.replace(/'/g, '"');

    console.log(purpose)

    var db = new sqlite3.Database('db/mydb.db');

    var sql_stmt = "UPDATE lectures SET title='" + title + "', author='" + author + "', kind='" + kind + "', condition='" + condition + "', howto='" + howto + "', memnum=" + memnum +
        ", one='" + one + "', two='" + two + "', three='" + three + "', four='" + four + "', five='" + five + "', six='" + six + "', seven='" + seven +
        "', eight='" + eight + "', etc='" + etc + "', purpose='" + purpose + "' where rowid=" + lid;
    //console.log(sql_stmt)
    db.run(sql_stmt);
    db.close();
    console.log('[modify lecture] lid:'+lid);
    res.redirect('/lecture/'+lid);
});

router.get('/modifyLecture/:id', function(req, res, next) {
    var lid = req.params.id;
    var db = new sqlite3.Database('db/mydb.db');

    db.all("SELECT * FROM lectures where rowid=" + lid, function(err, rows) {
        db.close();
        if (err) {
            console.log('do not load to modifyLecture');
            console.log(err);
            res.redirect('/');
        }
        else {
            var kind = rows[0].kind;
            var title = rows[0].title;
            var author = rows[0].author;
            var condition = rows[0].condition;
            var howto = rows[0].howto;
            var memnum = rows[0].memnum;
            var one = rows[0].one;
            var two = rows[0].two;
            var three = rows[0].three;
            var four = rows[0].four;
            var five = rows[0].five;
            var six = rows[0].six;
            var seven = rows[0].seven;
            var eight = rows[0].eight;
            var etc = rows[0].etc;
            var purpose = rows[0].purpose;

            var kind_selected1 = 'selected';
            var kind_selected2 = 'selected';

            if (kind == '기획필수') {
                console.log(kind);
                kind_selected2 = '';
            }

            res.render('modifyLecture', {lid:lid, title:title, author:author, condition:condition, howto:howto, memnum:memnum, one:one, two:two, three:three, four:four, five:five, six:six, seven:seven, eight:eight, etc:etc, purpose:purpose, kind_selected1:kind_selected1, kind_selected2:kind_selected2});
        }
    });
});

router.post('/createLecture', function(req, res, next) {
    var body = req.body;
    var quarter_id = body.QuarterId;
    var kind = body.Kind;
    var title = body.Title.replace(/'/g, '"');
    var author = body.Author.replace(/'/g, '"');
    var condition = body.Condition.replace(/'/g, '"');
    var howto = body.Howto.replace(/'/g, '"');
    var memnum = body.Memnum;
    var one = body.One.replace(/'/g, '"');
    var two = body.Two.replace(/'/g, '"');
    var three = body.Three.replace(/'/g, '"');
    var four = body.Four.replace(/'/g, '"');
    var five = body.Five.replace(/'/g, '"');
    var six = body.Six.replace(/'/g, '"');
    var seven = body.Seven.replace(/'/g, '"');
    var eight = body.Eight.replace(/'/g, '"');
    var etc = body.Etc.replace(/'/g, '"');
    var purpose = body.Purpose.replace(/'/g, '"');

    var db = new sqlite3.Database('db/mydb.db');
    var sql_stmt =  quarter_id + ", '" + kind + "', '"+ title + "', '" + author + "', '" + condition +
        "', '" + howto + "', '', " + memnum + ", '" + one +  "', '" + two +  "', '" + three +
        "', '" + four + "', '" + five + "', '" + six +  "', '" + seven + "', '" + eight + "', '" + etc + "', '" + purpose + "'";
    db.run("INSERT into lectures(quarter_id, kind, title, author, condition, howto, members, memnum, one, two, three, four, five, six, seven, eight, etc, purpose) VALUES ("+ sql_stmt+ ")", function (err){
        //console.log(sql_stmt);
        if (err) {
            console.log('do not create lectrue')
            console.log(err)
        }
        db.close()
        console.log('[create lecture] title:'+title);
        res.redirect('/');
    });
});
router.post('/createQuarter', function(req, res, next) {
    var body = req.body;
    var q_name = body.QuarterName;

    if (q_name.length > 0) {
        var db = new sqlite3.Database('db/mydb.db');
        db.run("INSERT into quarters(quarter) VALUES (\""+ q_name + "\")", function (err){
            db.close()
            if (err) {
                console.log('do not create quarter')
                console.log(err)
            }
        });
    }
    console.log('[create lecture] name:'+q_name);
    res.redirect('/');
});

router.get('/init', function(req, res, next) {
    var db = new sqlite3.Database('db/mydb.db');

    db.serialize(function() {
        db.run("CREATE TABLE if not exists quarters(quarter TEXT UNIQUE)");
        db.run("CREATE TABLE if not exists lectures(quarter_id INTEGER, title TEXT, author TEXT, condition TEXT, howto TEXT, members TEXT, memnum INTEGER, one TEXT, two TEXT, three TEXT, four TEXT, five TEXT, six TEXT, seven TEXT, eight TEXT, etc TEXT, purpose TEXT, kind TEXT)");
    });

    db.close();
    res.redirect('/');
});

module.exports = router;
