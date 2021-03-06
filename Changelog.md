# v0.2.1
  * Accept AUTOCOMPLETE_AIRSPACE environment variable (devteamreims/4ME#182)
  * Dispatch invalidIfplId from fetchProfileFromIfplId if keys are invalid (devteamreims/4ME#160)

# v0.2.0
  * Implement workaround state inconsistency (devteamreims/4ME#142)
  * Use 4ME specific base image (devteamreims/4ME#140)

# v0.2.0-1
  * Move to yarn as package manager (devteamreims/4ME#141)
  * Major refactor : reorganized lib/b2b, reorganized state
  * Use B2B V20.0.0
  * Make the whitelist pull more resilient
  * Introduce `MOCK_WHITELIST` env variable as a way to prevent whitelist pull from the B2B

# v0.2.0-0
  * Inject airspaces based on a whitelist (devteamreims/4ME#66)
  * Add a `npm run prepare-whitelist` to pull current ES whitelist from B2B (devteamreims/4ME#66)
  * Specification tests
  * Better airspace extrapolation [#122](devteamreims/4ME#122)

# v0.1.7
  * Use jest for testing
  * Plug in gitlab build pipeline

# v0.1.6
  * Add npm-check script and integrates with gitlab-ci [#115](devteamreims/4ME#115)/[#45](devteamreims/4ME#45)
  * More straightforward release process involving `npm version`

# Version 0.1.5
  * Add Changelog
  * Add version in /status [#91](https://github.com/devteamreims/4ME/issues/91)
  * Add david-dm badge to README
  * Pull airspaceProfile and bundle control centers in pointProfile [#66](https://github.com/devteamreims/4ME/issues/66)
  * Populate autocomplete via airspace and not traffic volume anymore [#87](https://github.com/devteamreims/4ME/issues/87)

# Version 0.1.4
 * Initial version
