Installation
============

We use `Grunt` for the development and deployment process. Make sure you have Node.js and Git installed (plus Ruby and Compass too) then install the recommended tools by running:

```
npm install -g yo grunt-cli bower
```
Which will install `yeoman`, `grunt` and `bower`


Use
===

To start the server type the next command in your shell:

```
grunt server
```

And access normally in your browser to the next address:

* http://localhost.lan:9000


Deploy
======

The workflow to create and deploy the static assets is as follow:

```
grunt build
```

From now on, the `dist` directory will be commited, and for every deploy to `gh-pages` we must run the next command after commiting the changes:

```
git subtree push --prefix _production origin gh-pages
```

For more information:

* http://yeoman.io/
