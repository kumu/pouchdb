"use strict";

var qunit = module;

qunit('fuzz replication', {

});

asyncTest('a test', function() {

  var OPS = 30;

  var dbs = {
    db1: new PouchDB('db1'),
    db2: new PouchDB('http://127.0.0.1:5984/db2')
  };

  // We maintain the state of currently active documents so we can
  // update and delete them;
  var docs = {
    db1: {},
    db2: {}
  };

  var funs = {
    insertDoc: function(db) {
      dbs[db].post({a: 'doc'}, docInserted.bind(null, db));
    },
    deleteDoc: function(db) {
      if (!hasDocs(db)) { return continueTest(); }
      var doc = docs[db][pickRandomDocId(db)];
      dbs[db].remove(doc, docDeleted.bind(null, db));
    },
    updateDoc: function(db) {
      if (!hasDocs(db)) { return continueTest(); }
      var doc = docs[db][pickRandomDocId(db)];
      doc.random = Math.random();
      dbs[db].put(doc, docUpdated.bind(null, db));
    }
  }

  function hasDocs(db) {
    return !!Object.keys(docs[db]).length;
  }

  function pickRandomDb() {
    return 'db1';
  }

  function pickRandomFun() {
    return Object.keys(funs)[0];
  }

  function pickRandomDocId(db) {
    return Object.keys(docs[db])[1];
  }

  function docInserted(db, err, doc) {
    if (err) { return continueTest(); }
    docs[db][doc.id] = doc;
    continueTest();
  }

  function docDeleted(db, err, doc) {
    if (err) { return continueTest(); }
    delete docs[db][doc.id];
    continueTest();
  }

  function docUpdated(db, err, doc) {
    if (err) { return continueTest(); }
    docs[db][doc.id] = doc;
    continueTest();
  }

  var done = 0;
  function continueTest() {
    if (++done >= OPS) {
      return completeReplication();
    }
    var db = pickRandomDb();
    var fun = pickRandomFun();
    console.log('Running', fun, 'on', db);
    funs[fun](db);
  }

  function completeReplication() {
    console.log('Run completed starting replication');
    PouchDB.replicate(dbs.db1, dbs.db2, {complete: function() {
      console.log('Starting second replication');
      PouchDB.replicate(dbs.db2, dbs.db1, {complete: testDbInfo});
    }});
  }

  function testDbInfo() {
    console.log('replications complete');
    dbs.db1.info(function(err, db1Info) {
      dbs.db2.info(function(err, db2Info) {
        deepEqual(db1Info, db2Info, 'Database information matches');
        testDbAllDocs();
      });
    });
  }

  function testDbAllDocs() {
    dbs.db1.allDocs(function(err, db1AllDocs) {
      dbs.db2.allDocs(function(err, db2AllDocs) {
        deepEqual(db1AllDocs, db2AllDocs, 'Database docs match');
        start();
      });
    });
  }

  continueTest();

});
