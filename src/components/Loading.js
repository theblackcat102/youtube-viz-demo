import React, { Component } from "react";
import { ReactComponent as LoadingAnimation } from '../asset/pulse.svg';


class Loading extends Component {
    render() {
        return (
            <div className="loading">
                <LoadingAnimation></LoadingAnimation>
            </div>
        );
    }
}

export default Loading;