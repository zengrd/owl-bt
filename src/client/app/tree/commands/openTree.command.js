'use strict';

(function () {

  class OpenTreeCommand {

    constructor(OpenTreeAction, TreeStore) {
      this._OpenTreeAction = OpenTreeAction;
      this._TreeStore = TreeStore;
    }

    canExec() {
      return this._TreeStore.isLoaded;
    }

    exec() {
      if (this.canExec()) {
        this._OpenTreeAction.exec();
      }
    }
  }

  angular.module('editorApp')
    .service('OpenTreeCommand', OpenTreeCommand)
    .config(function (CommandPaletteCfgProvider, CommandTopMenuCfgProvider) {
      CommandPaletteCfgProvider.addCommand({
        service: 'OpenTreeCommand',
        name: 'core:Open',
        icon: 'folder-open',
        hotkey: 'mod+o',
        allowHotkeyInForms: true
      });
     CommandTopMenuCfgProvider.addMenuItem({
        title: 'Open',
        section: 'File',
        command: 'core:Open',
        order: 110
      });
    });
})();
