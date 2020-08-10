import { program } from 'commander';
import { registerPrompt, prompt } from 'inquirer';
import autoCompletePrompt from 'inquirer-autocomplete-prompt';
import moment from 'moment';
import Database from './db';
import { addSpace } from './writer';

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

    console.log('-'.repeat(col.reduce((prev, curr) => prev + curr + 3, 1)));
    console.log(
      Object.keys(data[0]).reduce((prev, el, index) => {
        return `${prev} ${addSpace(el, col[index])} |`;
      }, '|')
    );
    console.log('-'.repeat(col.reduce((prev, curr) => prev + curr + 3, 1)));
    data.forEach(({ createdAt, content, tags, isCompleted, isSync }) => {
      console.log(
        `| ${addSpace(
          moment(createdAt).format('YYYY-MM-DD HH:mm'),
          col[0]
        )} | ${addSpace(content, col[1])} | ${addSpace(
          tags.join(', '),
          col[2]
        )} | ${addSpace(isCompleted.toString(), col[3])} | ${addSpace(
          isSync.toString(),
          col[4]
        )} |`
      );
    });
    console.log('-'.repeat(col.reduce((prev, curr) => prev + curr + 3, 1)));
    await Database.deinitialize();
  });

program
  .command('mark-complete')
  .alias('m')
  .description('Complete a task')
  .action(async () => {
    await Database.initialize();
    const tasks = Database.allTask('incomplete');
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
    return 0;
  });

program
  .command('sync')
  .alias('sy')
  .description('Sync local data to server')
  .action(async () => {
    await Database.initialize();
    try {
      const unUploadedCount = Database.countUnuploadeds();
      await Database.upload();
      console.log(`${unUploadedCount} task(s) synchronized`);
    } catch (error) {
      console.log(
        `Network is trouble. Sync will automatically triggerred on the next connection`
      );
    }
    await Database.deinitialize();
    return 0;
  });

program.parse(process.argv);
