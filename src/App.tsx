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

const brandValue = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const unquote = (value: string) => value.replace(/^(["'])(.*)\1$/s, '$2');

const stripUrl = (value: string) => {
  const match = value.match(/^url\((.*)\)$/s);
  return unquote((match ? match[1] : value).trim());
};

// Root class
const App = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const colorContext = useContext(ColorModeContext);
  const { authenticated, capabilities } = useAppSelector(state => state.auth);
  const { Domains, loading } = useAppSelector(state => state.drawer);
  const serverConfig = useAppSelector(state => state.config);
  const configError = serverConfig.error;
  const customImages = serverConfig.customImages[window.location.hostname] || serverConfig.customImages["*"];

  const routesProps: RoutesProps = {
    authenticated,
    loading,
  };
  const darkMode = colorContext.mode === "dark";

  // Set favicon and title: brand values from the host stylesheet first, then the configured images
  useEffect(() => {
    const apply = () => {
      const href = stripUrl(brandValue('--brand-favicon')) || customImages?.favicon;
      if (href) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = href;
      }
      const title = unquote(brandValue('--brand-title'));
      if (title) document.title = title;
    };
    apply();
    if (document.readyState !== 'complete') {
      window.addEventListener('load', apply, { once: true });
      return () => window.removeEventListener('load', apply);
    }
  }, [customImages]);

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
      style={authenticated ? {
        backgroundImage: darkMode ?
          `url(${customImages?.backgroundDark || backgroundDark})` :
          `url(${customImages?.background || background})`
      } : { backgroundColor: darkMode ? '#0b0f14' : '#2a2a72' }}
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
