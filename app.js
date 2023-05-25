const path = require('path')
const serverRunner = require('./bin/serverRunner');
const projectJson = require('./project.json');
openEditor();

function openEditor(){
    if(projectJson.treePath === ""){
        const templateTreePath = path.join(__dirname, 'bin/templates/tree.json');
        serverRunner.openTree(templateTreePath);
    }
    else{
        serverRunner.openTree(projectJson.treePath);
    }
}