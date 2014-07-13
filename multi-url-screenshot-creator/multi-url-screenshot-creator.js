//===================================================================
// Multi URL Screenshot Creator
// -- VERSION 1.0.0 --
//
// Required: http://phantomjs.org
// 
// Start parameter: <URL1> <URL2> ... <--OPTIONAL_PARAMETER> ...
//
// Optional parameter: --css=false    don't load CSS resource files default:true
//
// Example start command:
// phantomjs phantomjs-multi-url-screenshot-creator.js www.blogging-it.com --css=false
//
// ::::::::::::::: www.blogging-it.com :::::::::::::::
//
// Copyright (C) 2014 Markus Eschenbach. All rights reserved.
//
//
// This software is provided on an "as-is" basis, without any express or implied warranty.
// In no event shall the author be held liable for any damages arising from the
// use of this software.
//
// Permission is granted to anyone to use this software for any purpose,
// including commercial applications, and to alter and redistribute it,
// provided that the following conditions are met:
//
// 1. All redistributions of source code files must retain all copyright
// notices that are currently in place, and this list of conditions without
// modification.
//
// 2. All redistributions in binary form must retain all occurrences of the
// above copyright notice and web site addresses that are currently in
// place (for example, in the About boxes).
//
// 3. The origin of this software must not be misrepresented; you must not
// claim that you wrote the original software. If you use this software to
// distribute a product, an acknowledgment in the product documentation
// would be appreciated but is not required.
//
// 4. Modified versions in source or binary form must be plainly marked as
// such, and must not be misrepresented as being the original software.
//
// ::::::::::::::: www.blogging-it.com :::::::::::::::
//===================================================================

// ***** GLOBAL VARIABLES ******
var CONST_APP_NAME, CONST_APP_VERSION, CONST_NEW_LINE, App, AppError, ScreenshotCreator;

// ***** CONSTANTS ******
CONST_APP_NAME      = 'Multi URL Screenshot Creator';
CONST_APP_VERSION   = '1.0.0';
CONST_NEW_LINE      = '\n';
CONST_OUTPUT_FORMAT = 'png'; //Supported formats: png, gif, jpeg, pdf
CONST_REXP_URL      = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/;




// ***** CLASSES ******               

AppError = function(msg) {
  Error.call(this);
  this.name = 'AppError';
  this.message = (msg || '');
};

ScreenshotCreator = function(urls, options){
  this.processCount = -1;
  this.urls = urls;
  this.config = {
     'css': (options.css !== 'false')
  };
};

App = function(){
  this.appName = CONST_APP_NAME;
  this.version = CONST_APP_VERSION;
  this.hasError = false;
	this.init();
};

// ***** FUNCTIONS ******
ScreenshotCreator.prototype = Object.create(App.prototype);
AppError.prototype = Object.create(Error.prototype); 

ScreenshotCreator.prototype.checkURL = function(url){
  var newURL, validURL;
  
  newURL = url;
   if(url){
      if(!url.startsWith('http')){
          newURL = 'http://' + url;
      } 
   }
  
   //check for a valid url
   validURL = CONST_REXP_URL.test(newURL);
   if(!validURL){
      this.logError('No valid url: ' + url);
      newURL = null;
   }
   return newURL;
};

ScreenshotCreator.prototype.processNextURL = function(){
  var self, page, time, url;

  this.processCount++;
  if(this.processCount === this.urls.length){
     this.stop();
     return;
  }
  
  self = this; 
  page = require('webpage').create();
  
  url = this.urls[this.processCount];
  
  console.log(CONST_NEW_LINE + 'Process url ' + (this.processCount + 1) + ' of ' + this.urls.length);
  
  url = this.checkURL(url);
  if(!url){
    this.processNextURL();
    return;
  }
  console.log('Loading page from url: ' + url);
  
  //don't load CSS resource files
  if(!this.config.css){
    page.onResourceRequested = function(requestData, request) {
        if ((/http:\/\/.+?\.css/gi).test(requestData.url) || requestData.headers['Content-Type'] === 'text/css'){
            request.abort(); // url of the request is matching. Aborting
        }
    };
  }

  //catch an error occured in a web page, whether it is a syntax error or other thrown exception
  page.onError = function(msg, trace) {
    self.logError(msg);
    trace.forEach(function(item) {
        console.error('  ', item.file, ':', item.line);
    });
  
    page.close(); //close the page and releases the memory heap associated with it
  
    self.processNextURL();
  };

  // This callback is invoked when "console.log()" calls from within the page context to the main PhantomJS context
  page.onConsoleMessage = function(msg,line,source) {
    console.log('page-log> ' + msg);
  };
  
  //This callback is invoked when there is a JavaScript alert
  page.onAlert = function(msg) {
    console.log('page-alert> ' + msg);
  };
  
  time = Date.now();
  
  page.open(url, function(status){
    time = Date.now() - time;

    if (status !== 'success') {
      console.error('ERROR: Fail to load the url: ' + url);
      page.close(); //close the page and releases the memory heap associated with it
      self.processNextURL();
    }else{  
      //the open() callback is invoked only when the page is loaded. Little delay while everything has been loaded and the js has been fully executed.
      window.setTimeout(function () {
        console.log('Page successfully loaded in ' + time + ' msec');
        self.createScreenshot(page);
        page.close(); //close the page and releases the memory heap associated with it
        self.processNextURL();
      }, 2000);
    }
  });
};


