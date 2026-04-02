// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useContext, useEffect } from "react";
import { makeStyles } from 'tss-react/mui';
import background from "!file-loader!./res/background_light.svg";
import backgroundDark from "!file-loader!./res/background_dark.svg";
import i18n from "./i18n";
import { changeSettings } from "./actions/settings";
import { CapabilityContext } from "./CapabilityContext";
import { SYSTEM_ADMIN_WRITE } from "./constants";
import { fetchLicenseData } from "./actions/license";
import makeLoadableComponent from "./lazy";
import SilentRefresh from "./components/SilentRefresh";
import ColorModeContext from "./ColorContext";
import Feedback from "./components/Feedback";
import { SERVER_CONFIG_ERROR } from "./actions/types";
import { useAppDispatch, useAppSelector } from "./store";
import { LoadableMainViewProps } from "./components/LoadableMainView";
import { RoutesProps } from "./types/misc";


const useStyles = makeStyles()(() => ({
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
}));

const AsyncMainView = makeLoadableComponent<LoadableMainViewProps>(
  () => import("./components/LoadableMainView"));

// Root class
const App = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const colorContext = useContext(ColorModeContext);
  const { authenticated, capabilities } = useAppSelector(state => state.auth);
  const { Domains, loading } = useAppSelector(state => state.drawer);
  const serverConfig = useAppSelector(state => state.config);
  const configError = serverConfig.error;

  const routesProps: RoutesProps = {
    authenticated,
    loading,
  };
  const darkMode = colorContext.mode === "dark";

  // componentDidMount()
  useEffect(() => {
    // Get the selected language from local store and apply to i18-next
    const lang = localStorage.getItem("lang");
    if (lang) {
      i18n.changeLanguage(lang);
      dispatch(changeSettings("language", lang));
    }
  }, []);

  useEffect(() => {
    if(capabilities.includes(SYSTEM_ADMIN_WRITE)) dispatch(fetchLicenseData());
  }, [capabilities]);
    
  return (
    <div
      className={classes.root}
      style={{
        backgroundImage: darkMode ?
          `url(${serverConfig.customImages[window.location.hostname]?.backgroundDark || backgroundDark})` : 
          `url(${serverConfig.customImages[window.location.hostname]?.background || background})`
      }}
    >
      {authenticated && <SilentRefresh />}
      <CapabilityContext.Provider value={capabilities}>
        <AsyncMainView
          authenticated={authenticated}
          capabilities={capabilities}
          domains={Domains || []}
          routesProps={routesProps}
        />
        {configError && <Feedback
          snackbar={"Error parsing config.json"}
          onClose={() => dispatch({ type: SERVER_CONFIG_ERROR, error: false })}
        />}
      </CapabilityContext.Provider>
    </div>
  );
}


export default App;
