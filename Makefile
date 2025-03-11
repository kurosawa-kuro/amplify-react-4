dev:
	npm run dev

install:
	npm install

sandbox:
	npx ampx sandbox

reset-sandbox:
	npx ampx sandbox delete -y
	rm -rf .amplify
	npx ampx sandbox
