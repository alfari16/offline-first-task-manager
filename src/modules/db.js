import PouchyStore from "pouchy-store"

const DB_NAME = "tasks_manager"
const DB_ENDPOINT = "http://13.250.43.79:5984"
const DB_USER = "admin"
const DB_PASSWORD = "iniadmin"

class Database extends PouchyStore {
  get name() {
    return DB_NAME
  }

  get urlRemote() {
    return DB_ENDPOINT
  }

  get optionsRemote() {
    return {
      auth: {
        username: DB_USER,
        password: DB_PASSWORD,
      },
    }
  }
}

export default Database
