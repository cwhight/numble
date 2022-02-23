import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlay} from '@fortawesome/free-solid-svg-icons'

const Play = ({onPlayerClick} :any ) => {
    return (
        <svg className=" d-flex justify-content-around  align-items-center button" viewBox="0 0 60 60" onClick={onPlayerClick}>
            <FontAwesomeIcon icon={faPlay} />
        </svg>
    )
}

export default Play