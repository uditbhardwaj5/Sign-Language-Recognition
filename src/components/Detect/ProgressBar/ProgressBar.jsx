import React from 'react'
import PropTypes from 'prop-types'
import "./ProgressBar.css"

const ProgressBar = ({progress}) => {
  return (
    <div className="progress-container">
      <div
        className="progress-bar"
        id="myBar"
        style={{ width: `${progress}%` }}
      >{progress}%</div>
    </div>
  )
}

export default ProgressBar