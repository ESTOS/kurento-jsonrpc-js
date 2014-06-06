/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */


module.exports = function(grunt)
{
  var DIST_DIR = 'dist';

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig(
  {
    pkg: pkg,

    // Plugins configuration
    clean:
    {
      generated_code: [DIST_DIR, 'src'],

      generated_doc: '<%= jsdoc.all.dest %>'
    },

    // Generate documentation
    jsdoc:
    {
      all:
      {
        src: ['README.md', 'lib/**/*.js', 'test/*.js'], 
        dest: 'doc/jsdoc'
      }
    },

    // Generate browser versions and mapping debug file
    browserify:
    {
      require:
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>_require.js'
      },

      standalone:
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>.js',

        options:
        {
          bundleOptions: {
            standalone: 'RpcBuilder'
          }
        }
      },

      'require minified':
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>_require.min.js',

        options:
        {
          debug: true,
          plugin: [
            ['minifyify',
             {
               compressPath: DIST_DIR,
               map: '<%= pkg.name %>.map'
             }]
          ]
        }
      },

      'standalone minified':
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>.min.js',

        options:
        {
          debug: true,
          bundleOptions: {
            standalone: 'RpcBuilder'
          },
          plugin: [
            ['minifyify',
             {
               compressPath: DIST_DIR,
               map: '<%= pkg.name %>.map',
               output: DIST_DIR+'/<%= pkg.name %>.map'
             }]
          ]
        }
      }
    },

    // Generate bower.json file from package.json data
    sync:
    {
      all:
      {
        options:
        {
          sync: [
            'name', 'description', 'license', 'keywords', 'homepage',
            'repository'
          ],
          overrides: {
            authors: (pkg.author? [pkg.author]: []).concat(pkg.contributors||[])
          }
        }
      }
    },

    // Publish / update package info in Bower
    shell:
    {
      bower: {
        command: [
          'curl -X DELETE "https://bower.herokuapp.com/packages/<%= pkg.name %>?auth_token=<%= process.env.TOKEN %>"',
          'node_modules/.bin/bower register <%= pkg.name %> <%= pkg.repository.url %>'
        ].join('&&')
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-npm2bower-sync');
  grunt.loadNpmTasks('grunt-shell');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'jsdoc', 'browserify']);
  grunt.registerTask('bower',   ['sync', 'shell:bower']);
};
