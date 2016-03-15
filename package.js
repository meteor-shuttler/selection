Package.describe({
  name: 'shuttler:selection',
  version: '0.0.1',
  summary: 'Selection in the graphs.',
  git: 'https://github.com/shuttler/meteor-selection.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  
  api.use('mongo');
  api.use('ecmascript');
  
  api.use('stevezhu:lodash@4.3.0');
  api.use('aldeed:collection2@2.9.0');
  api.use('dburles:collection-helpers@1.0.4');
  api.use('matb33:collection-hooks@0.8.1');
  api.use('ivansglazunov:restrict@0.0.2');
  api.use('shuttler:graphs@0.0.10');
  
  api.addFiles('Selection.js');
  api.addFiles('Schema.js');
  api.addFiles('byPaths.js');
  api.addFiles('actions.js');
  api.addFiles('watchers.js');
  
  api.export('Shuttler');
});