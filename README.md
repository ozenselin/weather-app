# Webpack Starter Template

This is a minimal and structured Webpack starter template designed for modern front-end development. It includes a semantic HTML template, a well-structured CSS reset, and a modular Webpack configuration separated into development and production environments. Additionally, it comes with ESLint configured with the Airbnb base style guide (excluding React) and integrated with Prettier for consistent code formatting and linting across the project.

## Scripts

The following NPM scripts are defined in `package.json`:

- `npm run dev`: Runs the development server using `webpack.dev.js` with live reloading and file watching.
- `npm start`: Alias for `npm run dev`, but also opens the browser automatically.
- `npm run build`: Creates a production-ready bundle using `webpack.prod.js`.

## Webpack Configuration

### webpack.common.js

Shared settings used by both development and production environments:

- `entry`: Sets `./src/index.js` as the entry point.
- `output`: Outputs a bundled file `main.js` in the `dist` directory. Automatically cleans the directory before each build.
- `HtmlWebpackPlugin`: Uses `src/template.html` as the HTML template and injects the JavaScript bundle.
- **Loaders**:
  - `css-loader`: Resolves `@import` and `url()` in CSS.
  - `style-loader`: Injects CSS into the DOM using `<style>` tags.
  - `html-loader`: Enables importing HTML files as modules (required by `HtmlWebpackPlugin`).
  - `asset/resource`: Handles importing image and font files, emitting them to the output directory and resolving the correct URLs.

### webpack.dev.js

Development-specific configuration:

- `mode: "development"`: Enables useful names for modules and disables optimizations.
- `devtool: "eval-source-map"`: Provides high-quality source maps optimized for development. Helps debugging by mapping errors to original source files.
- `devServer.watchFiles`: Watches `template.html` for changes. Automatically reloads the browser when HTML is modified.

### webpack.prod.js

Production-specific configuration:

- `mode: "production"`: Enables minification and tree-shaking for optimized output.
- Inherits shared configuration from `webpack.common.js`.

## Development Dependencies

All development dependencies are installed under `devDependencies` in `package.json`.

| Package                    | Purpose                                                                    |
|----------------------------|----------------------------------------------------------------------------|
| `webpack`                  | Core module bundler for compiling JS, CSS, HTML, and static assets.        |
| `webpack-cli`              | CLI tools for interacting with Webpack via terminal.                       |
| `webpack-dev-server`       | Provides live reloading and file watching during development.              |
| `webpack-merge`            | Merges multiple Webpack configurations (used to combine common/dev/prod).  |
| `style-loader`             | Injects CSS into the DOM at runtime.                                       |
| `css-loader`               | Resolves `@import` and `url()` in CSS files.                               |
| `html-loader`              | Processes HTML files as modules. Used by `HtmlWebpackPlugin`.              |
| `html-webpack-plugin`      | Generates HTML files and injects the Webpack output bundle automatically.  |
| `eslint`                   | JavaScript linter for identifying and fixing code quality issues.          |
| `eslint-config-airbnb-base`| Airbnb's ESLint configuration for JavaScript (without React rules).        |
| `eslint-config-prettier`   | Disables ESLint rules that conflict with Prettier formatting.              |
| `eslint-plugin-import`     | ESLint plugin for import/export syntax validation (Airbnb peer dependency).|
| `prettier`                 | Code formatter for consistent code styling across the project.             |

## CSS: Reset and Modern Base Styles

The `style.css` file serves both as a reset and as a foundation for consistent UI styling. It includes:

- **Universal Reset**:
  - Removes default margin and padding from all elements.
  - Ensures `box-sizing: border-box` applies to all elements and pseudo-elements.

- **Typography**:
  - Sets a modern, cross-platform font stack based on `system-ui`.
  - Uses `line-height: calc(1ex / 0.32)` to ensure vertical rhythm consistency.
  - Applies `-webkit-font-smoothing: antialiased` for better text rendering on macOS.

- **Media Elements**:
  - Makes elements like `img`, `video`, `canvas`, `svg` responsive (`display: block; max-width: 100%`).

- **Form Elements**:
  - Ensures consistent font styling across `input`, `button`, `textarea`, and `select`.

- **Headings and Paragraphs**:
  - Applies modern text wrapping: `text-wrap: balance` for headings, `text-wrap: pretty` for paragraphs.
  - Ensures overflow-safe layout with `overflow-wrap: break-word`.

- **Article Content**:
  - Sets `max-inline-size: 50ch` for better readability of long-form content.

- **Framework Isolation**:
  - Adds `isolation: isolate` to `#root` and `#__next` containers to prevent layout issues when integrating frameworks like React or Next.js.

## Linting & Formatting

Basic ESLint setup paired with a Prettier configuration template that uses the default settings without modification.

To ensure seamless integration and avoid rule conflicts between Prettier and Airbnb, `eslint-config-prettier` is included. Additionally, older eslintrc configuration file format is used to ensure compatibility with `eslint-config-airbnb-base`(without React). It supports both browser and Node environments and ES module syntax. A few common rules are customized to balance code quality with developer convenience.

You can access the full configuration references here: 🔗 **[ESLint Rules](https://eslint.org/docs/rules/)** • 🔗 **[Prettier Options](https://prettier.io/docs/en/configuration.html)**

## License

This project is licensed under MIT license - see the [LICENSE](LICENSE) file for details.
