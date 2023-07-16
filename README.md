![Logo](admin/tibberlink.png)
# ioBroker.tibberlink

[![NPM version](https://img.shields.io/npm/v/iobroker.tibberlink.svg)](https://www.npmjs.com/package/iobroker.tibberlink)
![NPM version (stable)](https://iobroker.live/badges/tibberlink-stable.svg)
[![Downloads](https://img.shields.io/npm/dm/iobroker.tibberlink.svg)](https://www.npmjs.com/package/iobroker.tibberlink)
![Number of Installations (latest)](https://iobroker.live/badges/tibberlink-installed.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/hombach/ioBroker.tibberlink/badge.svg)](https://snyk.io/test/github/hombach/ioBroker.tibberlink)

**CI-Tests:**
![Test and Release](https://github.com/hombach/ioBroker.tibberlink/workflows/Test%20and%20Release/badge.svg)
[![CodeQL](https://github.com/hombach/ioBroker.tibberlink/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/hombach/ioBroker.tibberlink/actions/workflows/codeql-analysis.yml)
[![Appveyor-CI](https://ci.appveyor.com/api/projects/status/github/hombach/ioBroker.tibberlink?branch=master&svg=true)](https://ci.appveyor.com/project/hombach/iobroker-tibberlink)

[![NPM](https://nodei.co/npm/iobroker.tibberlink.png?downloads=true)](https://nodei.co/npm/iobroker.tibberlink/)


## Adapter for using TIBBER energy data in iOBroker
Adapter for linking reading Data from your Tibber account API to be used in ioBroker

If you're not a Tibber user right now, it's greatly appreciated when you're using my reveral link:

[https://invite.tibber.com/2gwuign3.](https://invite.tibber.com/2gwuign3.)

## Configuration
1. Create a new instance of the adapter
2. Fill in your Tibber API token 
3. Choose to also pull data from your Tibber Pulse  -  !! Only working if hardware is installed
4. Save the settings

## Notes
This adapter uses Sentry libraries to automatically report exceptions and code errors to the developers. For more details and for informations on how to disable the error reporting see [Sentry-Plugin Documentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry)! Sentry reporting is used starting with js-controller 3.0.

## Changelog
! Note that missing version entries are typically dependency updates for improved security.

### 0.1.2 (2023-07-17) - WIP
hide unused checkboxes in config
### 0.1.1 (2023-07-16)
remove release script and dev-server
### 0.1.0 (2023-07-14)
initial version

## License
GNU General Public License v3.0 only

Copyright (c) 2023 Hombach <TibberLink@homba.ch>
