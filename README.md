# Redux Debugger Plugin for Flipper with Colorized

<img width="700" alt="Screen Shot 2022-01-09 at 0 09 50" src="https://user-images.githubusercontent.com/26793088/148674521-b848e29a-d0eb-40f7-af54-fc79a332aa76.png">

This plugin has been enhanced the readability for action columns by following features:

- Dividing by separator using a slash (`/`) and padding horizontally
- Colorizing each word
- Decorating special keywords (`fulfilled`, `pending`, `rejected`)

## Installation

1. Followin original Getting Started on [jk-gan/flipper-plugin-redux-debugger](https://github.com/jk-gan/flipper-plugin-redux-debugger) except for installing plugin/middleware.
2. Install middleware
   ```shell
   yarn redux-flipper-colorized # instead of redux-flipper
   cd ios & pod install
   ```
3. Install Plugin on Flipper Client
   - `Manage Plugins > Install Plugins > search "redux-debugger-colorized" > Install`
   - [package name] `redux-debugger-colorized`

## Acknowledgement

This plugin is forked from [jk-gan/flipper-plugin-redux-debugger](https://github.com/jk-gan/flipper-plugin-redux-debugger). Please read original README to understand.

## LICENSE

MIT
