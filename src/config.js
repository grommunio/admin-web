import { addMiddleware } from 'redux-dynamic-middlewares';
import { createLogger } from 'redux-logger';

export var config = {
  devMode: false,
  mailWebappAddress: '',
};

var setConfig = (newConfig) => {
  config = newConfig;
};

fetch('//' + window.location.host + '/config.json')
  .then(response => response.json())
  .then(res => {
    if (res) {
      setConfig({ ...res });
      if(res.devMode) {
        addMiddleware(createLogger());
      }
    }
  });

export default config;