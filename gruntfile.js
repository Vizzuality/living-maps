module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['gruntfile.js', '_staging/**/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          document: true
        }
      }
    },
    clean: {
      dist: ['_staging', '_production']
    },
    copy: {            
      dist: {
        files: [
          {expand: true, cwd: '_staging/', src: ['*'], dest: '_production/', filter: 'isFile'},
          {expand: true, cwd: '_staging/flash/', src: ['**'], dest: '_production/flash/'},
          {expand: true, cwd: '_staging/fonts/', src: ['**'], dest: '_production/fonts/'},
          {expand: true, cwd: '_staging/img/', src: ['**'], dest: '_production/img/'}
        ]
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['_staging/js/vendor/*.js', '_staging/js/profiler.js', '_staging/js/events.js', '_staging/js/leaflet_tileloader_mixin.js', '_staging/js/canvas_layer.js', '_staging/js/sprites.js', '_staging/js/graph.js', '_staging/js/navigation.js', '_staging/js/slider.js', '_staging/js/mamufas.js', '_staging/js/time_based_data.js', '_staging/js/map/*.js', '_staging/js/map.js', '_staging/js/app.js', '_staging/js/main.js' ],
        dest: '_staging/js/living-maps.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! living-maps <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '_production/js/living-maps.min.js': ['_staging/js/living-maps.js'],
          '_production/js/util.min.js': ['_staging/js/util.js'],
          '_production/js/probs_density_layer.min.js': ['_staging/js/probs_density_layer.js'],
          '_production/js/process_tile_worker.min.js': ['_staging/js/process_tile_worker.js'],
          '_production/js/data/cities.min.js': ['_staging/js/data/cities.js']
        }
      }
    },
    cssmin: {
      add_banner: {
        options: {
          banner: '/*! living-maps <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        },
        files: {
          '_production/css/living-maps.min.css': ['_staging/css/vendor/*.css', '_staging/css/*.css']
        }
      }
    },
    useminPrepare: {
      html: '_production/index.html'
    },
    usemin: {
      html: ['_production/**/*.html']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('default', ['jshint clean copy concat uglify useminPrepare usemin']);
};