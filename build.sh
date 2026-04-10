#!/usr/bin/env bash

export CC=clang
export CXX=clang++
export CGO_ENABLED=1

go build -ldflags "-H windowsgui" -o oilempire.exe .

echo "Build complete!"
