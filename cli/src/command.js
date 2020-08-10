import { program } from 'commander';
import { registerPrompt, prompt } from 'inquirer';
import autoCompletePrompt from 'inquirer-autocomplete-prompt';
import moment from 'moment';
import Database from './db';
import { drawTable } from './writer';

registerPrompt('autocomplete', autoCompletePrompt);

program.version('0.0.1').description('An Offline-First Task Manager');

program
  .command('show-task')
  .alias('s')
  .description('Show all task')
  .option('--incomplete', 'Show incomplete task')
  .option('--completed', 'Show completed task')
  .action(async (cmd) => {
    await Database.initialize();
    const data = Database.allTask(
      cmd.incomplete ? 'incomplete' : cmd.completed ? 'completed' : ''
    ).map((task) => {
      const { createdAt, content, tags, isCompleted } = task;
      return {
        createdAt,
        content,
        tags,
        isCompleted,
        isSync: Database.checkIsUploaded(task),
      };
    });
    const col = [16, 32, 20, 11, 6];
    console.log(drawTable(data, col));
    console.log('Last sync: ' + moment(Database.dataMeta.tsUpload).fromNow());
    await Database.deinitialize();
  });

program
  .command('mark-complete')
  .alias('m')
  .description('Complete a task')
  .action(async () => {
    await Database.initialize();
    const tasks = Database.allTask('incomplete');
    if (!tasks.length) {
      await Database.deinitialize();
      return console.log("You don't have any incomplete task.");
    }
    let { taskContent } = await prompt([
      {
        type: 'autocomplete',
        name: 'taskContent',
        message: 'Select a task to complete',
        source: function (answersSoFar, input) {
          return new Promise(async (resolve) => {
            resolve(
              tasks
                .map((el) =>
                  el.tags.length
                    ? `${el.content} | ${el.tags.join(', ')}`
                    : el.content
                )
                .filter((el) => el.includes(input || ''))
            );
          });
        },
      },
    ]);
    taskContent = taskContent.split(' | ')[0];
    await Database.markComplete(taskContent);
    await Database.deinitialize();
    console.log(`Task "${taskContent}" completed`);
  });

program
  .command('sync')
  .alias('sy')
  .description('Sync local data to server')
  .action(async () => {
    await Database.initialize();
    const unUploadedCount = Database.countUnuploadeds();
    try {
      await Database.upload();
      console.log(`${unUploadedCount} task(s) synchronized`);
    } catch (err) {
      console.log('Network is offline. Please check your internet connection.');
    }
    console.log(Database.dataMeta.tsUpload);
    await Database.deinitialize();
  });

program.parse(process.argv);
