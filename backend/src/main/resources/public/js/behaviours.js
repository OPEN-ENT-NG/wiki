/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(1);
	console.log('wiki behaviours loaded');
	var defaultPagination = 10;
	var isWikiApplication = function () {
	    return (window.location.pathname === '/wiki');
	};
	var displayAction = function (scope, actionName) {
	    if (scope.display) {
	        scope.display.action = actionName;
	    }
	    else {
	        scope.display = { action: actionName };
	    }
	    scope.$apply();
	};
	// 1) Model - it is declared in behaviours.js, so that it can be shared by wiki application and wiki sniplet
	var wikiNamespace = {
	    Version: function () {
	    },
	    Page: function () {
	        var page = this;
	        this.collection(entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Version, {
	            sync: function (callback) {
	                entcore_1.http().get('/wiki/' + page.wiki_id + '/page/' + page._id+'/revisions' ).done(function (data) {
	                    this.load(data);
	                    if (typeof callback === 'function') {
	                        callback();
	                    }
	                }.bind(this));
	            }
	        });
	    },
	    Wiki: function () {
	        var wiki = this;
	        this.collection(entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Page, {
	            sync: function (callback) {
	                entcore_1.http().get('/wiki/' + wiki._id + '/pages').done(function (returnedWiki) {
	                    returnedWiki.pages = entcore_1._.map(returnedWiki.pages, function (page) {
	                        page.wiki_id = wiki._id;
	                        return page;
	                    });
	                    this.load(returnedWiki.pages);
	                    if (typeof callback === 'function') {
	                        callback();
	                    }
	                }.bind(this));
	            }
	        });
	    }
	};
	// Functions shared by wiki sniplet and wiki application
	wikiNamespace.formatDate = function (dateObject) {
	    return entcore_1.moment(dateObject.$date).calendar();
	};
	wikiNamespace.getDateAndTime = function (dateObject) {
	    return entcore_1.moment(dateObject.$date).format('LLLL');
	};
	wikiNamespace.getRelativeTimeFromDate = function (dateObject) {
	    return entcore_1.moment(dateObject.$date).fromNow();
	};
	wikiNamespace.titleIsEmpty = function (title) {
	    return (!title || title.trim().length === 0);
	};
	wikiNamespace.pageTitleExists = function (pTitle, pWiki, pPageId) {
	    if (!pPageId) {
	        // when creating a page
	        return entcore_1._.find(pWiki.pages.all, function (page) {
	            return page.title.trim() === pTitle.trim();
	        });
	    }
	    else {
	        // when updating a page
	        return entcore_1._.find(pWiki.pages.all, function (page) {
	            return page.title.trim() === pTitle.trim() &&
	                page._id !== pPageId;
	        });
	    }
	};
	wikiNamespace.updateSearchBar = function (scope) {
	    if (isWikiApplication()) {
	        scope.wiki.listAllPages(function (pagesArray) {
	            if (scope.searchbar) {
	                scope.searchbar.allpageslist = pagesArray;
	            }
	            else {
	                scope.searchbar = { allpageslist: pagesArray };
	            }
	        });
	    }
	    else {
	        // Sniplet case : only display pages of current wiki in searchbar
	        var pages = entcore_1._.chain(scope.wiki.pages.all).map(function (page) {
	            return {
	                title: page.title,
	                _id: page._id,
	                wiki_id: scope.wiki._id,
	                toString: function () {
	                    return this.title;
	                }
	            };
	        }).sort().value();
	        if (scope.searchbar) {
	            scope.searchbar.allpageslist = pages;
	        }
	        else {
	            scope.searchbar = { allpageslist: pages };
	        }
	    }
	};
	wikiNamespace.showCommentForm = function (wiki) {
	    wiki.page.newComment = "";
	    wiki.page.showCommentForm = true;
	};
	wikiNamespace.hideCommentForm = function (wiki) {
	    wiki.page.showCommentForm = false;
	};
	wikiNamespace.switchCommentsDisplay = function (wiki) {
	    if (!wiki.page.showComments) {
	        wikiNamespace.showCommentForm(wiki);
	        wiki.page.showComments = true;
	    }
	    else {
	        wikiNamespace.hideCommentForm(wiki);
	        wiki.page.showComments = false;
	    }
	};
	wikiNamespace.commentPage = function (wiki, scope, onFinish) {
	    wiki.page.comment(wiki.page.newComment, function () {
	        wiki.getPage(wiki.page._id, function (result) {
	            wiki.page.showComments = true;
	            scope.showCommentForm();
	            scope.$apply();
	            entcore_1.notify.info('wiki.your.comment.has.been.saved');
	            onFinish && onFinish();
	        }, function () {
	            scope.notFound = true;
	        });
	    });
	};
	wikiNamespace.removeComment = function (wiki, commentId, commentIndex, scope) {
	    wiki.page.deleteComment(commentId, commentIndex, function () {
	        scope.$apply();
	    });
	};
	wikiNamespace.canCreatePage = function (wiki) {
	    return wiki.myRights.createPage !== undefined;
	};
	wikiNamespace.duplicatePage = function (scope, currentWiki) {
	    if (wikiNamespace.titleIsEmpty(scope.wikiDuplicate.page.title)) {
	        entcore_1.notify.error('wiki.form.title.is.empty');
	        return;
	    }
	    var targetWiki, callback;
	    if (scope.wikiDuplicate.targetWikiId === currentWiki._id) {
	        // When target wiki is current wiki
	        targetWiki = currentWiki;
	        if (wikiNamespace.pageTitleExists(scope.wikiDuplicate.page.title, targetWiki)) {
	            entcore_1.notify.error('wiki.page.form.titlealreadyexist.error');
	            return;
	        }
	        callback = function (createdPage) {
	            currentWiki.pages.sync(function () {
	                wikiNamespace.updateSearchBar(scope);
	                currentWiki.setLastPages();
	                currentWiki.getPage(createdPage._id, function (returnedWiki) {
	                    if (isWikiApplication()) {
	                        window.location.hash = '/view/' + currentWiki._id + '/' + createdPage._id;
	                    }
	                    else {
	                        openPage(createdPage._id, scope);
	                    }
	                });
	            });
	        };
	        targetWiki.createPage(scope.wikiDuplicate.page, callback);
	    }
	    else {
	        if (isWikiApplication()) {
	            targetWiki = scope.getWikiById(scope.wikiDuplicate.targetWikiId);
	        }
	        else {
	            targetWiki = entcore_1._.find(scope.wikis, function (pWiki) {
	                return pWiki._id === scope.wikiDuplicate.targetWikiId;
	            });
	        }
	        targetWiki.pages.sync(function () {
	            if (wikiNamespace.pageTitleExists(scope.wikiDuplicate.page.title, targetWiki)) {
	                entcore_1.notify.error('wiki.page.form.titlealreadyexist.error');
	                return;
	            }
	            callback = function (createdPage) {
	                wikiNamespace.updateSearchBar(scope);
	                if (isWikiApplication()) {
	                    scope.openSelectedPage(targetWiki._id, createdPage._id);
	                }
	                else {
	                    window.location.href = '/wiki#/view/' + targetWiki._id + '/' + createdPage._id;
	                }
	            };
	            targetWiki.createPage(scope.wikiDuplicate.page, callback);
	        });
	    }
	};
	wikiNamespace.listVersions = function (wiki, scope) {
	    // WB2-1601: add event
	    entcore_1.http().postJson('/infra/event/web/store', {
	        "event-type": "ACCESS_WIKI_PAGE_VERSIONS",
	        "module": "wiki",
	        "userId": entcore_1.model.me.userId
	    });
	    wiki.page.versions.sync();
	    if (isWikiApplication()) {
	        entcore_1.template.open('main', 'versions');
	    }
	    else {
	        displayAction(scope, 'versions');
	    }
	};
	wikiNamespace.showVersion = function (version, scope) {
	    if (isWikiApplication()) {
	        scope.version = version;
	        entcore_1.template.open('main', 'view-version');
	    }
	    else {
	        scope.display.version = version;
	        displayAction(scope, 'viewVersion');
	    }
	};
	wikiNamespace.restoreVersion = function (version, wiki, scope) {
	    if (!version) {
	        version = wiki.page.versions.selection()[0];
	    }
	    wiki.page.restoreVersion(version);
	    if (isWikiApplication()) {
	        entcore_1.template.open('main', 'view-page');
	    }
	    else {
	        displayAction(scope, 'viewPage');
	    }
	};
	wikiNamespace.compareVersions = function (wiki, scope) {
	    var a = wiki.page.versions.selection()[0];
	    var b = wiki.page.versions.selection()[1];
	    if (entcore_1.moment(a.date.$date).unix() > entcore_1.moment(b.date.$date).unix()) {
	        scope.display.leftCompare = b;
	        scope.display.rightCompare = a;
	    }
	    else {
	        scope.display.leftCompare = a;
	        scope.display.rightCompare = b;
	    }
	    scope.display.comparison = wikiNamespace.Version.prototype.comparison(scope.display.leftCompare, scope.display.rightCompare);
	    if (isWikiApplication()) {
	        entcore_1.template.open('main', 'compare');
	    }
	    else {
	        displayAction(scope, 'compareVersions');
	    }
	};
	// Versions (i.e. revisions of a wiki page)
	wikiNamespace.Version.prototype.toJSON = function () {
	    return {
	        content: this.content,
	        title: this.title
	    };
	};
	function findSequence(x, y) {
	    var s, i, j, lcs = [], row = [], c = [], left, diag, latch;
	    if (x.length < y.length) {
	        s = x;
	        x = y;
	        y = s;
	    }
	    for (j = 0; j < y.length; row[j++] = 0)
	        ;
	    for (i = 0; i < x.length; i++) {
	        c[i] = row = row.slice();
	        for (diag = 0, j = 0; j < y.length; j++, diag = latch) {
	            latch = row[j];
	            if ((x[i].innerText || x[i].textContent) === (y[j].innerText || y[j].textContent)) {
	                row[j] = diag + 1;
	            }
	            else {
	                left = row[j - 1] || 0;
	                if (left > row[j]) {
	                    row[j] = left;
	                }
	            }
	        }
	    }
	    i--;
	    j--;
	    while (i > -1 && j > -1) {
	        switch (c[i][j]) {
	            default:
	                j--;
	                lcs.unshift(x[i]);
	            case (i && c[i - 1][j]):
	                i--;
	                continue;
	            case (j && c[i][j - 1]): j--;
	        }
	    }
	    return lcs;
	}
	function findTextSequence(x, y) {
	    var s, i, j, lcs = [], row = [], c = [], left, diag, latch;
	    if (x.length < y.length) {
	        s = x;
	        x = y;
	        y = s;
	    }
	    for (j = 0; j < y.length; row[j++] = 0)
	        ;
	    for (i = 0; i < x.length; i++) {
	        c[i] = row = row.slice();
	        for (diag = 0, j = 0; j < y.length; j++, diag = latch) {
	            latch = row[j];
	            if (x[i] === y[j]) {
	                row[j] = diag + 1;
	            }
	            else {
	                left = row[j - 1] || 0;
	                if (left > row[j]) {
	                    row[j] = left;
	                }
	            }
	        }
	    }
	    i--;
	    j--;
	    while (i > -1 && j > -1) {
	        switch (c[i][j]) {
	            default:
	                j--;
	                lcs.unshift(x[i]);
	            case (i && c[i - 1][j]):
	                i--;
	                continue;
	            case (j && c[i][j - 1]): j--;
	        }
	    }
	    return lcs;
	}
	function similar(a, b) {
	    var aText = a.innerText || a.textContent;
	    var bText = b.innerText || b.textContent;
	    var textSequence = findTextSequence(aText.split(' '), bText.split(' '));
	    return textSequence.length > aText.split(' ').length / 4 || textSequence.length > bText.split(' ').length / 4;
	}
	function compare(a, b) {
	    var aIndex = 0;
	    var bIndex = 0;
	    var bVariations = {};
	    var sequence = findSequence(a, b);
	    sequence.forEach(function (child, index) {
	        bVariations[index] = [];
	        while (bIndex < b.length && (child.innerText || child.textContent) !== (b[bIndex].innerText || b[bIndex].textContent)) {
	            bVariations[index].push(b[bIndex]);
	            bIndex++;
	        }
	        bIndex++;
	    });
	    bVariations[sequence.length - 1] = [];
	    for (var i = bIndex; i < b.length; i++) {
	        bVariations[sequence.length - 1].push(b[i]);
	    }
	    sequence.forEach(function (child, index) {
	        var aVariations = 0;
	        while (aIndex < a.length && (child.innerText || child.textContent) !== (a[aIndex].innerText || a[aIndex].textContent)) {
	            var noEquivalent = true;
	            for (var n = 0; n < bVariations[index].length; n++) {
	                if (similar(a[aIndex], bVariations[index][n])) {
	                    if ($(a[aIndex]).children().length) {
	                        compare($(bVariations[index][n]).children(), $(a[aIndex]).children());
	                        compare($(a[aIndex]).children(), $(bVariations[index][n]).children());
	                    }
	                    else {
	                        $(a[aIndex]).addClass('diff');
	                    }
	                    noEquivalent = false;
	                }
	            }
	            if (noEquivalent) {
	                $(a[aIndex]).addClass('added');
	            }
	            aIndex++;
	            aVariations++;
	        }
	        if (aVariations === 1 && bVariations[index].length === 1) {
	            if ($(a[aIndex]).children().length) {
	                compare($(bVariations[index][bVariations[index].length - 1]).children(), $(a[aIndex]).children());
	                compare($(a[aIndex]).children(), $(bVariations[index][bVariations[index].length - 1]).children());
	            }
	            else {
	                $(a[aIndex]).removeClass('added').addClass('diff');
	            }
	        }
	        aIndex++;
	    });
	    for (var j = aIndex; j < a.length; j++) {
	        var noEquivalent = true;
	        for (var n = 0; n < bVariations[sequence.length - 1].length; n++) {
	            if (similar(a[j], bVariations[sequence.length - 1][n])) {
	                if ($(a[j]).children().length) {
	                    compare($(bVariations[sequence.length - 1][bVariations[sequence.length - 1].length - 1]).children(), $(a[j]).children());
	                    compare($(a[j]).children(), $(bVariations[sequence.length - 1][bVariations[sequence.length - 1].length - 1]).children());
	                }
	                else {
	                    $(a[j]).addClass('diff');
	                }
	                noEquivalent = false;
	            }
	        }
	        if (noEquivalent) {
	            $(a[j]).addClass('added');
	        }
	    }
	    if (j === aIndex + 1 && bVariations[sequence.length - 1].length === 1) {
	        if (!a[j]) {
	            return;
	        }
	        if ($(a[j]).children().length) {
	            compare($(bVariations[sequence.length - 1][bVariations[sequence.length - 1].length - 1]).children(), $(a[j]).children());
	            compare($(a[j]).children(), $(bVariations[sequence.length - 1][bVariations[sequence.length - 1].length - 1]).children());
	        }
	        else {
	            $(a[j]).removeClass('added').addClass('diff');
	        }
	    }
	}
	wikiNamespace.Version.prototype.comparison = function (left, right) {
	    var leftRoot = $(left.content);
	    var rightRoot = $(right.content);
	    //fix for empty div content
	    while (leftRoot.length === 1 && leftRoot.children().length > 0 && leftRoot[0].nodeName === 'DIV') {
	        leftRoot = leftRoot.children();
	    }
	    while (rightRoot.length === 1 && rightRoot.children().length > 0 && rightRoot[0].nodeName === 'DIV') {
	        rightRoot = rightRoot.children();
	    }
	    compare(leftRoot, rightRoot);
	    compare(rightRoot, leftRoot);
	    var added = 0;
	    leftRoot.each(function (index, item) {
	        if ($(item).hasClass('added')) {
	            rightRoot.splice(index + added, 0, $(item.outerHTML).removeClass('added').addClass('removed')[0]);
	        }
	        if ($(rightRoot[index]).hasClass('added')) {
	            added++;
	        }
	    });
	    rightRoot.each(function (index, item) {
	        if ($(item).hasClass('added')) {
	            leftRoot.splice(index, 0, $(item.outerHTML).removeClass('added').addClass('removed')[0]);
	        }
	    });
	    return {
	        left: entcore_1._.map(leftRoot, function (el) { return el.outerHTML; }).join(''),
	        right: entcore_1._.map(rightRoot, function (el) { return el.outerHTML; }).join('')
	    };
	};
	wikiNamespace.Version.prototype.rightComparison = function (left) {
	    return this.content;
	};
	// Wiki pages
	wikiNamespace.Page.prototype.restoreVersion = function (version) {
	    this.content = version.content;
	    this.title = version.title;
	    this.save();
	};
	wikiNamespace.Page.prototype.comment = function (commentText, callback) {
	    entcore_1.http().postJson('/wiki/' + this.wiki_id + '/page/' + this._id+'/comment', { comment: commentText })
	        .done(function (response) {
	        if (typeof callback === 'function') {
	            callback();
	        }
	    }.bind(this));
	};
	wikiNamespace.Page.prototype.deleteComment = function (commentId, commentIndex, callback) {
	    entcore_1.http().delete('/wiki/' + this.wiki_id + '/page/' + this._id + '/comment/' + commentId)
	        .done(function () {
	        this.comments.splice(commentIndex, 1);
	        if (typeof callback === 'function') {
	            callback();
	        }
	    }.bind(this));
	};
	wikiNamespace.Page.prototype.save = function (callback, callback2) {
	    entcore_1.http().putJson('/wiki/' + this.wiki_id + '/page/' + this._id, this)
	        .done(function (result) {
	        if (this.isIndex === true) {
	            this.index = this._id;
	        }
	        else if (this.wasIndex === true) {
	            delete this.index;
	        }
	        if (typeof callback === 'function') {
	            callback(result);
	        }
	    }.bind(this)).error(callback2);
	};
	wikiNamespace.Page.prototype.toJSON = function () {
	    return {
	        title: this.title,
	        content: this.content,
	        isIndex: this.isIndex,
			isVisible: this.isVisible || true,
	        wasIndex: this.wasIndex
	    };
	};
	// Wikis
	wikiNamespace.Wiki.prototype.getWholeWiki = function (callback) {
	    entcore_1.http().get('/wiki/' + this._id + '/whole')
	        .done(function (wiki) {
	        this.updateData(wiki);
	        if (typeof callback === 'function') {
	            callback();
	        }
	    }.bind(this));
	};
	wikiNamespace.Wiki.prototype.getPage = function (pageId, callback, errorCallback) {
	    var that = this;
		var wiki = this;
	    entcore_1.http().get('/wiki/' + this._id + '/page/' + pageId)
	        .done(function (page) {
	        this.page = new entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Page(page);
			this.page.wiki_id = wiki._id;
	        var content = $(this.page.content);
	        if (this.context === 'sniplet') {
	            content.find('a[href^="/wiki#/view/' + this._id + '"]').each(function (index, item) {
	                var pageIdSplit = $(item).attr('href').split('/');
	                var pageId = pageIdSplit[pageIdSplit.length - 1];
	                $(item).removeAttr('href');
	                $(item).removeAttr('data-reload');
	                $(item).attr('ng-click', 'openPage(\'' + pageId + '\')');
	            });
	        }
	        else {
	            var wikiId = this._id;
	            content.find('a[ng-click^="openPage("]').each(function (index, item) {
	                var pageIdSplit = $(item).attr('ng-click').split("'");
	                var pageId = pageIdSplit[1];
	                $(item).removeAttr('ng-click');
	                $(item).attr('href', '/wiki#/view/' + wikiId + '/' + pageId);
	            });
	        }
	        this.page.content = entcore_1._.map(content, function (el) { return el.outerHTML; }).join('');
	        this.title = wiki.title;
	        this.owner = wiki.owner;
	        callback(wiki);
	    }.bind(this))
	        .e404(function () {
	        errorCallback();
	    });
	};
	wikiNamespace.Wiki.prototype.createPage = function (data, callback) {
	    entcore_1.http().postJson('/wiki/' + this._id + '/page', data)
	        .done(function (result) {
	        if (data.isIndex === true) {
	            this.index = result._id;
	        }
	        callback(result);
	    }.bind(this));
	};
	wikiNamespace.Wiki.prototype.deletePage = function (pageId, callback) {
	    entcore_1.http().delete('/wiki/' + this._id + '/page/' + pageId).done(function (result) {
	        callback(result);
	    });
	};
	wikiNamespace.Wiki.prototype.createWiki = function (data, callback) {
	    entcore_1.http().postJson('/wiki', data).done(function (result) {
	        this._id = result._id;
	        callback(result);
	    }.bind(this));
	};
	wikiNamespace.Wiki.prototype.updateWiki = function (data, callback) {
	    entcore_1.http().putJson('/wiki/' + this._id, data).done(function () {
	        callback();
	    });
	};
	wikiNamespace.Wiki.prototype.duplicateWiki = function (callback) {
	    entcore_1.http().postJson("/archive/duplicate", { application: "wiki", resourceId: this._id }).done(function () {
	        entcore_1.notify.info("duplicate.done");
	        if (callback)
	            callback();
	    })
	        .error(function () {
	        entcore_1.notify.error("duplicate.error");
	    });
	};
	wikiNamespace.Wiki.prototype.deleteWiki = function (callback) {
	    entcore_1.http().delete('/wiki/' + this._id).done(function () {
	        entcore_1.model.wikis.remove(this);
	        callback();
	    }.bind(this));
	};
	wikiNamespace.Wiki.prototype.listAllPages = function (callback) {
	    entcore_1.http().get('/wiki/listallpages?visible=true').done(function (wikis) {
	        var pagesArray = entcore_1._.map(wikis, function (wiki) {
	            var pages = entcore_1._.map(wiki.pages, function (page) {
	                return {
	                    title: page.title + ' [' + wiki.title + ']',
	                    _id: page._id,
	                    wiki_id: wiki._id,
	                    toString: function () {
	                        return this.title;
	                    }
	                };
	            });
	            return pages;
	        });
	        pagesArray = entcore_1._.flatten(pagesArray);
	        callback(pagesArray);
	    });
	};
	wikiNamespace.Wiki.prototype.setLastPages = function () {
	    var pagination = window.pagination ? window.pagination : defaultPagination;
	    var dateArray = entcore_1._.chain(this.pages.all).pluck("modified").compact().value();
	    if (dateArray && dateArray.length > 0) {
	        // get the last modified pages using pagination config or defaultpagination when sniplet.
	        this.lastPages = entcore_1._.chain(this.pages.all)
	            .filter(function (page) { return page.modified && page.modified.$date; })
	            .sortBy(function (page) { return page.modified.$date; })
	            .last(pagination)
	            .reverse()
	            .value();
	    }
	};
	entcore_1.model.makeModels(wikiNamespace);
	// 2) Behaviours
	var wikiRights = {
	    resources: {
	        edit: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|updateWiki'
	        },
	        deleteWiki: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|deleteWiki'
	        },
	        share: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|shareWiki'
	        },
	        listPages: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|listPages'
	        },
	        getPage: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|getPage'
	        },
	        createPage: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|createPage'
	        },
	        editPage: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|updatePage'
	        },
	        deletePage: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|deletePage'
	        },
	        comment: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|comment'
	        },
	        manager: {
	            right: 'net-atos-entng-wiki-controllers-WikiController|publishToLibrary'
	        }
	    },
	    workflow: {
	        create: 'net.atos.entng.wiki.controllers.WikiController|createWiki',
	        list: 'net.atos.entng.wiki.controllers.WikiController|listWikis',
	        view: 'net.atos.entng.wiki.controllers.WikiController|view',
	        listAllPages: 'net.atos.entng.wiki.controllers.WikiController|listAllPages',
	        print: 'net.atos.entng.wiki.controllers.WikiController|print',
	        publish: 'net.atos.entng.wiki.controllers.WikiController|publish'
	    }
	};
	entcore_1.Behaviours.register('wiki', {
	    namespace: wikiNamespace,
	    rights: wikiRights,
	    resourceRights: function (resource) {
	        var rightsContainer = resource;
	        if (!resource.myRights) {
	            resource.myRights = {};
	        }
	        for (var right in wikiRights.resources) {
	            if (entcore_1.model.me.hasRight(rightsContainer, wikiRights.resources[right]) || entcore_1.model.me.userId === resource.owner.userId) {
	                if (resource.myRights[right] !== undefined) {
	                    resource.myRights[right] = resource.myRights[right] && wikiRights.resources[right];
	                }
	                else {
	                    resource.myRights[right] = wikiRights.resources[right];
	                }
	            }
	        }
	        return resource;
	    },
	    workflow: function () {
	        var workflow = {};
	        var wikiWorkflow = wikiRights.workflow;
	        for (var prop in wikiWorkflow) {
	            if (entcore_1.model.me.hasWorkflow(wikiWorkflow[prop])) {
	                workflow[prop] = true;
	            }
	        }
	        return workflow;
	    },
	    // Used by component "linker" to load wiki pages
	    loadResources: function (callback) {
	        entcore_1.http().get('/wiki/listallpages?visible=true').done(function (wikis) {
	            var pagesArray = entcore_1._.map(wikis, function (wiki) {
	                var pages = entcore_1._.map(wiki.pages, function (page) {
	                    var wikiIcon;
	                    if (typeof (wiki.thumbnail) === 'undefined' || wiki.thumbnail === '') {
	                        wikiIcon = '/img/icons/glyphicons_036_file.png';
	                    }
	                    else {
	                        wikiIcon = wiki.thumbnail + '?thumbnail=48x48';
	                    }
	                    return {
	                        title: page.title + ' [' + wiki.title + ']',
	                        ownerName: wiki.owner.displayName,
	                        owner: wiki.owner.userId,
	                        icon: wikiIcon,
	                        path: '/wiki#/view/' + wiki._id + '/' + page._id,
	                        wiki_id: wiki._id,
	                        id: page._id
	                    };
	                });
	                return pages;
	            });
	            this.resources = entcore_1._.flatten(pagesArray);
	            if (typeof callback === 'function') {
	                callback(this.resources);
	            }
	        }.bind(this));
	    },
	    // Used by component "linker" to create a new page
	    create: function (page, callback) {
	        page.loading = true;
	        var data = {
	            title: page.title,
	            content: ''
	        };
	        entcore_1.http().postJson('/wiki/' + page.wiki_id + '/page', data).done(function () {
	            this.loadResources(callback);
	            page.loading = false;
	        }.bind(this));
	    },
	    sniplets: {
	        wiki: {
	            title: 'wiki.sniplet.title',
	            description: 'wiki.sniplet.description',
	            controller: {
	                togglePanel: function ($event) {
	                    toggleSidePanel(this);
	                    $event.stopPropagation();
	                },
	                displayDropDownButton: function (wiki) {
	                    return entcore_1.model.me.hasWorkflow(entcore_1.Behaviours.applicationsBehaviours.wiki.rights.workflow.print) ||
	                        entcore_1.model.me.hasRight(wiki, entcore_1.Behaviours.applicationsBehaviours.wiki.rights.resources.deletePage) ||
	                        entcore_1.model.me.hasRight(wiki, entcore_1.Behaviours.applicationsBehaviours.wiki.rights.resources.editPage) ||
	                        this.canCreatePageInAtLeastOneWiki();
	                },
	                initSource: function () {
	                    this.wiki = new entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Wiki();
	                    this.searchWiki = {};
	                    entcore_1.http().get('/wiki/list').done(function (pWikis) {
	                        var $scope = this;
	                        this.wikis = entcore_1._.map(pWikis, function (wiki) {
	                            wiki.matchSearch = function () {
	                                return this.title.toLowerCase().indexOf(($scope.searchWiki.searchText || '').toLowerCase()) !== -1;
	                            };
	                            return wiki;
	                        });
	                        this.$apply('wikis');
	                    }.bind(this));
	                },
	                search: function (wiki) {
	                    return wiki.matchSearch();
	                },
	                createWiki: function () {
	                    var scope = this;
	                    if (entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.titleIsEmpty(scope.wiki.title)) {
	                        entcore_1.notify.error('wiki.form.title.is.empty');
	                        return;
	                    }
	                    if (scope.snipletResource) {
	                        scope.wiki.thumbnail = scope.snipletResource.icon || '';
	                    }
	                    scope.wiki.createWiki(scope.wiki, function (createdWiki) {
	                        // Create a default homepage
	                        var page = {
	                            isIndex: true,
								isVisible: true,
	                            title: entcore_1.idiom.translate('wiki.sniplet.default.homepage.title'),
	                            content: entcore_1.idiom.translate('wiki.sniplet.default.homepage.content')
	                        };
	                        scope.wiki.createPage(page, function (createdPage) {
	                            scope.setSnipletSource({ _id: createdWiki._id });
	                            scope.snipletResource.synchronizeRights(); // propagate rights from sniplet to wiki
	                        });
	                    });
	                },
	                // Get data to display selected wiki
	                init: function () {
	                    var scope = this;
	                    viewWiki(scope, scope.source._id, function () {
	                        entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.updateSearchBar(scope);
	                    }, 'sniplet');
	                },
	                /* Function used by application "Pages", to copy rights from "Pages" to resources.
	                 * It returns an array containing all resources' ids which are concerned by the rights copy.
	                 * For sniplet "wiki", copy rights from "Pages" to associated wiki */
	                getReferencedResources: function (source) {
	                    if (source._id) {
	                        return [source._id];
	                    }
	                },
	                // Date functions
	                formatDate: function (dateObject) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.formatDate(dateObject);
	                },
	                getDateAndTime: function (dateObject) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.getDateAndTime(dateObject);
	                },
	                getRelativeTimeFromDate: function (dateObject) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.getRelativeTimeFromDate(dateObject);
	                },
	                // Functions on wiki pages
	                openPageFromSearchbar: function (wikiId, pageId) {
	                    openPageFromSearchbar(wikiId, pageId, this);
	                },
	                openPageFromSidepanel: function (pageId) {
	                    openPageFromSidepanel(pageId, this);
	                },
	                openPage: function (pageId) {
	                    openPage(pageId, this);
	                },
	                listPages: function () {
	                    var scope = this;
	                    var wiki = this.wiki;
	                    listPages(scope, wiki, null);
	                    toggleSidePanel(scope);
	                },
	                newPage: function () {
	                    var scope = this;
	                    scope.wiki.newPage = new entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Page();
	                    if (scope.display) {
	                        scope.display.previousAction = scope.display.action;
	                        scope.display.action = 'createPage';
	                    }
	                    else {
	                        scope.display = { action: 'createPage' };
	                    }
	                },
	                createPage: function () {
	                    var scope = this;
	                    var wiki = scope.wiki;
	                    wiki.processing = true;
	                    if (entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.titleIsEmpty(wiki.newPage.title)) {
	                        entcore_1.notify.error('wiki.form.title.is.empty');
	                        wiki.processing = false;
	                        return;
	                    }
	                    if (entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.pageTitleExists(wiki.newPage.title, wiki)) {
	                        entcore_1.notify.error('wiki.page.form.titlealreadyexist.error');
	                        wiki.processing = false;
	                        return;
	                    }
	                    var data = {
	                        title: wiki.newPage.title,
	                        content: wiki.newPage.content,
	                        isIndex: wiki.newPage.isIndex,
							isVisible: wiki.newPage.isVisible || true
	                    };
	                    wiki.createPage(data, function (createdPage) {
	                        entcore_1.notify.info('wiki.page.has.been.created');
	                        wiki.processing = false;
							displayAction(scope, 'pagesList');
	                        getPage(scope, wiki, createdPage._id, function () {
	                            entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.updateSearchBar(scope);
	                            scope.$apply();
	                        });
	                    });
	                },
	                cancelCreatePage: function () {
	                    this.display.action = this.display.previousAction;
	                },
	                editPage: function () {
	                    var scope = this;
	                    var wiki = scope.wiki;
	                    wiki.editedPage = new entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Page(wiki.page);
	                    wiki.editedPage.isIndex = (wiki.editedPage._id === wiki.index);
	                    wiki.editedPage.wasIndex = (wiki.page._id === wiki.index);
	                    displayAction(scope, 'editPage');
	                },
	                cancelEditPage: function () {
	                    this.display.action = 'viewPage';
	                },
	                updatePage: function () {
	                    var scope = this;
	                    var wiki = scope.wiki;
	                    wiki.processing = true;
	                    if (entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.titleIsEmpty(wiki.editedPage.title)) {
	                        entcore_1.notify.error('wiki.form.title.is.empty');
	                        wiki.processing = false;
	                        return;
	                    }
	                    if (entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.pageTitleExists(wiki.editedPage.title, wiki, wiki.editedPage._id)) {
	                        entcore_1.notify.error('wiki.page.form.titlealreadyexist.error');
	                        wiki.processing = false;
	                        return;
	                    }
	                    wiki.page = wiki.editedPage;
	                    wiki.page.save(function (result) {
	                        entcore_1.notify.info('wiki.page.has.been.updated');
	                        wiki.processing = false;
	                        getPage(scope, wiki, wiki.page._id, function () {
	                            entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.updateSearchBar(scope);
	                        });
							displayAction(scope, 'viewPage');
	                    });
	                },
	                deletePage: function () {
	                    var scope = this;
	                    var wiki = scope.wiki;
	                    wiki.deletePage(wiki.page._id, function () {
	                        listPages(scope, wiki, function () {
	                            entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.updateSearchBar(scope);
	                        });
	                    });
	                },
	                // Duplicate pages
	                showDuplicatePageForm: function () {
	                    var scope = this;
	                    scope.wikiDuplicate = {};
	                    displayAction(scope, 'duplicatePage');
	                },
	                canCreatePage: function (pWiki) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.canCreatePage(pWiki);
	                },
	                canCreatePageInAtLeastOneWiki: function () {
	                    return entcore_1._.some(this.wikis, function (wiki) {
	                        return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.canCreatePage(wiki);
	                    });
	                },
	                duplicatePage: function () {
	                    var scope = this;
	                    var title = (scope.wikiDuplicate.page) ? scope.wikiDuplicate.page.title : '';
	                    scope.wikiDuplicate.page = new entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Page({
	                        title: title,
	                        content: scope.wiki.page.content,
	                        isIndex: false
	                    });
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.duplicatePage(scope, scope.wiki);
	                },
	                cancelDuplicatePage: function () {
	                    var scope = this;
	                    displayAction(scope, 'viewPage');
	                },
	                // Functions on comments
	                showCommentForm: function () {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.showCommentForm(this.wiki);
	                },
	                hideCommentForm: function () {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.hideCommentForm(this.wiki);
	                },
	                switchCommentsDisplay: function () {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.switchCommentsDisplay(this.wiki);
	                },
	                commentPage: function () {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.commentPage(this.wiki, this);
	                },
	                removeComment: function (commentId, commentIndex) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.removeComment(this.wiki, commentId, commentIndex, this);
	                },
	                // Versions
	                listVersions: function () {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.listVersions(this.wiki, this);
	                },
	                showVersion: function (version) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.showVersion(version, this);
	                },
	                restoreVersion: function (version) {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.restoreVersion(version, this.wiki, this);
	                },
	                compareVersions: function () {
	                    return entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.compareVersions(this.wiki, this);
	                }
	            }
	        }
	    }
	});
	// Load workfow rights, so that they can be used in wiki sniplet and in wiki application
	entcore_1.model.me.workflow.load(['wiki']);
	// Functions used in sniplet's controller
	function viewWiki(scope, wikiId, callback, context) {
	    entcore_1.http().get('/wiki/list').done(function (pWikis) {
	        scope.wikis = [];
	        for (var i = 0; i < pWikis.length; i++) {
	            scope.wikis[i] = new entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.Wiki(pWikis[i]);
	            // Copy properties from object "pWikis[i]" into object "scope.wikis[i]"
	            for (var prop in pWikis[i]) {
	                if (pWikis[i].hasOwnProperty(prop)) {
	                    scope.wikis[i][prop] = pWikis[i][prop];
	                }
	            }
	            scope.wikis[i].behaviours('wiki');
	        }
	        // wikis where user can add a page. Used when duplicating a wiki page
	        scope.editableWikis = entcore_1._.filter(scope.wikis, entcore_1.Behaviours.applicationsBehaviours.wiki.namespace.canCreatePage);
	        var wiki = entcore_1._.find(scope.wikis, function (pWiki) {
	            return pWiki._id === wikiId;
	        });
	        // wiki not found
	        if (!wiki) {
	            displayAction(scope, 'wikiNotFound');
	            return;
	        }
	        wiki.context = context;
	        wiki.pages.sync(function () {
	            wiki.setLastPages();
	            if (wiki.index && wiki.index.length > 0) {
	                // Show index if it exists
	                wiki.getPage(wiki.index, function (result) {
	                    scope.wiki = wiki;
	                    displayAction(scope, 'viewPage');
	                    scope.$apply();
	                    if (typeof callback === 'function') {
	                        callback();
	                    }
	                }, function () {
	                    displayAction(scope, 'pageNotFound');
	                    scope.$apply();
	                });
	            }
	            else {
	                scope.wiki = wiki;
	                displayAction(scope, 'pagesList');
	                scope.$apply();
	                if (typeof callback === 'function') {
	                    callback();
	                }
	            }
	        });
	    });
	}
	function openPageFromSearchbar(wikiId, pageId, scope) {
	    var currentWikiId = scope.wiki._id;
	    if (currentWikiId === wikiId) {
	        openPageFromSidepanel(pageId, scope);
	    }
	    else {
	        window.location.href = '/wiki#/view/' + wikiId + '/' + pageId;
	    }
	}
	function openPageFromSidepanel(pageId, scope) {
	    openPage(pageId, scope);
	    toggleSidePanel(scope);
	}
	function openPage(pageId, scope) {
	    getPage(scope, scope.wiki, pageId, ()=>{
			getPage(scope, scope.wiki, pageId);
		});
	}
	function getPage(scope, wiki, pageId, callback) {
	    wiki.pages.sync(function () {
	        wiki.setLastPages();
	        wiki.getPage(pageId, function (result) {
	            displayAction(scope, 'viewPage');
	            scope.wiki = wiki;
	            scope.$apply();
	            if (typeof callback === 'function') {
	                callback();
	            }
	        }, function () {
	            displayAction(scope, 'pageNotFound');
	            scope.$apply();
	        });
	    });
	}
	function listPages(scope, wiki, callback) {
	    wiki.pages.sync(function () {
	        wiki.setLastPages();
	        if (typeof callback === 'function') {
	            callback();
	        }
	        displayAction(scope, 'pagesList');
	    });
	}
	function toggleSidePanel(scope) {
	    scope.display.showPanel = !scope.display.showPanel;
	}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports = entcore;

/***/ })
/******/ ]);
//# sourceMappingURL=behaviours.js.map