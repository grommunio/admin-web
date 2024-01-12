# Set up for development
 
This webapp uses [yarn](https://yarnpkg.com/) and [caddy](https://caddyserver.com/) for development.
You need 2 separate terminals to run this app. One to run `yarn` and one to setup a `caddy` reverse proxy to access the backend server.
To build for production, this webapp uses a `Makefile` with [GNU Make](https://www.gnu.org/software/make/)

## yarn

### Install packages
```
yarn
```
or
```
make
```

### Run app
```
yarn start
```

## caddy

### Installation
According to https://caddyserver.com/docs/install
```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/cfg/gpg/gpg.155B6D79CA56EA34.key' | sudo apt-key add -
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/cfg/setup/config.deb.txt?distro=debian&version=any-version' | sudo tee -a /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```
### Using caddy

#### Caddyfile

You will find a file `Caddyfile.example` in root directory of this repository.
Copy this file to `./Caddyfile`.

```
cp Caddyfile.example Caddyfile
```

Using a grommunio-VM, with `grommunio-admin-api.service` running, the configuration should work out of the box.

The Caddyfile includes these necessary lines
```
:4000 # port to run caddy on
reverse_proxy /api/v1/* localhost:8080 # Address of backend
reverse_proxy /config.json localhost:8080 # Address of config.json
reverse_proxy http://127.0.0.1:3000 # Address of webapp (default yarn port)
```
* `:4000`: Specifies the port the Caddyserver will run on and can be accessed with your browser.
* `reverse_proxy /api/v1/* localhost:8080`: Specifies the address http requests to `/api/v1/*` will be redirected to. This has to be the location `grommunio-admin-api.service` runs on.
* `reverse_proxy /config.json localhost:8080`: Specifies the location of `config.json`.
* `reverse_proxy http://127.0.0.1:3000`: Specifies the address the webapp is running on with yarn. Per default, yarn runs on port 3000, so this should only be changed if changes to `./.env` are made.

Further details are commented in `Caddyfile.example` or can be researched at https://caddyserver.com/docs/quick-starts/reverse-proxy

### Running caddy
In separate terminal:

```
caddy run
```

If you get an error with `caddy administration endpoint: listen tcp 127.0.0.1:2019: bind: address already in use`, try
```
caddy stop && caddy run
```

### Accessing website

If you followed above steps, you should now be able to access the running webapp in your browser on `localhost:4000`

## Build for production

### `make && make dist`

Run this command to create files for distribution.

Result will be created in `/dist`



# Server-side configuration

In order to get the correct configuration for production, create a `config.json` in
`/etc/grommunio-admin-common/config.json`.
Attributes which are manually set in `config.json` will overwrite the default values,
otherwise the defaults are used.

Following attributes are available:

* `devMode:boolean` For development, enables redux logger (default: `false`)

* `defaultDarkMode:boolean` If `true`, the app will be set to dark mode, if not explicitly set by the user/browser

* `defaultTheme:string` Name of the default theme to use. Available themes: grommunio, green, purple, magenta (default: "grommunio")

* `loadAntispamData:boolean` Whether or not to load antispam data in the dashboard (default: `true`)

* `rspamdWebAddress:String` Url of production rspamd server (default: `''`)

* `mailWebAddress:String` Url of production mail server (default: `''`)

* `chatWebAddress:String` Url of production chat server (default: `''`)

* `videoWebAddress:String` Url of production video server (default: `''`)

* `fileWebAddress:String` Url of production file server (default: `''`)

* `archiveWebAddress:String` Url of production archive server (default: `''`)

* `searchAttributes:Array<String>` Array of strings, possible LDAP Search attributes

* `customImages:Object`: This object can be used to white-label the app. That includes logos, icons and background images.
It is possible to create separate sets of images for different hostnames.
Each hostname is the key of an object, which has following keys:
  * `logo`: The logo in the login form
  * `logoLight`: The logo in the expanded drawer
  * `icon`: The icon in the collapsed drawer
  * `background`: The background image in light mode
  * `backgroundDark`: The background image in dark mode
  Each of these keys must be an URL to an image file.

  An example `customImages` object looks like this:

  ```
  "customImages": {
    "localhost": {
      "logo": "url.to/logo.png",
      "logoLight": "url.to/light/logo.png",
      "icon": "url.to/light/icon.svg",
      "background": "url.to/background.svg",
      "backgroundDark": "url.to/dark/background.svg"
    },
    "example.com": {
      "logo": "anotherUrl.to/logo.png",
      "logoLight": "anotherUrl.to/light/logo.png",
      "icon": "anotherUrl.to/light/icon.svg"
    },
  }
  ```
As you can see, it is not necessary to overwrite every image, but the hostnames need to be accurate.



# Additional information

## Support

- Support is available through **[grommunio GmbH](https://grommunio.com)** and its partners.
- grommunio Admin web community is available here: **[grommunio Community](https://community.grommunio.com)**

For direct contact to the maintainers (for example to supply information about a security-related responsible disclosure), you can contact grommunio directly at [dev@grommunio.com](mailto:dev@grommunio.com)

## Contributing

First off, thanks for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make will benefit everybody else and are greatly appreciated.

Please read [our contribution guidelines](doc/CONTRIBUTING.md), and thank you for being involved!

## Security

grommunio Admin web follows good practices of security. grommunio constantly monitors security related issues.
grommunio Admin web is provided "as is" without any warranty. For professional support options through subscriptions, head over to [grommunio](https://grommunio.com).

_For more information and to report security issues, please refer to our [security documentation](doc/SECURITY.md)._

## Coding style

This repository follows coding style loosely based on PEP8 standard (exception: maximum line width of 127).

## License

This project is licensed under the **GNU Affero General Public License v3**.

See [LICENSE](LICENSE.txt) for more information.

