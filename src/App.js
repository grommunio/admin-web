// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import { connect } from "react-redux";
import Loadable from "react-loadable";
import Loader from "./components/Loading";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { authAuthenticating } from "./actions/auth";
import background from "./res/bootback.svg";
import backgroundDark from "./res/bootback-dark.svg";
import i18n from "./i18n";
import { changeSettings } from "./actions/settings";
import { CapabilityContext } from "./CapabilityContext";

const styles = {
  root: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#fafafa",
    backgroundImage: `
      linear-gradient(rgba(240,240,240,0.99), rgba(240, 240, 240, 0.8)),
      url(${background})`,
    backgroundSize: "cover",
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 1,
  },
  layer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 10,
  },
  darkRoot: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#1c2025",
    backgroundImage: `
      linear-gradient(#1c2025, rgba(28, 32, 37, 0.97)),
      url(${backgroundDark})`,
    backgroundSize: "cover",
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 1,
  },
  darkLayer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 10,
  },
  mainView: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    zIndex: 100,
  },
};

// Create async component with react-loadable
const MainView = Loadable({
  loader: () => import("./components/LoadableMainView"),
  loading: Loader,
  timeout: 20000,
  delay: 100,
});

// Root class
class App extends Component {

  constructor(props) {
    super(props);
    // Get the selected language from local store and apply with i18-next
    const { changeSettings } = props;
    const lang = localStorage.getItem("lang");
    if (lang) {
      i18n.changeLanguage(lang);
      changeSettings("language", lang);
    }
  }

  componentDidMount() {
    const { authAuthenticating } = this.props;
    authAuthenticating(false);
  }

  render() {
    const { classes, Domains } = this.props;
    const { loading, authenticating, authenticated, capabilities } = this.props;
    const darkMode = window.localStorage.getItem("darkMode");
    const routesProps = {
      authenticating,
      authenticated,
      loading,
    };

    return (
      <div className={darkMode === "true" ? classes.darkRoot : classes.root}>
        <div className={darkMode === "true" ? classes.darkLayer : classes.layer}/>
        <CapabilityContext.Provider value={capabilities}>
          <MainView
            classes={classes}
            authenticated={authenticated}
            capabilities={capabilities}
            domains={Domains || []}
            routesProps={routesProps}
          />
        </CapabilityContext.Provider>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  authAuthenticating: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  authenticating: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  capabilities: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

const mapStateToProps = (state) => {
  const { authenticating, authenticated, capabilities } = state.auth;
  const { Domains, loading } = state.drawer;

  return {
    authenticating,
    authenticated,
    capabilities,
    Domains,
    loading,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeSettings: (field, value) => dispatch(changeSettings(field, value)),
    authAuthenticating: state => dispatch(authAuthenticating(state)),
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(App)));
