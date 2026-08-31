# Playwright UI & API Automation Framework

A scalable **Playwright + TypeScript automation framework** for end-to-end UI and REST API testing, with runtime API contract validation using **Zod**, parallel execution using Playwright workers, Docker containerization, Kubernetes Job execution, and GitHub Actions CI.

---

## 📌 Overview

This framework is designed to support both **UI and API automation** within a single reusable architecture.

The primary goals are:

* Maintainable and reusable automation components
* Strong TypeScript typing
* Runtime validation of API responses
* Independent UI and API testing
* Worker-level test-user isolation
* Parallel test execution
* Environment-independent configuration
* Containerized test execution
* Kubernetes-based test execution
* CI execution through GitHub Actions
* Automatic test reports, screenshots and test results

The framework follows a layered architecture where tests consume reusable framework components instead of directly interacting with implementation details.

---

# 🏗️ Architecture

```text
                         ┌───────────────────────────┐
                         │       Test Suites         │
                         │                           │
                         │   UI Tests    API Tests   │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │          Fixtures         │
                         │                           │
                         │ Authenticated User        │
                         │ Auth API                  │
                         │ Logged-in Browser         │
                         └─────────────┬─────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
          ┌───────────────────┐                 ┌───────────────────┐
          │    Page Objects   │                 │     API Clients   │
          │                   │                 │                   │
          │ LoginPage         │                 │ AuthAPI           │
          │ EventsPage        │                 │ EventsAPI         │
          └─────────┬─────────┘                 └─────────┬─────────┘
                    │                                     │
                    │                                     ▼
                    │                           ┌───────────────────┐
                    │                           │  Zod Schemas     │
                    │                           │                   │
                    │                           │ Response Contract │
                    │                           │ Runtime Validation│
                    │                           └───────────────────┘
                    │
                    ▼
          ┌───────────────────────┐
          │       Application     │
          │                       │
          │ EventHub UI           │
          │ EventHub REST API     │
          └───────────────────────┘


        Configuration
              │
              ▼
    Environment Variables
              │
              ▼
    config/environment.ts
              │
       ┌──────┴──────┐
       ▼             ▼
      UI            API
      URL           URL


        Execution
            │
     ┌──────┼──────────┐
     ▼      ▼          ▼
   Local   Docker   Kubernetes
                     │
                     ▼
                GitHub Actions
```

---

# 📁 Project Structure

```text
Playwright_UI_API_Framework/
│
├── .github/
│   └── workflows/
│       └── playwright.yaml
│
├── api/
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   └── events.schemas.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── events.types.ts
│   │
│   ├── authAPI.ts
│   ├── eventsAPI.ts
│   └── types.ts
│
├── config/
│   └── environment.ts
│
├── fixtures/
│   └── apiFixtures.ts
│
├── k8s/
│   ├── configmap.yaml
│   └── job.yaml
│
├── pages/
│   ├── LoginPage.ts
│   └── EventsPage.ts
│
├── test-data/
│   └── user-Data.ts
│
├── tests/
│   ├── api/
│   └── ui/
│
├── utils/
│   └── assertions.ts
│
├── .dockerignore
├── .gitignore
├── Dockerfile
├── package.json
├── package-lock.json
├── playwright.config.ts
└── tsconfig.json
```

---

# 🧩 Framework Components

## 1. Tests

The `tests` directory contains actual test scenarios.

```text
tests/
├── api/
└── ui/
```

Tests should focus primarily on:

* Business scenarios
* Test data
* Assertions
* Calling framework abstractions

Tests should **not** contain:

* Raw API implementation details
* Authentication setup
* Browser context creation
* Environment URL handling
* Repeated locator definitions
* Low-level request construction

This keeps the test layer thin and readable.

Example conceptual flow:

```text
Test
 │
 ├── Generate test data
 │
 ├── Use fixture
 │
 ├── Call Page Object / API Client
 │
 └── Assert result
```

---

# 🧪 Page Object Model

UI interactions are encapsulated inside page classes.

```text
pages/
├── LoginPage.ts
└── EventsPage.ts
```

For example:

```text
LoginPage
    │
    ├── emailInput
    ├── passwordInput
    ├── submitButton
    └── loginDisplay
```

The tests don't need to know how the application locates these elements.

Instead of:

```ts
page.getByLabel('Email').fill(...)
page.getByLabel('Password').fill(...)
page.getByRole('button', { name: 'Sign In' }).click()
```

