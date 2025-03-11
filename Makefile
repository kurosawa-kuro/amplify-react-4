dev:
	npm run dev

build:
	npm run build

install:
	npm install

sandbox:
	npx ampx sandbox

sandbox-reset:
	npx ampx sandbox delete -y
	rm -rf .amplify
	npx ampx sandbox
