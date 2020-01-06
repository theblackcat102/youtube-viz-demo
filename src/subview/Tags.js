import React, { useState, useEffect, useRef, Component } from "react";


class Tag extends Component {
    constructor({match, ...props}) {
        super(props);
        this.state = {
            id: null,
        };
        if (match.params.tagId) {
            this.state.id = match.params.tagId;
        }
    }
    render() {
        return (
            <div>Render Tag</div>
        )
    }
}

export default Tag;