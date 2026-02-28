import React from 'react'
import "./CTA.css"
import { Link } from 'react-router-dom'

const CTA = () => {
    return (
        <div className='signlang_cta'>
            <div className="signlang_cta-content">
                <h3>
                    Get Started and Try the Model
                </h3>
            </div>

            <div className="signlang_cta-button">
                <Link to="/detect">
                    <button type="button">
                      Try Now !
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default CTA
