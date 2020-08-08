import React, { useEffect, Fragment, useState, useRef } from "react"
import Database from "../modules/db"
import moment from "moment"

let db,
  timeout,
  subscription = () => {}
const IndexPage = () => {
  const [isSync, setSync] = useState(true)
  const [unUploadeds, setUnUploadeds] = useState(0)
  const [lastSync, setLastSync] = useState("-")
  const [tasks, setTasks] = useState([])
  const [triggerrer, setTriggerrer] = useState(Date.now())
  const [inputTask, setInputTask] = useState("")
  const [inputTag, setInputTag] = useState("")
  const [editId, setEditId] = useState("")
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    let interval = setInterval(() => {
      console.log("interval update")
      setCounter(counter => counter + 1)
    }, 1000 * 60)
    return () => {
      clearInterval(interval)
    }
  }, [counter])

  useEffect(() => {
    ;(async () => {
      if (!db || !db.isInitialized) {
        db = new Database()
        await db.initialize()
        syncData()
      }
      setLastSync(moment(db.dataMeta.tsUpload).fromNow())
      setUnUploadeds(db.countUnuploadeds())
      subscription = db.subscribe(() => setTriggerrer(Date.now()))
      console.log(db.data)
      setTasks(db.data)
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
    syncData()
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
    syncData()
  }

  const syncData = async () => {
    clearTimeout(timeout)
    setSync(true)
    try {
      await db.upload()
    } catch (error) {
      console.log("error", error)
      timeout = setTimeout(() => {
        syncData()
      }, 3000)
    }
    setSync(false)
  }

  const deleteTask = async id => {
    await db.deleteItem(id)
    syncData()
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

  return (
    <>
      <div className="outer-wrapper">
        <div className="container d-flex flex-column">
          <Header
            lastSync={lastSync}
            syncData={syncData}
            isSync={isSync}
            counter={counter}
          />
          <Body
            tasks={tasks}
            editTask={editTask}
            saveChanges={saveChanges}
            editId={editId}
            setEditId={setEditId}
            deleteTask={deleteTask}
          />
          <Footer
            addTask={addTask}
            inputTask={inputTask}
            inputTag={inputTag}
            setInputTask={setInputTask}
            setInputTag={setInputTag}
          />
        </div>
      </div>
      <FlagOnline syncData={syncData} unUploadeds={unUploadeds} />
    </>
  )
}

const Header = ({ lastSync, syncData, isSync, counter }) => (
  <div className="header">
    <div className="d-flex align-items-center">
      <h1 className="flex-grow">Task Manager</h1>
      <div className="d-flex align-items-center">
        <small>Last sync: {lastSync}</small>
        <button className="btn sync-btn" onClick={syncData} title="Sync Data">
          <i className={["fa", "fa-sync", isSync && "fa-spin"].join(" ")}></i>
        </button>
      </div>
    </div>
  </div>
)

const Body = ({
  tasks,
  editTask,
  saveChanges,
  setEditId,
  deleteTask,
  editId,
}) => {
  const [search, setSearch] = useState("")
  const [tag, setTag] = useState("")

  useEffect(() => {
    const splitArray = window.location.href.toString().split("#")
    const localTag = splitArray[splitArray.length - 1]
    if (localTag && splitArray.length === 2) setTag(localTag)
    console.log("tag", tag, localTag)
  })

  const clearFilter = () => {
    setSearch("")
    setTag("")
    window.history.pushState({}, "", "/")
  }

  const taskMapping = [
    ...tasks.filter(el => !el.isCompleted),
    ...tasks.filter(el => el.isCompleted),
  ]
    .map(el => ({
      ...el,
      isOnEditMode: el._id === editId,
    }))
    .filter(el => (!!tag ? el.tags.includes(tag) : true))
    .filter(el => el.content.includes(search))

  return (
    <div className="body flex-grow">
      <div className="d-flex align-items-center search">
        <div className="form-control condensed d-flex align-items-center flex-grow">
          <input
            type="text"
            className="flex-grow"
            placeholder="Search task"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {tag && (
            <span className="tag-display">
              in tag "<strong>{tag}</strong>"
            </span>
          )}
        </div>
        <i
          onClick={clearFilter}
          className="fa fa-times"
          title="Clear filter"
        ></i>
      </div>
      <div className="list-wrapper">
        {taskMapping.map(
          (
            { _id: id, content, isCompleted, createdAt, tags, isOnEditMode },
            index
          ) => (
            <div
              key={index}
              className="single-list d-flex justify-content-between align-items-center"
            >
              <div className="left d-flex align-items-center flex-grow">
                <div
                  className="checkbox d-flex align-items-center justify-content-center"
                  onClick={() => editTask(id, { isCompleted: !isCompleted })}
                  title={`Click to ${isCompleted ? "uncomplete" : "complete"}`}
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
                      className={["title", isCompleted && "isCompleted"].join(
                        " "
                      )}
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
                            <a href={`#${el}`}>{el}</a>
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
                  <button onClick={() => setEditId("")} className="btn btn-red">
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
  )
}

const Footer = ({
  addTask,
  inputTask,
  inputTag,
  setInputTask,
  setInputTag,
}) => (
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
)

const FlagOnline = ({ syncData, unUploadeds }) => {
  const [onlineStatus, setOnlineStatus] = useState(
    navigator.onLine ? "idle" : "offline"
  )

  useEffect(() => {
    const internetChangeHandler = async () => {
      console.log("internet handler triggerred", navigator.onLine)
      setOnlineStatus(navigator.onLine ? "online" : "offline")
      if (navigator.onLine) {
        syncData()
        setTimeout(() => {
          setOnlineStatus("idle")
        }, 3000)
      }
    }
    window.onoffline = internetChangeHandler
    window.ononline = internetChangeHandler
    console.log(onlineStatus, "onlinestatus")
    return () => {
      window.onoffline = null
      window.ononline = null
    }
  })

  if (onlineStatus === "idle") return null

  if (onlineStatus === "online")
    return (
      <div className="flag-online bg-green">
        Connection is reset. Synchronizing local data.
      </div>
    )

  return (
    <div className="flag-online bg-red">
      Lost connection. {unUploadeds} task(s) have not yet been synchronized.
    </div>
  )
}

export default IndexPage
