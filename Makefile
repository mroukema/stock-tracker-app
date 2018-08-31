all: buildClient installServerDependencies

buildClient:
	cd client; make

installServerDependencies:
	cd server; npm install
