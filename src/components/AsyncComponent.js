import React, { Component } from "react";

function makeAsyncComponent(importer) {
  class AsyncComponent extends Component {
    constructor(props) {
      super(props);

      this.state = {
        component: null,
      };
    }

    async componentDidMount() {
      const { default: component } = await importer();

      this.setState({
        component,
      });
    }

    render() {
      const { component: C } = this.state;

      return C ? <C {...this.props} /> : null;
    }
  }

  return AsyncComponent;
}

export default makeAsyncComponent;