being repeated throughout tests, the test uses:

```ts
loginPage.login(email, password);
```

### Benefits

* Centralized locators
* Reduced duplication
* Easier maintenance
* Better readability
* UI implementation changes are isolated to page objects

---

# 🔌 API Automation Layer

API functionality is encapsulated into dedicated API clients.

```text
api/
├── authAPI.ts
└── eventsAPI.ts
```

### AuthAPI

Responsible for operations such as:

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

### EventsAPI

Responsible for operations such as:

```text
POST   /events
GET    /events/{id}
DELETE /events/{id}
```

The test does not construct raw HTTP requests repeatedly.

Instead:

```text
Test
  │
  ▼
EventsAPI
  │
  ▼
Playwright APIRequestContext
  │
  ▼
REST API
```

This provides a clean separation between **test intent** and **API implementation**.

---

# 🛡️ API Contract Validation with Zod

One of the important features of this framework is runtime validation of API responses.

TypeScript types alone cannot validate data received from an external API at runtime.

For example:

```ts
interface User {
  id: number;
  email: string;
}
```

does not guarantee that the API actually returns that structure.

Therefore the framework uses **Zod schemas**.

```text
API Response
     │
     ▼
JSON
     │
     ▼
Zod Schema
     │
     ├── Valid → Typed response
     │
     └── Invalid → ZodError
```

Example:

```ts
export const userSchema = z.object({
  id: z.number(),
  email: z.email(),
});
```

Then:

```ts
registerResponseSchema.parse(responseBody);
```

will fail immediately if the API violates the expected contract.

### Why this is valuable

During development, the API returned:

```json
{
  "user": {
    "userId": 46390,
    "email": "..."
  }
}
```

while the schema expected:

```json
{
  "user": {
    "id": 46390
  }
}
```

Zod immediately detected the contract mismatch.

This prevents invalid API responses from silently propagating into the test framework.

---

# 🔄 TypeScript Types vs Zod Schemas

The framework intentionally separates **compile-time types** from **runtime schemas**.

```text
api/types/
        │
        │ Compile-time
        ▼
TypeScript Types


api/schemas/
        │
        │ Runtime
        ▼
Zod Schemas
```

### Types

Used for request payloads and internal framework models.

Example:

```ts
export interface CreateEventPayload {
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  imageUrl: string;
}
```

### Schemas

Used to validate external API responses.

```ts
CreateEventResponseSchema
DeleteEventResponseSchema
FetchEventsResponseSchema
```

This provides both:

* compile-time safety
* runtime validation

---

# 📦 Common API Result

API clients return a common generic structure:

```ts
export type ApiResult<T> = {
  raw_response: APIResponse;
  custom_response: T;
};
```

This gives tests access to both the HTTP response and the validated response object.

```text
ApiResult<T>
│
├── raw_response
│     ├── status
│     ├── headers
│     └── URL
│
└── custom_response
      └── Zod validated data
```

Example:

```ts
const result = await eventsAPI.fetchEvent(...);

expectStatus(result.raw_response, 200);

expect(result.custom_response.data.title)
  .toBe(eventName);
```

This avoids forcing the test to choose between HTTP-level information and strongly typed response data.

---

# 🧰 Fixtures

Fixtures are responsible for reusable test setup and lifecycle management.

The framework uses Playwright's fixture system.

The most important fixture is:

```text
authenticatedUser
```

which is **worker scoped**.

---

# 👤 Worker-Scoped Authentication

The framework creates an independent test user for each Playwright worker.

With:

```text
workers: 2
```

the architecture becomes:

```text
Worker 1
│
└── User A
     └── Token A


Worker 2
│
└── User B
     └── Token B
```

This prevents different workers from sharing the same authentication state.

### Why worker scope?

Authentication setup doesn't need to happen before every test.

Instead:

```text
Worker starts
      │
      ▼
Register user
      │
      ▼
Get token
      │
      ▼
Store authenticatedUser
      │
      ├── Test 1
      ├── Test 2
      ├── Test 3
      └── Test N
```

This reduces unnecessary setup while maintaining worker isolation.

---

# 🌐 Test-Scoped Browser Context

The authenticated UI fixture creates a fresh browser context for every test.

```text
Worker
 │
 └── authenticatedUser
          │
          ▼
       Test 1
          │
          └── Browser Context 1

       Test 2
          │
          └── Browser Context 2
```

The authentication token is injected into `localStorage`:

```text
authenticatedUser.token
        │
        ▼
context.addInitScript()
        │
        ▼
localStorage
        │
        ▼
eventhub_token
```

This allows the test to start with an authenticated application state without repeatedly performing UI login.

---

# 🧪 Test Data Generation

Dynamic test data is centralized in:

```text
test-data/user-Data.ts
```

Generators include:

```text
generateUser()
generateEvent()
```

They use an override pattern:

```ts
generateEvent({
  city: 'Bangalore'
});
```

This allows tests to modify only the fields relevant to the scenario.

Conceptually:

```text
Default Test Data
       +
Scenario Overrides
       ↓
Final Test Data
```

This avoids creating large payload objects repeatedly throughout the test suite.

---

# ⚙️ Environment Configuration

Configuration is centralized in:

```text
config/environment.ts
```

The framework reads:

```text
UI_BASE_URL
API_BASE_URL
```

from environment variables.

If they are not provided, sensible defaults are used.

```text
Environment Variable
        │
        ▼
process.env
        │
        ▼
configValues
        │
        ▼
Zod validation
        │
        ▼
config
```

This means the same framework can run in different environments without changing source code.

---

# 🧭 Configuration Flow

```text
Local
 └── Defaults


Docker
 └── -e UI_BASE_URL=...
 └── -e API_BASE_URL=...


Kubernetes
 └── ConfigMap
       ↓
     Environment Variables


GitHub Actions
 └── Docker environment variables
```

All of these eventually reach:

```text
config/environment.ts
```

This prevents environment-specific URLs from being hardcoded throughout the framework.

---

# 🎭 Playwright Configuration

The central Playwright configuration is:

```text
playwright.config.ts
```

Important configuration includes:

```text
Test directory
      ↓
tests/

Workers
      ↓
2

Retries
      ↓
Local → 0
CI    → 1

Trace
      ↓
First retry

Screenshot
      ↓
First failure

Reporter
      ↓
List + HTML
```

### CI behavior

```ts
retries: process.env.CI ? 1 : 0
```

Therefore:

```text
Local
  → No retry

GitHub Actions
  → One retry
```

This keeps local execution fast while providing additional resilience in CI.

---

# 📊 Reporting

The framework uses:

```text
list reporter
HTML reporter
```

The list reporter provides immediate console feedback.

The HTML reporter provides detailed test execution information.

Artifacts generated include:

```text
playwright-report/
test-results/
```

These contain information such as:

* HTML report
* screenshots
* traces
* failure diagnostics

GitHub Actions uploads these as workflow artifacts.

---

# 🐳 Docker Architecture

The framework is containerized using the official Playwright image.

```dockerfile
FROM mcr.microsoft.com/playwright:v1.62.1-noble
```

The Docker image contains:

* Node.js
* Playwright
* Browser dependencies
* Chromium and other supported browser binaries
* Project dependencies

### Docker build flow

```text
Dockerfile
     │
     ▼
docker build
     │
     ▼
Playwright Docker Image
     │
     ▼
docker run
     │
     ▼
npm test
```

This makes the test environment reproducible across machines.

---

# ☸️ Kubernetes Execution

The framework also supports running the test suite as a Kubernetes Job.

```text
Kubernetes
    │
    ▼
Job
    │
    ▼
Pod
    │
    ▼
Playwright Container
    │
    ▼
npm test
```

The Job uses:

```yaml
kind: Job
```

rather than a Deployment because Playwright execution is a finite workload.

The configuration includes:

```yaml
restartPolicy: Never
backoffLimit: 0
```

This ensures Kubernetes does not repeatedly restart the entire test suite.

Playwright itself owns test retry behavior.

---

# 🔐 Kubernetes Configuration

Environment configuration is separated from the Job definition using a ConfigMap.

```text
ConfigMap
    │
    ├── UI_BASE_URL
    └── API_BASE_URL
             │
             ▼
       Playwright Pod
             │
             ▼
   config/environment.ts
```

This keeps environment configuration separate from workload configuration.

---

# 🚀 GitHub Actions CI

The framework is integrated with GitHub Actions.

The current CI pipeline is:

```text
                    GitHub Actions
                          │
                          ▼
                   Checkout Code
                          │
                          ▼
                   Build Docker Image
                          │
                          ▼
                 Create Report Directories
                          │
                          ▼
                 Run Playwright Container
                          │
                          ▼
                    Execute Tests
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
          playwright-report   test-results
                 │                 │
                 └────────┬────────┘
                          ▼
                  Upload Artifacts
```

---

# 🎯 Selective Test Execution

GitHub Actions supports selecting the test suite through workflow dispatch.

Available options:

```text
all
smoke
api
ui
regression
```

Conceptually:

```text
workflow_dispatch
       │
       ▼
test_suite_type
       │
       ├── all
       ├── smoke
       ├── api
       ├── ui
       └── regression
              │
              ▼
        npm test command
              │
              ▼
       Docker container
```

This allows developers to execute only the required suite without modifying the workflow itself.

---

# 🔄 Execution Modes

The framework supports multiple execution environments.

## Local

```text
Developer Machine
      │
      ▼
npm test
      │
      ▼
Playwright
```

---

## Docker

```text
Developer Machine
      │
      ▼
docker build
      │
      ▼
Playwright Image
      │
      ▼
docker run
      │
      ▼
npm test
```

---

## Kubernetes

```text
Minikube / Kubernetes
       │
       ▼
     Job
       │
       ▼
      Pod
       │
       ▼
Playwright Container
       │
       ▼
    npm test
```

---

## GitHub Actions

```text
GitHub
  │
  ▼
GitHub Actions Runner
  │
  ▼
Docker Build
  │
  ▼
Docker Container
  │
  ▼
Playwright
  │
  ▼
Reports
  │
  ▼
GitHub Artifacts
```

---

# 🧹 Resource Lifecycle

The framework explicitly manages important resources.

### API Request Context

```text
Create
  ↓
Use
  ↓
Dispose
```

Worker-scoped fixtures use `finally` to ensure resources are released.

### Browser Context

```text
Create
  ↓
Inject authentication
  ↓
Create Page
  ↓
Test
  ↓
Close Context
```

This prevents unnecessary resource leakage during parallel execution.

---

# 🧱 Design Principles

The framework follows several important automation design principles.

### Separation of concerns

```text
Tests
  ↓
Fixtures
  ↓
Page Objects / API Clients
  ↓
Application
```

Each layer has a specific responsibility.

---

### Reusability

Common functionality is centralized:

```text
Authentication
API requests
Page interactions
Test data
Assertions
Configuration
```

---

### Type safety

TypeScript is used throughout the framework with:

```text
strict: true
```

Request payloads and internal models are strongly typed.

---

### Runtime validation

External API responses are validated using Zod.

```text
External data
     ↓
Zod
     ↓
Trusted application data
```

---

### Test isolation

Worker-scoped users and test-scoped browser contexts provide isolation for parallel execution.

---

### Environment independence

The framework does not require source-code changes when switching environments.

---

### Containerized execution

Docker provides a reproducible browser and Node.js environment.

---

# 🛠️ Technology Stack

| Technology     | Purpose                                      |
| -------------- | -------------------------------------------- |
| TypeScript     | Programming language and static typing       |
| Playwright     | UI and API automation                        |
| Zod            | Runtime API contract validation              |
| Node.js        | Runtime                                      |
| npm            | Dependency management                        |
| Docker         | Containerized execution                      |
| Kubernetes     | Container orchestration / test Jobs          |
| Minikube       | Local Kubernetes environment                 |
| Podman         | Local container engine for Minikube workflow |
| GitHub Actions | CI automation                                |
| Git            | Version control                              |

---

# ▶️ Running Locally

Install dependencies:

```bash
npm ci
```

Run the complete suite:

```bash
npm test
```

Run a specific suite using the project's npm scripts:

```bash
npm run test:smoke
npm run test:api
npm run test:ui
npm run test:regression
```

View the Playwright report:

```bash
npx playwright show-report
```

---

# 🐳 Running with Docker

Build the image:

```bash
docker build -t playwright-ui-api-framework:latest .
```

Run the tests:

```bash
docker run --rm \
  -e UI_BASE_URL=https://eventhub.rahulshettyacademy.com \
  -e API_BASE_URL=https://api.eventhub.rahulshettyacademy.com/api/ \
  playwright-ui-api-framework:latest
```

Reports can be mounted back to the host:

```bash
docker run --rm \
  -e UI_BASE_URL=https://eventhub.rahulshettyacademy.com \
  -e API_BASE_URL=https://api.eventhub.rahulshettyacademy.com/api/ \
  -v "${PWD}/playwright-report:/app/playwright-report" \
  -v "${PWD}/test-results:/app/test-results" \
  playwright-ui-api-framework:latest
```

---

# ☸️ Running with Minikube

The local Kubernetes workflow uses the container image built locally.

After building the image, load it into Minikube:

```bash
minikube image load localhost/playwright-ui-api-framework:latest
```

Verify:

```bash
minikube image ls
```

Apply the ConfigMap:

```bash
kubectl apply -f k8s/configmap.yaml
```

Run the test Job:

```bash
kubectl apply -f k8s/job.yaml
```

Check the Job:

```bash
kubectl get jobs
```

Check the Pod:

```bash
kubectl get pods
```

View test output:

```bash
kubectl logs <pod-name>
```

---

# 🔁 CI/CD Evolution

The current architecture supports the following progression:

```text
Phase 1
Local Playwright
      ↓
Phase 2
Docker
      ↓
Phase 3
Kubernetes Job
      ↓
Phase 4
GitHub Actions
      ↓
Future
Container Registry
      ↓
Remote Kubernetes Cluster
```

The current GitHub Actions implementation runs the Playwright Docker container directly.

A future enhancement could connect:

```text
GitHub Actions
      ↓
Build Image
      ↓
Container Registry
      ↓
Kubernetes Cluster
      ↓
Playwright Job
      ↓
Test Results
```

---

# 📈 Scalability

The framework is designed with larger test suites in mind.

For a suite containing hundreds or thousands of tests, the architecture provides:

* Worker-level authentication
* Test-level browser isolation
* Reusable fixtures
* Centralized API clients
* Centralized page objects
* Dynamic test-data generation
* Runtime API validation
* Parallel execution
* CI retries
* Automated diagnostics
* Containerized execution

The framework can therefore grow without requiring every test to implement its own setup and infrastructure.

---

# 🧠 Architecture Summary

The core philosophy of the framework is:

```text
                    TEST
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       UI Flow              API Flow
          │                     │
          ▼                     ▼
    Page Objects            API Clients
          │                     │
          │                     ▼
          │                Zod Schemas
          │                     │
          └──────────┬──────────┘
                     ▼
                  Fixtures
                     │
                     ▼
              Test Infrastructure
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        Local      Docker   Kubernetes
                                │
                                ▼
                         GitHub Actions
```

The framework separates **test intent, UI interaction, API communication, data generation, configuration, validation, and infrastructure**, making it easier to maintain and scale as the automation suite grows.

---

# 👨‍💻 Key Engineering Decisions

| Decision                     | Reason                                                               |
| ---------------------------- | -------------------------------------------------------------------- |
| Playwright fixtures          | Centralized reusable setup and lifecycle management                  |
| Worker-scoped authentication | Avoid unnecessary registration per test and isolate parallel workers |
| Test-scoped browser contexts | Prevent browser state leakage between tests                          |
| Page Object Model            | Encapsulate UI locators and interactions                             |
| API client classes           | Encapsulate HTTP implementation                                      |
| Zod schemas                  | Runtime validation of external API contracts                         |
| TypeScript interfaces        | Compile-time type safety                                             |
| `ApiResult<T>`               | Expose both HTTP response and validated response                     |
| Environment configuration    | Avoid hardcoded environment-specific values                          |
| Docker                       | Reproducible execution environment                                   |
| Kubernetes Job               | Appropriate workload model for finite test execution                 |
| GitHub Actions               | Automated CI execution and artifact publishing                       |
| Playwright retries           | Handle transient CI failures without Kubernetes-level retries        |

---

# 📌 Future Enhancements

Potential future improvements include:

* Container registry integration
* Remote Kubernetes execution from GitHub Actions
* Kubernetes-based CI test execution
* Parallel test sharding
* Allure reporting
* API request/response logging abstraction
* Centralized test-data builders
* Secret management through GitHub/Kubernetes secrets
* Multi-browser CI execution
* Environment-specific configuration files
* Scheduled nightly regression execution
* Test result notifications

---

## ⭐ Project Highlights

This project demonstrates practical experience with:

**Playwright + TypeScript + UI Automation + API Automation + Zod + Fixtures + Parallel Execution + Docker + Kubernetes + Minikube + GitHub Actions + CI Reporting**

The framework is designed around **maintainability, type safety, test isolation, reusable abstractions, and reproducible execution environments** rather than simply creating individual automated tests.
