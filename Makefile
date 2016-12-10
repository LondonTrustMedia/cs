.PHONY: all

all: css

css: build/debuglog.css

build/debuglog.css: build/
	sassc src/debuglog.scss build/debuglog.css

build/:
	mkdir build/

