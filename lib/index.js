const gitClient = require("cmd-executor").git;
const githubAction = require('@actions/core');

const commitFiles = async () => {
  const activeChanges = await hasActiveChanges();
  const commitMessage = await core.getInput("commit_message");
  const gitBranch = await core.getInput("branch");

  if (gitBranch) await gitClient.checkout(gitBranch);

  if (activeChanges) {
    if (!(await hasActiveChanges(1))) await gitClient.add("-A"); // Add all unstaged files if the changes aren't staged

    await gitClient.commit(`-m ${commitMessage}`);
    await gitClient.push("-u");
  } else {
    await githubAction.setOutput(
      "changes_commited",
      "No changes to be commited"
    );
    return false;
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
