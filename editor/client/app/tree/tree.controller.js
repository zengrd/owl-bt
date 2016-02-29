'use strict';

angular.module('editorApp')
  .controller('TreeCtrl', function($scope, $interpolate, $location, hotkeys, ListSelectDialog,
    ProjectModel, TreeModel, UndoRedoManager) {

    $scope.treePath = $location.search().path;

    //https://github.com/angular/angular.js/wiki/Understanding-Scopes#ng-include
    $scope.model = {
      commands: [{
          name: 'add.node',
          icon: 'cog',
          action: function() {}
        }, {
          name: 'add.decorator',
          icon: 'cog',
          action: function() {}
        }, {
          name: 'add.service',
          icon: 'cog',
          action: function() {}
        }, {
          name: 'move.up',
          icon: 'cog',
          action: function() {}
        }, {
          name: 'move.down',
          icon: 'cog',
          action: function() {}
        }, {
          name: 'delete',
          icon: 'cog',
          action: function() {}
        }]
        // commands : {
        //   add:{
        //     forComposite: [],
        //     forLeaf: []
        //   }
        // }
    };

    ProjectModel.get().then(projectModel => {
       $scope.model.projectModel = projectModel;
    });
    TreeModel.get().then(treeModel => {
       $scope.model.tree = treeModel;
    });

    // function buildCommands() {
    //   let forCompositeAddCommands = $scope.model.commands.add.forComposite;
    //   let forLeafAddCommands = $scope.model.commands.add.forLeaf;
    //
    //   for (let nodeTypeName in ProjectModel.nodeTypes) {
    //     if (ProjectModel.nodeTypes.hasOwnProperty(nodeTypeName)) {
    //       let nodeType = ProjectModel.nodeTypes[nodeTypeName];
    //       commands.push({
    //         name: 'add.node.' + nodeType.name,
    //         icon: nodeType.icon,
    //         action: addNodeCommand
    //       });
    //     }
    //   }
    //   return commands;
    // }

    $scope.getNodeItemActions = function(nodeItem) {
      return nodeItem.getContextMenuActions();
    };

    $scope.open = function() {
      ListSelectDialog.open($scope.model.commands)
        .result.then(function(item) {
          if (item.name === 'add.node') {
            ListSelectDialog.open([{
                name: 'node1',
                icon: 'cog',
                action: function() {}
              }, {
                name: 'node2',
                icon: 'cog',
                action: function() {}
              }])
              .result.then(function(item) {
                console.log('selected item = ' + item.name);
              }, function() {
                console.log('cancel');
              });
          }
          //console.log('selected item = ' + item.name);
        }, function() {
          console.log('cancel');
        });
    };
    $scope.undo = function() {
      UndoRedoManager.undo();
    };
    $scope.redo = function() {
      UndoRedoManager.redo();
    };

    $scope.$watch('model.tree.version', function() {
      //deselect removed node item
      let selectedNodeItem = $scope.model.selectedNodeItem;
      if (selectedNodeItem) {
        if ('parentNode' in selectedNodeItem) { //is node
          if (!selectedNodeItem.parentNode) {
            $scope.model.selectedNodeItem = null;
          }
        } else { //is subitem
          let node = selectedNodeItem.node();
          if (!node.containsSubItem(selectedNodeItem)) {
            $scope.model.selectedNodeItem = null;
          }
        }
      }
    });

    hotkeys.add({
      combo: 'up',
      description: 'This one goes to 11',
      callback: function() {
        console.log('root up');
      }
    });



  });