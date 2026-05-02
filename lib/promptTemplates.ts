export const SCAFFOLD_ASSET_PROMPT_RULES = `
This image is a production asset for a web publishing system.
It must prioritize clarity, readability, and consistency.
It should not attempt to be stylistically expressive or experimental.
Avoid visual complexity that reduces usability at small sizes.
`;

export const withScaffoldRules = (prompt: string) =>
  `${SCAFFOLD_ASSET_PROMPT_RULES.trim()}\n\n${prompt.trim()}`;
