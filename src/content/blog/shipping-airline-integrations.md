---
title: 'Shipping airline integrations at Kayak'
description: 'Six endpoints, JUnit, Kibana dashboards, and the discipline of staged rollouts.'
pubDate: 2026-04-12
tags: ['java', 'apis', 'kayak', 'observability']
heroEmoji: '✈️'
---

Booking a flight on Kayak looks like a single click. Behind that click are six
endpoints any new airline provider has to satisfy:

1. **Search** — fares and routes for a date pair.
2. **Availability** — is this fare actually still bookable?
3. **Seat-map** — which seats are open, and what do they cost?
4. **Baggage** — what's included, what's extra.
5. **Booking** — commit the transaction.
6. **Receipt** — confirm and emit the artefacts.

When I joined the team, every new provider integration was a multi-week
JIRA-cycle. We compressed that with three habits:

## 1. Tests come first, written from the spec

For each endpoint I built a **JUnit harness** seeded from the provider's spec
sheet — _before_ writing any client code. The harness encoded both happy paths
and known failure modes (timeouts, partial inventory, fare-class drift).

> If the test suite doesn't fail on the first run, you didn't write enough tests.

## 2. Stage the rollout — always

We ship via **GitHub Actions** into a percentage-based A/B framework. The
defaults look something like:

```yaml
rollout:
  - { percent: 1, soak: 24h }
  - { percent: 10, soak: 48h }
  - { percent: 50, soak: 72h }
  - { percent: 100 }
```

The 1% slice is the most valuable window — it surfaces edge cases that prod
synthetic tests miss, without burning customer trust.

## 3. Kibana is the source of truth

The team's instinct used to be "open the IDE" when something looked off.
We pushed it to "open Kibana." A real-time dashboard with provider × endpoint
× error-class panels reveals patterns nothing else does — bursts at the
top of the minute, correlated 503s from upstream, suspiciously round error
counts that hint at retry storms.

## What I'd do differently

- **Contract tests across providers, not just within one.** A regression in our
  client code can fail one provider and pass three others. We caught that late.
- **Treat the staging soak as sacred.** I once let a deploy roll from 10% to
  50% on a Friday afternoon. Don't.
