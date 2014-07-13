Multi URL Screenshot Creator
====================================

### Introduction

With this script you can create a screenshot of one or more web pages. The screenshots are separately saved in PNG files.

[German Guide](http://www.blogging-it.com/phantomjs-script-um-von-mehreren-webseiten-screenshot-zu-erstellen/programmierung/javascript/phantomjs.html)


### Requirements

To run the scripts, you have to download the PhantomJS binary and stick it somewhere in the PATH.

Go to the [PhantomJS download page](http://www.phantomjs.org/download.html), choose your operating system and download the correct package.


Alternative installation using [Homebrew](http://brew.sh):
```
  $ sudo brew update && sudo brew install phantomjs
```


Alternative installation using [MacPorts](https://www.macports.org):
```
  $ sudo port selfupdate && sudo port install phantomjs
```


Alternative installation using [Chocolatey](https://www.chocolatey.org):
```
  $ cinst PhantomJS
```


Check your installation by running this command:
```
  $ phantomjs --version
```

When you see the version, PhantomJS is correctly installed.


### Getting started

Execute this command from the command line with the desired url(s) to make a screenshot of the rendered web page.  

```
  $ phantomjs multi-url-screenshot-creator.js www.blogging-it.com
```

You can use the optional parameter `--css=false` if you don't want to load the css resource files.


### Links

* [PhantomJS](http://www.phantomjs.org)
* [PhantomJS Scripts](http://www.blogging-it.com/programmierung/javascript/phantomjs)


### License
The license is committed to the repository in the project folder as `LICENSE.txt`.  
Please see the `LICENSE.txt` file for full informations.


----------------------------------

Markus Eschenbach  
http://www.blogging-it.com

