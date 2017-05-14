## TODO:
### IMMEDIATE:
  - retry logic helpers
  - tests
  - double-check zipkin traces are to spec
  - getting diagnostics modules to a production ready state

### MEDIUM TERM:
  - linter
  - codecov
  - ci tool
  - thrift integration
  - cookiecutter
  - tutorial
  - docstrings/documentation
  - rabbitmq integration?

## QUESTIONS
  - How do spans fit in with asynchronous work (including queues)?
  - Given that logs are accomplished by capturing stdout, is there a way to
  get colored output?

## QUESTIONS FOR INFRA:
  - Can we read from a json config file in production as opposed to
  setting ENV variables
  - Easier way to deploy a node-baseplate service then what we have now if
  it's standardized?
