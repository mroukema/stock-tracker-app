ELM_MAKE=elm make
ELM_MAIN=src/Main.elm
ELM_OUTPUT_FILE=elm.js
ELM_STUFF=elm-stuff

all: elm.js

elm.js: cleanElm.js
	${ELM_MAKE} ${ELM_MAIN} --output ${ELM_OUTPUT_FILE}

.PHONY: clean

cleanElm.js:
	rm ${ELM_OUTPUT_FILE}

clean: cleanElm.js
	rm -r ${ELM_STUFF}
