PACKAGE_NAME = grommunio-admin-web

# Tools

YARN ?= yarn

# Variables

VERSION ?= $(shell git describe --tags --always 2>/dev/null || \
			cat $(CURDIR)/.version 2> /dev/null || echo 0.0.0-unreleased)

# Build

.PHONY: all
all: build

.PHONY: build
build:  vendor | src ; $(info building ...)	@
	@rm -rf build

	REACT_APP_BUILD_VERSION="${VERSION}" $(YARN) run build

.PHONY: src
src:
	@$(MAKE) -C src build

# Checks

.PHONY: lint
lint: vendor ; $(info running eslint ...) @
	$(YARN) eslint .

# Tests

.PHONY: test
test: vendor ; $(info running jest tests ...) @
	REACT_APP_BUILD_VERSION="${VERSION}" CI=true $(YARN) test -- --verbose

# Yarn

.PHONY: vendor
vendor: .yarninstall

.yarninstall: package.json ; $(info getting dependencies with yarn ...) @
	@$(YARN) install
	@touch $@

# Dist

.PHONY: dist
dist: ; $(info building dist tarball ...) @
	@mkdir -p "dist/${PACKAGE_NAME}-${VERSION}"
	@cd dist && \
	cp -avf ../README.md "${PACKAGE_NAME}-${VERSION}" && \
	cp -avr ../build "${PACKAGE_NAME}-${VERSION}/webapp" && \
	tar --owner=0 --group=0 -czvf ${PACKAGE_NAME}-${VERSION}.tar.gz "${PACKAGE_NAME}-${VERSION}" && \
	cd ..

.PHONY: clean ; $(info cleaning ...) @
clean:
	$(YARN) cache clean
	@rm -rf build
	@rm -rf node_modules
	@rm -f .yarninstall

	@$(MAKE) -C src clean

.PHONY: version
version:
	@echo $(VERSION)
