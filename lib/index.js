const gitClient = require("cmd-executor").git;
const githubAction = require('@actions/core');

const commitFiles = async () => {
  const activeChanges = await hasActiveChanges();
  const stagedChanges = await hasActiveChanges(1);
  if (activeChanges) {
    if (!(await hasActiveChanges(1))) {
      console.log("hit");
      await gitClient.add("-A"); // Add all unstaged files if the changes aren't staged
    }
    if (await hasActiveChanges(1)) {
      await gitClient.commit("-m test");
      console.log(await gitClient.status());
      await gitClient.push("-u");
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

const hasActiveChanges = async (staged = 0) => {
  let commandArguments = '--quiet --ignore-submodules HEAD 2>/dev/null; echo $?';

  if (staged) commandArguments = "--cached " + commandArguments;
  const changes = await gitClient["diff"](commandArguments);

  return changes.trim() != 1 ? false : true
}

module.exports = {
  commitFiles
}
