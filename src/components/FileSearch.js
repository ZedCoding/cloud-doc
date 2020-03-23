import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import useKeyPress from "../hooks/useKeyPress";

const FileSearch = ({ title, onFileSearch }) => {
  const [inputActive, setInputActive] = useState(false);
  const [value, setValue] = useState("");
  const enterKeyPressed = useKeyPress(13);
  const escKeyPressed = useKeyPress(27);
  let node = useRef(null);

  const closeSearch = () => {
    setInputActive(false);
    setValue("");
    onFileSearch("");
  };

  useEffect(() => {
    if (!inputActive) return;
    if (enterKeyPressed) {
      onFileSearch(value);
    }
    if (escKeyPressed) {
      closeSearch();
    }
  }, [inputActive, enterKeyPressed, escKeyPressed]);
  useEffect(() => {
    if (inputActive) {
      node.current.focus();
    }
  }, [inputActive]);
  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
      {!inputActive && (
        <>
          <span>{title}</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setInputActive(true);
            }}
          >
            <FontAwesomeIcon title="搜索" icon={faSearch} size="lg" />
          </button>
        </>
      )}
      {inputActive && (
        <>
          <input
            placeholder="请输入文件名称"
            value={value}
            ref={node}
            onChange={e => {
              setValue(e.target.value);
            }}
            className="col-11"
          />
          <button
            type="button"
            className="icon-button col-1"
            onClick={closeSearch}
          >
            <FontAwesomeIcon title="关闭" icon={faTimes} size="lg" />
          </button>
        </>
      )}
    </div>
  );
};

FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired
};

FileSearch.defaultProps = {
  title: "我的云文档"
};

export default FileSearch;
