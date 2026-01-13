# ReviewDocuments2

## Scope
- Requirements document (kaki)
- Design document (kaki)

## Decisions captured
- thread_ts missing -> reply with error and skip processing
- /notify auth -> local shared token via env var; bind to localhost
- Slack command permissions -> no restriction for MVP

## Open issues to reflect in docs
- Slash command handling path and Slack app scopes
- /notify auth details (header + validation)
- Bot self-message exclusion
- Hook interface mismatch (CLI vs HTTP)
- Instruction output path duplication
- event_id source for idempotency
- Latency requirement vs file-based injection
- Relay offline message loss handling

## Next updates
- Update requirements and design to reflect decisions
- Add missing Slack command and security details
