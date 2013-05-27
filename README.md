Installation
============

We use `bundler` to manage the dependencies, to start working just type the next command in your shell:

```
bundle install
```
Which will install `jekyll`, `compass` and `foreman` gems

I assume we use `rbenv`for the Ruby environment:

* https://github.com/sstephenson/rbenv/


Use
===

To start the server type the next command in your shell:

```
foreman start
```

And access normally in your browser to the next address:

* http://localhost.lan:4000


Deploy
======

In order to create the static files for deploy we use `Grunt`. `Grunt` and Grunt tasks are installed and managed via an existing `package.json`. Remember to update your `node` and `npm` installation first.

```
npm install
```

The workflow to deploy static assets is as follow:

```
grunt clean       <- clean deploy directories
compass compile   <- regenerate stylesheets
jekyll build      <- regenerate markup to _staging
grunt copy        <- copy static files to _production
grunt cssmin      <- minify stylesheets
grunt concat      <- concat javascript files
grunt uglify      <- compress and uglify javascript files
grunt usemin      <- update paths in markup with minifies files
```

From now on, the `_production` directory will be commited, and for every deploy to `gh-pages` we must run the next command after the previous instructions and commiting the changes:

```
git subtree push --prefix _production origin gh-pages
```

For more information:

* https://github.com/mojombo/jekyll
* http://compass-style.org/
* https://github.com/ddollar/foreman
* http://gruntjs.com/
