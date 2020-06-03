const simpleGit = require('simple-git')();

const commitFiles = async () => {
  console.log(simpleGit.status())
}

module.exports = {
  commitFiles
}
