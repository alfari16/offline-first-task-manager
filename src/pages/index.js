import React, { useEffect, Fragment, useState } from "react"
import Database from "../modules/db"
import moment from "moment"

let db
let subscription = () => {}
const IndexPage = () => {
  const [isSync, setSync] = useState(true)
  const [lastSync, setLastSync] = useState("-")
  const [tasks, setTasks] = useState([])
  const [triggerrer, setTriggerrer] = useState(Date.now())
  const [inputTask, setInputTask] = useState("")
  const [inputTag, setInputTag] = useState("")
  const [editId, setEditId] = useState("")

  useEffect(() => {
    const internetChangeHandler = () => {}
    window.onoffline = () => {
      console.log("offline bro")
    }
    window.ononline = () => {
      console.log("online bro")
    }
    return () => {
      window.onoffline = null
      window.ononline = null
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!db || !db.isInitialized) {
        db = new Database()
        await db.initialize()
      }
      setLastSync(moment(db.dataMeta.tsUpload).fromNow())
      subscription = db.subscribe(() => setTriggerrer(Date.now()))
      console.log(db.data)
      setTasks(db.data)
      setSync(false)
    })()
    return () => {
      subscription()
    }
  }, [triggerrer])

  const addTask = async () => {
    if (!inputTask) return
    const payload = {
      createdAt: moment().toISOString(),
      tags: inputTag.split(/[,\s]/gm).filter(el => el),
      content: inputTask,
      isCompleted: false,
    }
    await db.addItem(payload)
    await syncData()
    setInputTask("")
    setInputTag("")
  }

  const editTask = async (id, payload) => {
    const { createdAt, tags, content, isCompleted } = tasks.find(
      el => el._id === id
    )
    const newValue = { createdAt, tags, content, isCompleted, ...payload }
    console.log("update", id, newValue)
    await db.editItem(id, newValue)
    await syncData()
  }

  const syncData = async () => {
    setSync(true)
    try {
      await db.upload()
    } catch (error) {}
    setSync(false)
  }

  const deleteTask = async id => {
    await db.deleteItem(id)
    await syncData()
  }

  const saveChanges = async () => {
    if (!editId) return
    const content = document.querySelector(`[name="content-${editId}"]`).value
    const tags = document
      .querySelector(`[name="tags-${editId}"]`)
      .value.split(/[,\s]/gm)
      .filter(el => el)
    await editTask(editId, { content, tags })
    setEditId("")
  }

  const taskMapping = [
    ...tasks.filter(el => !el.isCompleted),
    ...tasks.filter(el => el.isCompleted),
  ].map(el => ({
    ...el,
    isOnEditMode: el._id === editId,
  }))

  return (
    <div className="outer-wrapper">
      <div className="container d-flex flex-column">
        <div className="header">
          <div className="d-flex align-items-center">
            <h1 className="flex-grow">Task Manager</h1>
            <div className="d-flex align-items-center">
              <small>Last sync: {lastSync}</small>
              <button
                className="btn sync-btn"
                onClick={syncData}
                title="Sync Data"
              >
                <i
                  className={["fa", "fa-sync", isSync && "fa-spin"].join(" ")}
                ></i>
              </button>
            </div>
          </div>
        </div>
        <div className="body flex-grow">
          <div className="list-wrapper">
            {taskMapping.map(
              (
                {
                  _id: id,
                  content,
                  isCompleted,
                  createdAt,
                  tags,
                  isOnEditMode,
                },
                index
              ) => (
                <div
                  key={index}
                  className="single-list d-flex justify-content-between align-items-center"
                >
                  <div className="left d-flex align-items-center flex-grow">
                    <div
                      className="checkbox d-flex align-items-center justify-content-center"
                      onClick={() =>
                        editTask(id, { isCompleted: !isCompleted })
                      }
                      title={`Click to ${
                        isCompleted ? "uncomplete" : "complete"
                      }`}
                    >
                      {isCompleted && <i className="fa fa-check"></i>}
                    </div>
                    <div className="task-content flex-grow">
                      {isOnEditMode ? (
                        <input
                          type="text"
                          placeholder="Task"
                          className="form-control title"
                          name={`content-${id}`}
                          defaultValue={content}
                        />
                      ) : (
                        <p
                          className={[
                            "title",
                            isCompleted && "isCompleted",
                          ].join(" ")}
                        >
                          {content}
                        </p>
                      )}
                      {!isOnEditMode && (
                        <p className="date">
                          {moment(createdAt).format("YYYY-MM-DD HH:mm")}
                        </p>
                      )}
                      {isOnEditMode ? (
                        <input
                          type="text"
                          placeholder="Tags"
                          className="form-control tags condensed"
                          name={`tags-${id}`}
                          defaultValue={tags.join(", ")}
                        />
                      ) : (
                        !!tags.length && (
                          <small className="tags">
                            tag:{" "}
                            {tags.map((el, idx) => (
                              <Fragment key={el + idx}>
                                <a href="javascript:void()">{el}</a>
                                {idx !== tags.length - 1 && <span>, </span>}
                              </Fragment>
                            ))}
                          </small>
                        )
                      )}
                    </div>
                  </div>
                  <div className="right">
                    {isOnEditMode ? (
                      <button onClick={saveChanges} className="btn btn-blue">
                        Save changes
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditId(id)}
                        className="btn btn-blue"
                      >
                        Edit
                      </button>
                    )}
                    {isOnEditMode ? (
                      <button
                        onClick={() => setEditId("")}
                        className="btn btn-red"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteTask(id)}
                        className="btn btn-red"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
        <div className="footer d-flex">
          <input
            type="text"
            className="form-control"
            style={{ flex: 2 }}
            placeholder="Type a task"
            onKeyPress={e => (e.which === 13 ? addTask() : true)}
            onChange={e => setInputTask(e.target.value)}
            value={inputTask}
          />
          <input
            type="text"
            className="form-control flex-grow"
            style={{ borderRadius: 0 }}
            placeholder="Tags, i.e: math, physics"
            onKeyPress={e => (e.which === 13 ? addTask() : true)}
            onChange={e => setInputTag(e.target.value)}
            value={inputTag}
          />
          <button className="btn" onClick={addTask}>
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexPage
