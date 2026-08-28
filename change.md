Day 1:
Commands
git init -> github repo creation
npm init -y -> used for initial setup of node.js environment. It creates package.json with default values
npm init playwright@latest -> used initialising playwright project with default structure

Folders
node_modules -> libraries used by current project.
package.json -> defines which is starting version of each library this project needs.
package-loc.json -> defines metadata about libraries used in this project in detail.
playwright.config.ts -> defines configs for our tests
.gitignore -> tells which folders should not be comitted.

Commands
npx playwright test -> executes all tests present inside tests folder
npx playwright install chromium -> install chromium browser engine which is similar to chrome

Notes:

{page} -> UI Testing
{request} -> API Testing

                 Playwright Test
                       │
             ┌─────────┴─────────┐
             │                   │
          { page }            { request }
             │                   │
          Browser              HTTP
             │                   │
             ▼                   ▼
            UI                  API

Day 2:

                    Test
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
     Test Data    Fixture     Assertions
          │          │
          ▼          ▼
     generateUser  UserApi
                     │
                     ▼
                  REST API