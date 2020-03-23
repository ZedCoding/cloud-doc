import React, { useState } from "react";
import SimpleMDE from "react-simplemde-editor";
import { v4 as uuidv4 } from "uuid";
import { faPlus, faFileImport } from "@fortawesome/free-solid-svg-icons";
import { flattenArr, objToArr, format, fileHelper } from "./utils";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "easymde/dist/easymde.min.css";

import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";
import BottomBtn from "./components/BottomBtn";
import TabList from "./components/TabList";

import useIpcRenderer from './hooks/useIpcRenderer'

// require node.js modules
const { join, basename, extname, dirname } = window.require("path");
const { remote } = window.require("electron");
const Store = window.require("electron-store");
const fileStore = new Store({ name: "Files Data" });
const settingsStore = new Store({ name: "Settings" })

// fileStore.delete("files");

// save file to store
const saveFilesToStore = files => {
  // we don't have to store any info in file system,eg: isNew, body, etc
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createAt } = file;
    result[id] = {
      id,
      path,
      title,
      createAt
    };
    return result;
  }, {});
  fileStore.set("files", filesStoreObj);
};

const App = () => {
  const [files, setFiles] = useState(fileStore.get("files") || {});
  const [activeFileID, setActiveFileID] = useState("");
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);
  const [searchedFiles, setSearchedFiles] = useState([]);
  const filesArr = objToArr(files);
  const savedLocation = settingsStore.get('savedFileLocation') || remote.app.getPath("desktop");
  console.log(savedLocation);
  const openedFiles = openedFileIDs.map(openedID => {
    return files[openedID];
  });
  const activeFile = files[activeFileID];
  const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArr;

  console.log("rerender", filesArr);

  // handle file click
  const fileClick = fileID => {
    // set current active file
    setActiveFileID(fileID);
    const currentFile = files[fileID];
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true };
        setFiles({ ...files, [fileID]: newFile });
      });
    }
    // if openedFiles don't have the current fileID
    // then add new fileID to openedFiles
    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID]);
    }
  };

  // handle file search
  const fileSearch = keyword => {
    // filter out the new files based on the keyword
    if(!keyword) return;
    const newFiles =
      filesArr.length && filesArr.filter(file => file.title.includes(keyword));
    setSearchedFiles(newFiles);
  };

  // handle file delete
  const deleteFile = id => {
    const {
      [id]: { isNew },
      ...afterDelete
    } = files;
    if (isNew) {
      setFiles(afterDelete);
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        setFiles(afterDelete);
        saveFilesToStore(afterDelete);
        // close the tab if opened
        tabClose(id);
      });
    }
  };

  // handle file update
  const updateFile = (id, title, isNew) => {
    const newPath = isNew
      ? join(savedLocation, `${title}.md`)
      : join(dirname(files[id].path), `${title}.md`);
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath };
    const newFiles = { ...files, [id]: modifiedFile };
    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    } else {
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles);
        saveFilesToStore(newFiles);
      });
    }
  };

  // handle tab click
  const tabClick = fileID => {
    // set current active file
    setActiveFileID(fileID);
  };

  // handle tab close
  const tabClose = id => {
    // remove the current clicked id from openedFileIDs
    const restTabIDs = openedFileIDs.filter(fileId => fileId !== id);
    setOpenedFileIDs(restTabIDs);
    // judge if restTabIDs indluces the activeFileID
    const hasActiveID = restTabIDs.includes(activeFileID);
    // set the active to the first opened tab if still tabs left
    if (restTabIDs.length > 0 && !hasActiveID) {
      setActiveFileID(openedFileIDs[0]);
    } else if (restTabIDs.length === 0) {
      setActiveFileID("");
    }
  };

  // handle MDE change
  const fileChange = (id, value) => {
    if(value === files[id].body) return;
    const newFile = { ...files[id], body: value };
    setFiles({ ...files, [id]: newFile });
    // update unsavedIDs
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id]);
    }
  };

  // handle create new file
  const createNewFile = () => {
    const newId = uuidv4();
    const newFile = {
      id: newId,
      title: "",
      body: "## 请输出 Markdown",
      createAt: format(new Date(), "yyyy-MM-dd hh:mm:ss"),
      isNew: true
    };
    setFiles({ ...files, [newId]: newFile });
  };

  // save current file
  const saveCurrentFile = () => {
    if(!activeFile) return;
    fileHelper
      .writeFile(join(savedLocation, `${activeFile.title}.md`), activeFile.body)
      .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id));
      });
  };

  // import files
  const importFiles = () => {
    remote.dialog
      .showOpenDialog({
        title: "选择导入的 Markdown 文件",
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "Markdown Files", extensions: ["md"] }]
      })
      .then(({ canceled, filePaths }) => {
        if (!canceled) {
          // filter out the path we already have in electron store
          const filteredPaths = filePaths.filter(path => {
            const alreadyAdded = Object.values(files).find(file => {
              return file.path === path;
            });
            return !alreadyAdded;
          });
          // extend the path array to an array containes files info
          // [{id: '1', path: '', title: ''}, {}]
          const importFilesArr = filteredPaths.map(path => {
            return {
              id: uuidv4(),
              title: basename(path, extname(path)),
              path
            };
          });
          // get the new files object in flattenArr
          const newFiles = { ...files, ...flattenArr(importFilesArr) };
          // setState and update electron store
          setFiles(newFiles);
          saveFilesToStore(newFiles);
          if (importFilesArr.length > 0) {
            remote.dialog.showMessageBox({
              type: "info",
              message: `成功导入了${importFilesArr.length}个文件`
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useIpcRenderer({
    'create-new-file': createNewFile,
    'save-edit-file': saveCurrentFile,
    'search-file': fileSearch,
    'import-file': importFiles
  })

  return (
    <div className="App container-fluid px-0">
      <div className="row" style={{ width: "100%" }}>
        <div className="col-4 bg-light left-pannel">
          <FileSearch title="My Document" onFileSearch={fileSearch} />
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onSaveEdit={updateFile}
            onFileDelete={deleteFile}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                icon={faPlus}
                colorClass="btn-primary"
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                icon={faFileImport}
                colorClass="btn-success"
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-8 right-pannel">
          {!activeFile && (
            <div className="start-page">选择或创建新的 MarkDown 文档</div>
          )}
          {activeFile && (
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE
                key={activeFile.id}
                value={activeFile.body}
                options={{
                  minHeight: "515px"
                }}
                onChange={value => {
                  fileChange(activeFile.id, value);
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
