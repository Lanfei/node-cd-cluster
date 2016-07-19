# node-cd-cluster [![NPM version][npm-image]][npm-url]

A lightweight continuous deployment platform written in node.

![cd-cluster](https://cloud.githubusercontent.com/assets/2156642/16941742/9c2c3242-4dc4-11e6-8286-906d9a93d2f6.jpg)

## Installation

```sh
npm install cd-cluster -g
```

## Usage

### Slave Side

```sh
cd-slave start [options] [port=8081]
```

Options:

    -h, --help           output usage information
    -t, --token [token]  a token used to verify requests

[npm-url]: https://npmjs.org/package/cd-cluster
[npm-image]: https://badge.fury.io/js/cd-cluster.svg

### Master Side

```sh
cd-master start [port=8080]
```

Visit `http://hostname:port` and enjoy.
