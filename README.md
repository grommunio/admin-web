# Set up for development
 
This webapp uses [yarn](https://yarnpkg.com/) and [caddy](https://caddyserver.com/) for development.
You need 2 seperate terminals to run this app. One to run `yarn` and one to setup a `caddy` reverse proxy to access the backend server.
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

Using a grommunio-VM, with `grommunio-admin-api.service` runnning, the configuration should work out of the box.

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
`/usr/share/grommunio/admin/webapp/config.json` 

Following props are available:

* `devMode:boolean` For development, enables redux logger

* `mailWebAddress:String` Url of production mail server

* `chatWebAddress:String` Url of production chat server

* `videoWebAddress:String` Url of production video server

* `fileWebAddress:String` Url of production file server

* `archiveWebAddress:String` Url of production archive server

* `searchAttributes:Array<String>` Array of strings, possible LDAP Search attributes
