import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import PropTypes from "prop-types";
import useKeyPress from "../hooks/useKeyPress";
import useContextMenu from "../hooks/useContextMenu";
import { getParentNode } from "../utils/helper";

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {
  const [editStatus, setEditStatus] = useState(false);
  const [value, setValue] = useState("");
  const enterKeyPressed = useKeyPress(13);
  const escKeyPressed = useKeyPress(27);
  const node = useRef(null);

  const closeSearch = editItem => {
    setEditStatus(false);
    setValue("");
    // if we are editing a newly created file, we should delete it when pressing esc
    if (editItem.isNew) {
      onFileDelete(editItem.id);
    }
  };

  const clickedItem = useContextMenu(
    [
      {
        label: "打开",
        click: () => {
          const parentElement = getParentNode(clickedItem.current, "file-item");
          if (parentElement) {
            onFileClick(parentElement.dataset.id);
          }
        }
      },
      {
        label: "重命名",
        click: () => {
          const parentElement = getParentNode(clickedItem.current, "file-item");
          if (parentElement) {
            const { id, title } = parentElement.dataset;
            setEditStatus(id);
            setValue(title);
          }
        }
      },
      {
        label: "删除",
        click: () => {
          const parentElement = getParentNode(clickedItem.current, "file-item");
          if (parentElement) {
            onFileDelete(parentElement.dataset.id);
          }
        }
      }
    ],
    ".file-list",
    [files]
  );

  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus);
    if (enterKeyPressed && editStatus && value.trim() !== "") {
      onSaveEdit(editItem.id, value, editItem.isNew);
      setEditStatus(false);
      setValue("");
    }
    if (escKeyPressed && editStatus) {
      closeSearch(editItem);
    }
  }, [editStatus, value, onSaveEdit, files, enterKeyPressed, escKeyPressed]);

  useEffect(() => {
    const newFile = files.find(file => file.isNew === true);
    if (newFile) {
      setEditStatus(newFile.id);
      setValue(newFile.title);
    }
  }, [files]);

  useEffect(() => {
    if (editStatus) {
      node.current.focus();
    }
  }, [editStatus]);

  return (
    <ul className="list-group list-group-flush file-list mb-3">
      {files.map(file => (
        <li
          key={file.id}
          className="list-group-item bg-light row d-flex align-items-center flex-nowrap file-item mx-0"
          data-id={file.id}
          data-title={file.title}
        >
          {file.id !== editStatus && !file.isNew && (
            <>
              <span className="col-2">
                <FontAwesomeIcon title="markdown" icon={faMarkdown} size="lg" />
              </span>
              <span
                className="col-10 c-link"
                onClick={() => {
                  onFileClick(file.id);
                }}
              >
                {file.title}
              </span>
              {/* <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  setEditStatus(file.id);
                  setValue(file.title);
                }}
              >
                <FontAwesomeIcon title="编辑" icon={faEdit} size="lg" />
              </button>
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  onFileDelete(file.id);
                }}
              >
                <FontAwesomeIcon title="删除" icon={faTrash} size="lg" />
              </button> */}
            </>
          )}
          {(file.id === editStatus || file.isNew) && (
            <>
              <input
                placeholder="请输入文件名称"
                value={value}
                onChange={e => {
                  setValue(e.target.value);
                }}
                className="col-10"
                ref={node}
              />
              <button
                type="button"
                className="icon-button col-2"
                onClick={() => {
                  closeSearch(file);
                }}
              >
                <FontAwesomeIcon title="关闭" icon={faTimes} size="lg" />
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

FileList.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired
};

export default FileList;
