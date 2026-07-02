# AWS — Niyam Rules

## Core Principles

1. **Least privilege always.** Every IAM role, policy, and resource permission starts with zero access and adds only what's needed.
2. **Infrastructure as Code.** All resources defined in CDK, Terraform, or SAM. No manual console changes in production.
3. **Design for failure.** Every service will fail. Use retries, circuit breakers, DLQs, and multi-AZ by default.
4. **Cost-aware from day one.** Set budgets, use right-sized resources, and prefer serverless for variable workloads.
5. **Observability is mandatory.** Every service emits structured logs, metrics, and traces from the start.

## File Structure & Organization (CDK)

```
infra/
  bin/app.ts              # CDK app entry point
  lib/
    stacks/
      api-stack.ts        # API Gateway + Lambda stack
      data-stack.ts       # DynamoDB + S3 stack
      monitoring-stack.ts # CloudWatch alarms + dashboards
  cdk.json
  tsconfig.json
src/
  handlers/               # Lambda function handlers
    get-user.ts
    create-order.ts
  shared/                 # Shared utilities across handlers
```

- One stack per logical boundary (API, data, auth, monitoring).
- Keep Lambda handlers thin — business logic in a separate layer.
- Use shared layers or packages for common code across Lambdas.

## Lambda

- Keep handlers focused: parse input, call business logic, format output.
- Set memory based on profiling — more memory = more CPU = often faster and cheaper.
- Set timeout to the minimum needed. Default 3s for APIs, longer for async processing.
- Use environment variables for configuration. Never hardcode ARNs or endpoints.
- Use Powertools for structured logging, tracing, and metrics.
- Minimize cold starts: keep packages small, use tree-shaking, avoid heavy SDKs.
- Use Lambda layers for shared dependencies, not for application code.

```typescript
import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';

const logger = new Logger({ serviceName: 'user-service' });
const tracer = new Tracer({ serviceName: 'user-service' });

export const handler = async (event: APIGatewayProxyEvent) => {
  logger.info('Processing request', { path: event.path });
  const result = await userService.getUser(event.pathParameters?.id);
  return { statusCode: 200, body: JSON.stringify(result) };
};
```

## DynamoDB

- Design access patterns first, schema second. Use single-table design only when justified.
- Define GSIs for each additional access pattern. Avoid scans in production.
- Use composite sort keys for hierarchical data: `ORG#123#USER#456`.
- Set TTL on ephemeral data (sessions, caches, logs).
- Use DynamoDB Streams + Lambda for event-driven reactions to data changes.
- Use `ExpressionAttributeNames` and `ExpressionAttributeValues` for all queries — never string-build expressions.
- Enable point-in-time recovery for critical tables.

## S3

- Enable versioning for important buckets. Enable lifecycle rules to manage costs.
- Block all public access unless explicitly needed (static hosting, public assets).
- Use presigned URLs for temporary access — never expose bucket policies to clients.
- Enable server-side encryption (SSE-S3 or SSE-KMS) on all buckets.
- Use intelligent tiering or lifecycle transitions for infrequently accessed data.
- Set CORS only on buckets that need browser access.

## CDK / Terraform

- Use constructs/modules to encapsulate reusable patterns.
- Tag all resources with: `environment`, `service`, `team`, `cost-center`.
- Use `RemovalPolicy.RETAIN` for databases and stateful resources.
- Enable termination protection on production stacks.
- Use CDK `Aspects` for compliance rules (encryption, tagging).
- Store state (Terraform) in S3 + DynamoDB lock. Never local state in production.
- Review `cdk diff` / `terraform plan` before every deployment.

## IAM

- Never use `*` in resource ARNs for production policies.
- Use service-linked roles where available. Create custom roles for Lambdas.
- Prefer identity-based policies over resource-based when possible.
- Use conditions: `aws:SourceArn`, `aws:PrincipalOrgID`, IP restrictions.
- Separate read and write policies. Compose roles from fine-grained policies.
- Review IAM Access Analyzer findings. Remove unused permissions regularly.

## CloudWatch & Observability

- Use structured JSON logs. Include correlation IDs, request IDs, and user context.
- Create alarms for: error rates, latency p99, throttling, DLQ message count.
- Use CloudWatch Insights for log queries. Use Contributor Insights for top-N analysis.
- Set up X-Ray tracing across Lambda, API Gateway, and downstream services.
- Create dashboards per service with key metrics visible at a glance.
- Use composite alarms to reduce noise from transient issues.

## Anti-Patterns (Never Do)

- Never hardcode AWS credentials in code. Use IAM roles and environment-provided credentials.
- Never use `AdministratorAccess` for application roles.
- Never deploy infrastructure manually in production — always IaC.
- Never use `SELECT *` scans on DynamoDB tables. Always query with keys.
- Never set Lambda timeout to 15 minutes "just in case."
- Never ignore CloudWatch alarms. An alarm that fires without action is noise.
- Never store state in Lambda `/tmp` between invocations — it's not guaranteed.
- Never expose internal error details in API responses to clients.

## Cost Optimization

- Use Savings Plans or Reserved Instances for predictable workloads.
- Use Spot instances for fault-tolerant batch processing.
- Set S3 lifecycle policies to transition cold data to Glacier.
- Use DynamoDB on-demand for spiky workloads, provisioned for steady.
- Set Lambda memory based on actual profiling, not guessing.
- Enable Cost Explorer and set billing alarms at 50%, 80%, 100% of budget.
- Review unused resources monthly: idle NAT gateways, unattached EBS, stale snapshots.
