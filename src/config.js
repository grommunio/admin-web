import { addMiddleware } from 'redux-dynamic-middlewares';
import { createLogger } from 'redux-logger';

let config = {
  devMode: false,
};

fetch('//' + window.location.host + '/config.json')
  .then(response => response.json())
  .then(res => {
    if (res) {
      config = res;
      if(res.devMode) {
        addMiddleware(createLogger());
      }
    }
  });

export default config;