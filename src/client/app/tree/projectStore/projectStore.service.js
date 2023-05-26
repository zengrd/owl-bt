'use strict';

(function () {
  class ProjectStore {
    constructor(_, io, $interpolate, $resource, $rootScope, Toposort, $location, $http, TreeMruList) {
      //this.treePath = $location.search().path;
      this.isLoaded = false;
      this.version = 1;

      this._ = _;
      this._io = io;
      this._$interpolate = $interpolate;
      this._$rootScope = $rootScope;
      this.Toposort = Toposort;
      this._location = $location;
      this._http = $http;
      this.TreeMruList = TreeMruList


      this._projectResource = $resource('api/project?path=:treePath', {
        treePath: '@treePath'
      });
    }

    load(treePath) {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.treePath = treePath;
      this.isLoaded = false;
      this._currentPromise = null;

      return this._current();
    }
    
    openProject() {
      this._http.get('api/project/fileList')
      .then(response => {
        const data = response.data;
        for(const file of data){
          this.TreeMruList.register(file.path);
        }
        this._location.path('/');
      })
      .catch(error => console.error(error));
    }

    ensureLoad() {
      return this._current();
    }

    getCustomType(typeName) {
      return this.customTypes[typeName] || { type: 'string' };
    }

    getNodeTypeDesc(name) {
      this._checkLoaded();
      let desc = this.nodeTypeDescs[name];
      if (!desc) {
        return {
          isInvalid: true,
          name: name,
          isComposite: true,
          icon: 'exclamation-triangle'
        };
      }
      return desc;
    }

    getServiceTypeDesc(name) {
      this._checkLoaded();
      let desc = this.serviceTypeDescs[name];
      if (!desc) {
        return this._getFallbackSubItemDesc(name);
      }
      return desc;
    }

    getDecoratorTypeDesc(name) {
      this._checkLoaded();
      let desc = this.decoratorTypeDescs[name];
      if (!desc) {
        return this._getFallbackSubItemDesc(name);
      }
      return desc;
    }

    getNodeDescs() {
      this._checkLoaded();
      return this.nodeTypeDescs;
    }

    /**
     * get sub item descriptors of a given type
     * @param  {string} subItemType - 'service' or 'decorator'
     * @return {desc}             descriptor
     */
    getSubItemDescs(subItemType) {
      this._checkLoaded();

      if (subItemType !== 'service' && subItemType !== 'decorator') {
        throw new Error(`invalid sub item type ${subItemType}`);
      }

      return this[subItemType + 'TypeDescs'];
    }

    getServiceDescs() {
      this._checkLoaded();
      return this.serviceTypeDescs;
    }

    getDecoratorDescs() {
      this._checkLoaded();
      return this.decoratorTypeDescs;
    }

    _checkLoaded() {
      if (!this.isLoaded) {
        throw new Error('Project is not loaded');
      }
    }

    _current() {
      let _this = this;

      if (!this._currentPromise) {
        this._currentPromise = this._projectResource.get({
          treePath: this.treePath
        }).$promise.then(prjData => {
          _this._compileProject(prjData);
          this.isLoaded = true;

          this._startPrjChangeWatch();
        });
      }
      return this._currentPromise;
    }

    _startPrjChangeWatch() {
      let _this = this;
      this.socket = this._io('/prj-watch', {
        query: `treePath=${this.treePath}`
      });
      this.socket.on('prj-reload', prjDataStr => {
        _this._compileProject(JSON.parse(prjDataStr));
        _this._$rootScope.$apply(() => {
          _this.updateVersion();
        });
      });
    }

    _compileProject(prjData) {
      let nodeTypeDescs = this._.keyBy(prjData.nodes || [], 'name');
      let serviceTypeDescs = this._.keyBy(prjData.services || [], 'name');
      let decoratorTypeDescs = this._.keyBy(prjData.decorators || [], 'name');

      this._compileInheritances(nodeTypeDescs);
      this._compileInheritances(serviceTypeDescs);
      this._compileInheritances(decoratorTypeDescs);

      this.nodeTypeDescs = this._withoutAbstract(nodeTypeDescs);
      this.serviceTypeDescs = this._withoutAbstract(serviceTypeDescs);
      this.decoratorTypeDescs = this._withoutAbstract(decoratorTypeDescs);

      this._compileDescriptions(this.nodeTypeDescs);
      this._compileDescriptions(this.serviceTypeDescs);
      this._compileDescriptions(this.decoratorTypeDescs);

      this.customTypes = prjData.types || {};
    }

    _compileInheritances(typeDescs) {
      let toposort = new this.Toposort();
      this._.forEach(typeDescs, desc => {
        toposort.add(desc.name, (desc.base && (Array.isArray(desc.base) ? desc.base : [desc.base])) || []);
      });
      for (const typeDescName of toposort.sort().reverse()) {
        let typeDesc = typeDescs[typeDescName];
        if (typeDesc) {
          if (typeDesc.base) {
            let bases = Array.isArray(typeDesc.base) ? typeDesc.base : [typeDesc.base];
            var newTypeDesc = {};
            var props = [];

            bases.forEach(base => {
              const baseTypeDesc = typeDescs[base];
              if (!baseTypeDesc) {
                throw new Error(`Missing base type '${base}' for '${typeDesc.name}'`)
              }

              newTypeDesc = Object.assign(newTypeDesc, baseTypeDesc, typeDesc, { isAbstract: typeDesc.isAbstract });

              if (baseTypeDesc.properties && baseTypeDesc.properties.length) {
                props = props.concat(baseTypeDesc.properties);
              }
            });

            if (typeDesc.properties && typeDesc.properties.length) {
              props = props.concat(typeDesc.properties);
            }

            var newTypeDescProps = [];
            props.forEach(cur => {

              var index = this._.findIndex(newTypeDescProps, e => e.name === cur.name);

              if (index >= 0) {
                newTypeDescProps.splice(index, 1, Object.assign({}, newTypeDescProps[index], cur));
              } else {
                newTypeDescProps.push(cur);
              }
            });

            newTypeDesc.properties = newTypeDescProps;
            typeDescs[typeDescName] = newTypeDesc;
          }
        }
      }
    }

    _withoutAbstract(typeDesc) {
      return _.pickBy(typeDesc, typeDesc => !typeDesc.isAbstract);
    }

    _compileDescriptions(typeDict) {
      for (let typeName in typeDict) {
        if (typeDict.hasOwnProperty(typeName)) {
          let type = typeDict[typeName];
          if (type.description) {
            type.description = this._$interpolate(type.description);
          }
        }
      }
    }

    _getFallbackSubItemDesc(name) {
      return {
        isInvalid: true,
        name: name,
        icon: 'exclamation-triangle'
      };
    }

    updateVersion() {
      if (this.version === Number.MAX_SAFE_INTEGER) {
        this.version = 1;
      } else {
        this.version++;
      }
    }
  }

  angular.module('editorApp')
    .service('ProjectStore', ProjectStore);
})();
