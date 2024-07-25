// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useEffect } from "react";
import { withStyles } from 'tss-react/mui';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import background from "!file-loader!./res/background_light.svg";
import backgroundDark from "!file-loader!./res/background_dark.svg";
import i18n from "./i18n";
import { changeSettings } from "./actions/settings";
import { CapabilityContext } from "./CapabilityContext";
import { SYSTEM_ADMIN_WRITE } from "./constants";
import { fetchLicenseData } from "./actions/license";
import './snow.css';
import { checkHolidaySeason } from "./utils";
import makeLoadableComponent from "./lazy";
import SilentRefresh from "./components/SilentRefresh";

const styles = {
  root: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    backgroundSize: "cover",
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 1,
  },
  mainView: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    zIndex: 100,
  },
};

const AsyncMainView = makeLoadableComponent(() => import("./components/LoadableMainView"));

// Root class
const App = ({classes, Domains, serverConfig, loading, authenticated, capabilities, changeSettings, fetchLicense}) => {
  const routesProps = {
    authenticated,
    loading,
  };
  const darkModeStorage = window.localStorage.getItem("darkMode");
  const darkMode = darkModeStorage === null ? serverConfig.defaultDarkMode.toString() : darkModeStorage;
  const isHolidaySeason = React.useMemo(checkHolidaySeason, []);

  // componentDidMount()
  useEffect(() => {
    // Get the selected language from local store and apply to i18-next
    const lang = localStorage.getItem("lang");
    if (lang) {
      i18n.changeLanguage(lang);
      changeSettings("language", lang);
    }
  }, []);

  useEffect(() => {
    if(capabilities.includes(SYSTEM_ADMIN_WRITE)) fetchLicense();
  }, [capabilities])
    
  return (
    <div
      className={classes.root}
      style={{
        backgroundImage: darkMode === "true" ?
          `url(${serverConfig.customImages[window.location.hostname]?.backgroundDark || backgroundDark})` : 
          `url(${serverConfig.customImages[window.location.hostname]?.background || background})`
      }}
    >
      {isHolidaySeason && [...Array(50)].map((_, idx) => 
        <div key={idx} className="snowflake">
          <div className="inner">❅</div>
        </div>
      )}
      {authenticated && <SilentRefresh />}
      <CapabilityContext.Provider value={capabilities}>
        <AsyncMainView
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

App.propTypes = {
  classes: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  Domains: PropTypes.array.isRequired,
  authenticated: PropTypes.bool.isRequired,
  capabilities: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  serverConfig: PropTypes.object.isRequired,
  fetchLicense: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { authenticated, capabilities } = state.auth;
  const { Domains, loading } = state.drawer;

  return {
    authenticated,
    capabilities,
    Domains,
    loading,
    serverConfig: state.config,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeSettings: (field, value) => dispatch(changeSettings(field, value)),
    fetchLicense: async () => await dispatch(fetchLicenseData())
      .catch(err => console.error(err)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(App, styles));
