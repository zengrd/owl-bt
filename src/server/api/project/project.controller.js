'use strict';
const fs = require('fs');
const path = require('path');
const project = require('../../components/project');
const projectJson = require('../../../../project.json');

exports.index = function(req, res, next) {
  let treePath = req.query.path;
  if (!treePath) {
    res.status(400).send('Missing path');
    return;
  }
  if (!path.isAbsolute(treePath)) {
    res.status(400).send('Path must be absolute');
    return;
  }

  project.getProject(treePath)
    .then(prj => {
      if (!prj) {
        res.status(404).send('No project found');
      } else {
        res.contentType('application/json').send(prj.content)
      }
    })
    .catch(err => {
      next(err);
    });

};



function traverseFolder(folderPath) {
  const result = [];
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const extname = path.extname(filePath);

    if (!isDirectory) {
      if (extname !== '.json')continue;
    }

    result.push({
      path: filePath,
      isDirectory: isDirectory,
    });
  }

  return result;
}

exports.fileList = function(req, res, next) {
  let projectDir = req.query.path;
  if (projectDir){
    let result = traverseFolder(projectDir);
    res.contentType('application/json').send(result);
  }
  else if(projectJson.projectDir){
    let result = traverseFolder(projectJson.projectDir);
    res.contentType('application/json').send(result);
  }
  else{
    let default_dir = path.join(__dirname, '../../../../bin/templates');
    let result = traverseFolder(default_dir);
    res.contentType('application/json').send(result);
  }
  return;
};

/*
暂时不需要，有需要后续再加

exports.parentFileList = function(req, res, next) {
  let projectDir = req.query.path;
  if (projectDir){
    parentDir = project.getParentPath(projectDir)
    let result = traverseFolder(parentDir);
    res.contentType('application/json').send(result);
  }
  else if(projectJson.projectDir){
    let result = traverseFolder(projectJson.projectDir);
    res.contentType('application/json').send(result);
  }
  else{
    default_dir = path.join(__dirname, '../../../bin/templates');
    let result = traverseFolder(default_dir);
    res.contentType('application/json').send(result);
  }
  return
};
*/