## \[WIP] Contributing guidelines

### Open a Pull Request if it:

- Fixes a bug
- Doesn't decrease performance or increase package size
- Decreases size of package without compromising on features or performance
- Simplifies the API
- Improve documentation
- Improves testing or increases test coverage

### Development Steps

- Fork the repo
- Clone the repo

        git clone https://github.com/${username}/sifrr.git

- Install dependencies

        pnpm install

- Build libraries (and watch for updates), works in every package folder as well

        pnpm build -w

- Now any change you make will update the `dist` files
- Run tests with (works in every package folder as well)

        pnpm test

- Start test server with (works in only package folders)

        pnpm test-server

### Guidelines

- Build dist files before opening PR
- Run `pnpm install` if you update dependencies
