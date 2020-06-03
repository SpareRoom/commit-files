const gitClient = require("cmd-executor").git;
const githubAction = require('@actions/core');

const commitFiles = async () => {
  if (hasActiveChanges()) {
    await gitClient.add('.') // Add all unstaged files
    await gitClient.commit
  } else {
    await githubAction.setOutput("changes_commited", "No changes to be commited");
    return 0;
  }
}

const hasActiveChanges = async () => {
  const changes = await gitClient["diff"](
    "--quiet --ignore-submodules HEAD 2>/dev/null; echo $?"
  );

  return changes.trim() || 0;
}

module.exports = {
  commitFiles
}
