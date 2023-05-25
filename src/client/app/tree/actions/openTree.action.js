(function () {
    'use strict';
  
    class OpenTreeAction {
      constructor(ActionExecutor, TreeStore, AlertList) {
        this._ActionExecutor = ActionExecutor;
        this._TreeStore = TreeStore;
        this._AlertList = AlertList;
      }
  
      exec() {
        let _this = this;
        this._ActionExecutor.exec({
          exec: () => {
            return _this._TreeStore.open();
          }
        });
      }
    }
  
    angular.module('editorApp')
      .service('OpenTreeAction', OpenTreeAction);
  })();
  