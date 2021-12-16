import child_process from 'child_process';
import inquirer from 'inquirer';
import util from 'util';

// @ts-ignore causes bug only on compilation for some reason, removing that would make the deployment fail
import { deploy } from './bot.config';

enum Actions {
  DeployCommunicator = 'Deploy communicator',
  DeployBots = 'Deploy bots',
  ReloadBots = 'Reload bots',
  StopBots = 'Stop bots',
}

const exec = util.promisify(child_process.exec);

const runCommand = async (command: string) => {
  try {
    await exec(command);
  } catch (e: any) {
    console.error(e.stderr); // should contain code (exit code) and signal (that caused the termination).
    process.exit(0);
  }
};

const deployBots = async () => {
  for (const env in deploy) {
    console.log(`   -- Deploying bot ${env}`);
    await runCommand(`npx pm2 deploy ./bot.config.js ${env} update --force`);
  }
};

const runCommandOnBots = async (pm2Command: string) => {
  for (const env in deploy) {
    console.log(`   -- running command on bot ${env}`);
    await runCommand(`npx pm2 deploy ./bot.config.js ${env} exec "${pm2Command}"`);
  }
};

const init = async () => {
  console.log(
    // prettier-ignore
    `          __                   __                __
.--.--.--|  |--.-----.-----.  |  .---.-.--------|  |--.-----.
|  |  |  |     |  -__|     |  |  |  _  |        |  _  |  _  |
|________|__|__|_____|__|__|  |__|___._|__|__|__|_____|_____|

----------

`
  );
};

const askQuestions = () => {
  const questions = [
    {
      type: 'list',
      name: 'action',
      message: 'What service to deploy?',
      choices: [Actions.DeployBots, Actions.DeployCommunicator, Actions.ReloadBots, Actions.StopBots],
    },
  ];
  return inquirer.prompt(questions);
};

const executeAction = async (action: Actions) => {
  switch (action) {
    case Actions.DeployBots:
      console.log('- Running pre deploy checks');
      await runCommand('npm run tsc && npm run lint');

      console.log('- Running tests');
      await runCommand('npm run test');

      console.log('- Fetch gas estimates');
      await runCommand('USE_PROD_ENV_VARIABLES=true npm run fetch-gas-estimates');

      console.log('- Fetch loan amounts');
      await runCommand('USE_PROD_ENV_VARIABLES=true npm run fetch-loan-amounts');

      console.log('- Build bot');
      await runCommand('npm run bot:build');

      console.log('- Patch package.json version and push changes to git');
      await runCommand(
        `npm version patch --no-git-tag-version && PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]') && git commit -a -m "[BOT deployment] Publish version $PACKAGE_VERSION" --no-verify && git push origin master && git checkout develop && git rebase master && git push origin develop && git checkout master`
      );

      console.log('- Ready for deployment');
      await deployBots();
      break;

    case Actions.DeployCommunicator:
      console.log('- Running pre deploy checks');
      await runCommand('npm run tsc && npm run lint');

      console.log('- Running tests');
      await runCommand('npm run test');

      console.log('- Build communicator');
      await runCommand('npm run communicator:build');

      console.log('- Patch package.json version and push changes to git');
      await runCommand(
        `npm version patch --no-git-tag-version && PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]') && git commit -a -m "[COMMUNICATOR deployment] Publish version $PACKAGE_VERSION" --no-verify && git push origin master && git checkout develop && git rebase master && git push origin develop && git checkout master`
      );

      console.log('- Deploying communicator');
      await runCommand('npx pm2 deploy ./communicator.config.js prod update --force');

      console.log('- Reload bots');
      await runCommandOnBots('pm2 reload all');
      break;

    case Actions.ReloadBots:
      console.log('- Reload bots');
      await runCommandOnBots('pm2 reload all');
      break;

    case Actions.StopBots:
      console.log('- Stop bots');
      await runCommandOnBots('pm2 stop all');
      break;

    default:
      break;
  }
};

const run = async () => {
  // show script introduction
  init();

  // ask questions
  const { action } = await askQuestions();

  await executeAction(action);

  // show success message
  console.log(`Done!`);
};

run();
