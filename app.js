const { exec } = require('child_process');
const { spawn } = require('child_process');
const regex = /@(.+?)\s/;

exec('npm list -g owl-bt', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  const match = stdout.match(regex);
  if (match) {
    var current_version = match[1].trim();
    console.log('The owl-bt version: ' + current_version);
  } 
  else{
    console.log("You haven't installed the owl-bt library yet.")
    var current_version = '0.0.0'
  }
  
  // 读取当前版本号，如果当前版本低就进行升级
  const packageJson = require('./package.json');
  const new_version = packageJson.version;
  if(new_version.toString() > current_version.toString()){
    console.log('The new version is %s, start to update!', new_version);
    exec('sudo npm install -g --ignore-scripts', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
        console.log('Update success！')
        // 安装新版本完成后打开行为树编辑器
        openEditor();
    });
  }
  else{
    // 直接打开行为树编辑器
    openEditor();
  }

});


function openEditor(){
    const projectJson = require('./project.json');
    if(projectJson.treePath === ""){
        const templateTreePath = './bin/templates/tree.json'
        exec(`owlbt o ${templateTreePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
        });
    }
    else{
        exec(`owlbt o ${projectJson.treePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
              }
        });
    }
}