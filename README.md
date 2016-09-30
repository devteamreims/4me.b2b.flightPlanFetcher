# 4me.b2b.flightPlanFetcher

Simple nodejs proxy to fetch flight plans from NM B2B platform.

[![build status](https://gitlab.com/devteamreims/4me.b2b.flightPlanFetcher/badges/master/build.svg)](https://gitlab.com/devteamreims/4me.b2b.flightPlanFetcher/commits/master)
[![coverage report](https://gitlab.com/devteamreims/4me.b2b.flightPlanFetcher/badges/master/coverage.svg)](https://gitlab.com/devteamreims/4me.b2b.flightPlanFetcher/commits/master)

## REST API
* GET /history

Returns search history

* GET /search

Returns flight data according to query params
Accepted query params :
  * callsign (string)
  * flightPlanId (string)

## WebSocket API
* refresh_history

Sent to all WebSocket clients when a new request is made
