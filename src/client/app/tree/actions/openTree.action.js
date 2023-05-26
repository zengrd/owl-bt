(function () {
    'use strict';
  
    class OpenTreeAction {
      constructor(ActionExecutor, ProjectStore, AlertList) {
        this._ActionExecutor = ActionExecutor;
        this._ProjectStore = ProjectStore;
        this._AlertList = AlertList;
      }
  
      exec() {
        let _this = this;
        this._ActionExecutor.exec({
          exec: () => {
            return _this._ProjectStore.openProject();
          }
        });
      }
    }
  
    angular.module('editorApp')
      .service('OpenTreeAction', OpenTreeAction);
  })();
  