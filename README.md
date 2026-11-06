# Set up for development

This webapp uses [yarn](https://yarnpkg.com/) and [Vite](https://vite.dev/) for development
and requires Node.js 20.19+ or 22.13+.
To build for production, this webapp uses a `Makefile` with [GNU Make](https://www.gnu.org/software/make/)

## Install packages
```
yarn
```

## Run app
```
yarn start
```

The development server runs on `http://localhost:3000` and proxies `/api/v1` and
`/config.json` to a running `grommunio-admin-api` (default `http://localhost:8080`).
To use a different backend, set `ADMIN_API_URL`:

```
ADMIN_API_URL=http://192.168.1.10:8080 yarn start
```

`HOST` and `PORT` change the address the development server listens on.

## Checks
```
yarn typecheck
yarn lint
```

## Build for production

### `make && make dist`

Run this command to create files for distribution.

The app is built into `/build`, the distribution tarball is created in `/dist`.
The version shown in the app is taken from `VITE_BUILD_VERSION` (set by the `Makefile`).

## Deploying under a subpath

By default the app assumes it is served at the root of its domain
(`https://mail.example.com/`). To run it under a subpath instead
(`https://mail.example.com/admin/`), only the `<base href="/">` tag
in `index.html` needs to be adapted.

# Server-side configuration

In order to get the correct configuration for production, create a `config.json` in
`/etc/grommunio-admin-common/config.json`.
Attributes which are manually set in `config.json` will overwrite the default values,
otherwise the defaults are used.

Following attributes are available:

* `devMode:boolean` For development, enables redux logger (default: `false`)

* `tokenRefreshInterval:int` Sets token refresh interval in seconds. (default: `86400` (24h))

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
  * `favicon`: The site's favicon

  Each of these keys must be an URL to an image file.
If none of the hostnames matches, the special hostname `*` will be used as a fallback.

  An example `customImages` object looks like this:

  ```
  "customImages": {
    "localhost": {
      "logo": "url.to/logo.png",
      "logoLight": "url.to/light/logo.png",
      "icon": "url.to/light/icon.svg",
      "background": "url.to/background.svg",
      "backgroundDark": "url.to/dark/background.svg",
      "favicon": "url.to/fancy/favicon.png"
    },
    "example.com": {
      "logo": "anotherUrl.to/logo.png",
      "logoLight": "anotherUrl.to/light/logo.png",
      "icon": "anotherUrl.to/light/icon.svg"
    },
    "*": {
      "logo": "defaultUrl.to/logo.png",
      "logoLight": "defaultUrl.to/light/logo.png",
      "icon": "defaultUrl.to/light/icon.svg"
    }
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

