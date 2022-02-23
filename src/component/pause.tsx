import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPause} from '@fortawesome/free-solid-svg-icons'

const Pause = ({onPlayerClick} : any) => {
    return (
        <svg className="button  d-flex justify-content-around " viewBox="0 0 60 60" onClick={onPlayerClick}>
            <FontAwesomeIcon icon={faPause} />
        </svg>
    )
}

export default Pause