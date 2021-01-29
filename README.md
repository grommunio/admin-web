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

You will find a file `Caddyfile.dev` in root directory of this repository.
Copy this file to `./Caddyfile`. Using a grammm-VM, with `grammm-admin-api.service` runnning, the configuration should work out of the box. Further details are commented in `Caddyfile.dev` or can be researched at https://caddyserver.com/docs/quick-starts/reverse-proxy

### Running caddy
In separate terminal:
```
caddy run
```

## Build for production

### `make && make dist`

Run this command to create files for distribution.

Result will be created in `/dist`



# Server-side configuration


## Nginx config

In order to get the correct configuration for production, create a config.json in
`/usr/share/grammm/admin/webapp/config.json` 

Following props are available:

### `devMode:boolean`

For development, enables redux logger

### `mailWebAddress:String` 

Url of production mail server

### `chatWebAddress:String`

Url of production chat server

### `videoWebAddress:String`

Url of production video server

### `fileWebAddress:String`

Url of production file server

### `archiveWebAddress:String`

Url of production archive server

### `searchAttributes:Array<String>`

Array of strings, possble LDAP Search attributes
