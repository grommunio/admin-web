let config = {
  devMode: false,
};

fetch('//' + window.location.host + '/config.json')
  .then(response => {
    if (response.ok) {
      config = response.json();
    }
  });

export default config;