ScreenshotCreator.prototype.getPageTitle = function(page){
  var title = page.evaluate(function () {
    return document.title;
  });
  
  return title;
};

ScreenshotCreator.prototype.createScreenshot = function(page){
  var pageTitle, fileName;

  console.log('Create screenshot...');

  pageTitle = this.getPageTitle(page);

  //normalize web page title
  pageTitle = pageTitle
              .replace(/[\u00e0\u00e1\u00e2\u00e4]/g, 'a')  //àáâä
              .replace(/[\u00fa\u00fb\u00fc\u00f9]/g, 'u')  //úûüù
              .replace(/[\u00f2\u00f3\u00f5\u00f6]/g, 'o')  //òóõö
              .replace(/[\u00df\u00A9]/g, 'ss')  //ß
              .replace(/[^a-z0-9]/gi, '_');  //normalize other

  fileName = 'screenshot-' + pageTitle + '.' + CONST_OUTPUT_FORMAT;
  page.render(fileName,{format: CONST_OUTPUT_FORMAT});
  console.log('Screenshot "' + fileName + '" saved');
};

ScreenshotCreator.prototype.start = function(){
  if (!this.urls || this.urls.length === 0) {
    throw new AppError('No url found');
  }else{
    this.processNextURL();
  }
};



App.prototype.init = function(){
  var self = this;

  //Invoked when there is a JavaScript execution error not caught by a page.onError handler
  phantom.onError = function(msg, stack) {
    var msgStack = [msg];
    if (msg && !msg.startsWith('AppError') && stack && stack.length) {//don't print stack for AppError
        msgStack.push('TRACE:');
        stack.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
    }
    self.logError(msgStack.join(CONST_NEW_LINE));
    self.stop(1);
  };


  if (typeof String.prototype.startsWith !== 'function') {
      String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
      };
  }

  if (typeof String.prototype.endsWith !== 'function') {
      String.prototype.endsWith = function (str){
          return this.slice(-str.length) === str;
      };
  }
};

App.prototype.readArguments = function(){
  var system, args;
  
  system = require('system');

  this.scriptName = system.args[0]; 

  args = {};
  args.urls = [];

  system.args.forEach(function (arg, i) {
    var paramKey, paramVal, pramIdx;

    if(i > 0){
      if(arg.startsWith('--')){ //only config-parameter starts with --
          pramIdx = arg.indexOf('=');
          paramKey = arg.substring(2,(pramIdx === -1) ? arg.length : pramIdx);
          paramVal = (pramIdx === -1) ? null : arg.substring(pramIdx+1);
          args[paramKey] = paramVal;
      }else{
          args.urls = args.urls.concat(arg.split(','));
      }
    }
  });

  return args;
};

App.prototype.getInfo = function(){
  return this.appName + ' - ' + this.version;
};

App.prototype.logError = function(msg){
  this.hasError = true;
  console.error('ERROR: ' + msg);
};

App.prototype.stop = function(code){
  console.log('***** Finished ' + ((this.hasError) ? 'with error' : 'successfully') + ' *****');
  phantom.exit(code || 0);  
};

App.prototype.start = function(){
  console.log('***** ' + this.getInfo() + ' *****');

  var options = this.readArguments();

  if (options.urls.length === 0) {
    this.logError('Usage: ' + this.scriptName + ' <URL1> <URL2> ... <--OPTIONAL_PARAMETER> ...');
    this.stop(1);
  } else {
    new ScreenshotCreator(options.urls,options).start();
  }
};


// ***** RUN THE PROGRAM ******
new App().start();
