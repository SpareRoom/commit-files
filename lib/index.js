const gitClient = require("cmd-executor").git;
const githubAction = require('@actions/core');

const commitFiles = async () => {
  console.log(await hasStagedChanges());
  if (hasActiveChanges()) {
    if (!hasStagedChanges()) await gitClient.add('.') // Add all unstaged files if the changes aren't staged
    if (hasStagedChanges()) {
      await gitClient.commit('-m test')
      console.log(await gitClient.status())
      await gitClient.push('-u')
    } else {
      await githubAction.setOutput(
        "changes_commited",
        "No changes to be commited"
      );
      return 0;
    }
  } else {
    await githubAction.setOutput(
      "changes_commited",
      "No changes to be commited"
    );
    return 0;
  }
}

const hasStagedChanges = async () => {
  const stagedChanges = await gitClient["diff"](
    "--quiet --ignore-submodules --staged HEAD 2>/dev/null; echo $?"
  );

  return stagedChanges || 0;
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
