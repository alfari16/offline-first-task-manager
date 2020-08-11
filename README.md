# Offline-first Task Manager

Made with powerful library [pouchy-store](https://choosealicense.com/licenses/mit/)

## Installation

#### Webapp

```bash
yarn install
yarn develop
#Now the app accessible on http://localhost:8000
```

### CLI

```bash
yarn install
yarn babel-node ./src/command.js <command> <option>
```

```
Usage

Options:
  -V, --version          output the version number
  -h, --help             display help for command

Commands:
  show-task|s [options]  Show all task
  mark-complete|m        Complete a task
  sync|sy                Sync local data to server
  help [command]         display help for command
```

Note: Sorry I haven't implemented Docker on this project because my machine has a problem. If you don't mind, give me an extension of time to implement it. Thank you
