.PHONY: all

all: css

css: build/debuglog.css

build/debuglog.css: build/ src/debuglog.scss
	sassc src/debuglog.scss build/debuglog.css

build/:
	mkdir build/

