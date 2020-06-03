const simpleGit = require('simple-git')();

const commitFiles = async () => {
  console.log(simpleGit.status())

  core.setOutput("changes_commited", simpleGit.status());
}

module.exports = {
  commitFiles
}
