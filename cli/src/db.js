import PouchyStore from './pouchy-store/PouchyStore';

const DB_NAME = 'tasks_manager';
const DB_ENDPOINT = 'http://13.250.43.79:5984';
const DB_USER = 'admin';
const DB_PASSWORD = 'iniadmin';

export class Database extends PouchyStore {
  constructor() {
    super();
  }
  get name() {
    return DB_NAME;
  }

  get urlRemote() {
    return DB_ENDPOINT;
  }

  get optionsRemote() {
    return {
      auth: {
        username: DB_USER,
        password: DB_PASSWORD,
      },
    };
  }

  allTask(opt) {
    const completed = this.data.filter((el) => el.isCompleted);
    const incomplete = this.data.filter((el) => !el.isCompleted);
    const dataOpt = {
      completed,
      incomplete,
      default: [...incomplete, ...completed],
    };
    return dataOpt[opt] || dataOpt['default'];
  }

  getTask(id) {
    return this.allTask.find((el) => el._id === id);
  }

  lastSync() {
    return this.dataMeta.tsUpload;
  }

  async syncData() {
    clearTimeout(this.timeout);
    try {
      await this.upload();
    } catch (error) {
      this.timeout = setTimeout(async () => {
        await this.syncData();
      }, 3000);
    }
  }

  async markComplete(content) {
    const { _id } = this.allTask('incomplete').find(
      (el) => el.content === content
    );
    await this.editItem(_id, { isCompleted: true });
    this.syncData();
  }
}

export class DatabaseHelper {
  constructor() {
    this.dbInstance = new Database();
    this.timeout = null;
  }

  async init() {
    await this.dbInstance.initialize();
  }

  async close() {
    await this.dbInstance.deinitialize();
  }
}

export default new Database();
