# Technical documentation

## Front end

The front end is built in [React](https://reactjs.org/), and uses the following
libraries:

* [react-router](https://www.npmjs.com/package/react-router) for page routing
* [Redux](https://redux.js.org/) for internal state management
* [Webpack](https://webpack.js.org/) for bundling the app into a deliverable

We use [Rebass](http://jxnblk.com/rebass/) as the foundation for styling, with
custom [styled-components](https://www.styled-components.com/) for customization
where appropriate.

For testing, we use [Jest](https://facebook.github.io/jest/) as the test runner
and [Enzyme](http://airbnb.io/enzyme/) as a React renderer.

## API

The API is built on [Express](https://expressjs.com/) using a
[PostgreSQL](https://www.postgresql.org/) database, and a handful of libraries:

* [bcryptjs](https://www.npmjs.com/package/bcryptjs) for secure hashing
* [client-session](https://www.npmjs.com/package/client-sessions) for secure
  cookie-based sessions
* [Passport](http://www.passportjs.org/) for authentication
* [Knex](http://knexjs.org/) for interacting with the database

For testing, we use [node-tap](http://www.node-tap.org/) as the runner and
assertions, and [Sinon.JS](sinonjs.org) for mocking.

If you want to get a little deeper into how the API works, we have documentation
about:

* [configuring the back end app (environment variables and stuff like that)](api-configuration.md)
* [our authorization model](api-authorization.md)
* [how we handle authentication](api-authentication.md)