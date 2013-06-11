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

* There are some lines in the code which must be commented/uncommented prior to the build, for minification purposes

```
app/scripts/main.js
app/scripts/probs_density_layer.js
app/scripts/process_tile_worker.js
```

We don't need to commit the resulting `dist` directory, which will be deployed to the next URL via `S3` command:

* http://com.vizzuality.livingcities.s3-website-us-east-1.amazonaws.com/

For more information:

* http://yeoman.io/
