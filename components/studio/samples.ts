/** A realistic git log: scopes, a breaking change, PR refs, and housekeeping
 *  commits that the parser should recognise but leave unchecked. */
export const SAMPLE_GITLOG = `a3f91c2 feat(auth): add passkey sign-in backed by WebAuthn (#812)
7d2e4b8 feat(dashboard)!: replace the projects sidebar with a command surface
1c9a7f0 fix(billing): stop double-charging annual plans on a mid-cycle change (#834)
b48e2d1 perf(edge): cache compiled module graphs between invocations
9f31a7c fix(ui): correct the focus ring colour on dark surfaces
5e77b90 style(tokens): retune the spacing scale onto a 4px base grid
4b0d6a2 security: rotate signing keys and shorten session lifetime (#840)
c71a9e5 refactor(api): collapse three list endpoints into one paginated route
2ab6c34 docs: document the type generation flow end to end
0d51f8e chore(deps): bump typescript to 5.6`;

/** Plain notes, the way a designer or PM would actually write them. */
export const SAMPLE_NOTES = `- Redesigned the empty states so they explain what to do next
- You can now filter the activity table by assignee
- Fixed the date picker closing when you clicked inside it
- Tightened contrast on secondary text to meet AA
- Removed support for the legacy /v1 export endpoint
- Made the settings page load about twice as fast`;
