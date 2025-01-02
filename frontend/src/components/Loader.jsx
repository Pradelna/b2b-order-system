import React from "react";

const Loader = ({ progress }) => {
  return (
    <div className="loader-wrapper">
      <div className="loader-bar">
        <div
          className="loader-progress"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Loader;