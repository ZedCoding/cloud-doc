import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import PropTypes from "prop-types";
import "./style/TabList.scss";

const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
  return (
    <ul className="nav nav-pills tablist-component">
      {files.map(file => {
        const withUnsavedMark = unsaveIds.includes(file.id);
        const fClassNames = classNames({
          "nav-link": true,
          "active": file.id === activeId,
          "withUnsaved": withUnsavedMark
        });
        return (
          <li key={file.id} className="nav-item">
            <a
              href="#"
              className={fClassNames}
              onClick={e => {
                e.preventDefault();
                onTabClick(file.id);
              }}
            >
              {file.title}
              <span
                className="ml-2 close-icon"
                onClick={e => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
              >
                <FontAwesomeIcon title="关闭" icon={faTimes} />
              </span>
              {withUnsavedMark && (
                <span className="rounded-circle ml-2 unsaved-icon" />
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  unsaveIds: PropTypes.array,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func
};

TabList.defaultProps = {
  unsaveIds: []
};

export default TabList;
