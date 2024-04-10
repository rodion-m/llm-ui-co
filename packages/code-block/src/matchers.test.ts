import { describe, expect, it } from "vitest";
import { MaybeLLMOutputMatch } from "../../react/src/components/LLMOutput/types";
import {
  codeBlockCompleteMatcher,
  codeBlockPartialMatcher,
  regexMatcher,
} from "./matchers";
import { CodeBlockOptions } from "./options";

describe("regexMatcher", () => {
  const testCases = [
    {
      input: "hello",
      regex: /hello/,
      expected: {
        startIndex: 0,
        endIndex: 5,
        outputRaw: "hello",
      },
    },
    {
      input: "abc hello",
      regex: /hello/,
      expected: {
        startIndex: 4,
        endIndex: 9,
        outputRaw: "hello",
      },
    },
    {
      input: "abc hello def",
      regex: /hello/,
      expected: {
        startIndex: 4,
        endIndex: 9,
        outputRaw: "hello",
      },
    },
    {
      input: "abc yellow def",
      regex: /hello/,
      expected: undefined,
    },
  ];

  testCases.forEach(({ input, regex, expected }) => {
    it(`should match ${input} with ${regex}`, () => {
      const result = regexMatcher(regex)(input);
      expect(result).toEqual(expected);
    });
  });
});

type TestCase = {
  name: string;
  input: string;
  expected: MaybeLLMOutputMatch;
  options?: CodeBlockOptions;
};
describe("matchCompleteMarkdownCodeBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single loc",
      input: "```\nhello\n```",
      expected: {
        startIndex: 0,
        endIndex: 13,
        outputRaw: "```\nhello\n```",
      },
    },
    {
      name: "single loc, other text before",
      input: "abc ```\nhello\n```",
      expected: {
        startIndex: 4,
        endIndex: 17,
        outputRaw: "```\nhello\n```",
      },
    },
    {
      name: "single loc, other text before and after",
      input: "abc ```\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 17,
        outputRaw: "```\nhello\n```",
      },
    },
    {
      name: "single loc with language",
      input: "abc ```typescript\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 27,
        outputRaw: "```typescript\nhello\n```",
      },
    },
    {
      name: "single loc with language and meta",
      input: "abc ```typescript meta\nhello\n``` def",
      expected: {
        startIndex: 4,
        endIndex: 32,
        outputRaw: "```typescript meta\nhello\n```",
      },
    },
    {
      name: "not a code block",
      input: "abc def hij",
      expected: undefined,
    },
    {
      name: "custom startEndChars",
      input: "abc ~~~\nhello\n~~~ def",
      expected: {
        startIndex: 4,
        endIndex: 17,
        outputRaw: "~~~\nhello\n~~~",
      },
      options: { startEndChars: ["~", "`"] },
    },
    {
      name: "single line start and end (not valid block)",
      input: "```hello```",
      expected: undefined,
    },
    {
      name: "2 line code block (not valid block) 1",
      input: "```hello\n```",
      expected: undefined,
    },
    {
      name: "2 line code block (not valid block) 2",
      input: "```\nhello```",
      expected: undefined,
    },
    {
      name: "another code block starts",
      input: "```\nhello\n```\nhello\n```\nworld",
      expected: {
        startIndex: 0,
        endIndex: 13,
        outputRaw: "```\nhello\n```",
      },
    },
    {
      name: "2 code blocks only matches first codeblock",
      input: "```\nhello\n```\nhello\n```\nworld\n```",
      expected: {
        startIndex: 0,
        endIndex: 13,
        outputRaw: "```\nhello\n```",
      },
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = codeBlockCompleteMatcher(options)(input);
      expect(result).toEqual(expected);
    });
  });
});

describe("matchPartialMarkdownCodeBlock", () => {
  const testCases: TestCase[] = [
    {
      name: "single loc",
      input: "```\nhello",
      expected: {
        startIndex: 0,
        endIndex: 9,
        outputRaw: "```\nhello",
      },
    },
    {
      name: "nearly finished block",
      input: "abc ```\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 16,
        outputRaw: "```\nhello\n``",
      },
    },
    {
      name: "nearly finished block with language",
      input: "abc ```typescript\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 26,
        outputRaw: "```typescript\nhello\n``",
      },
    },
    {
      name: "nearly finished block with language and meta",
      input: "abc ```typescript meta\nhello\n``",
      expected: {
        startIndex: 4,
        endIndex: 31,
        outputRaw: "```typescript meta\nhello\n``",
      },
    },
    {
      name: "not a code block",
      input: "abc def hij",
      expected: undefined,
    },
    {
      name: "single line start (not valid block)",
      input: "```hello",
      expected: {
        endIndex: 8,
        outputRaw: "```hello",
        startIndex: 0,
      },
    },
    {
      name: "custom startEndChars",
      input: "abc ~~~\nhello",
      expected: {
        startIndex: 4,
        endIndex: 13,
        outputRaw: "~~~\nhello",
      },
      options: { startEndChars: ["~", "`"] },
    },
    {
      name: "started block",
      input: "`",
      expected: {
        startIndex: 0,
        endIndex: 1,
        outputRaw: "`",
      },
    },
    {
      name: "started block 2 chars",
      input: "``",
      expected: {
        startIndex: 0,
        endIndex: 2,
        outputRaw: "``",
      },
    },
    {
      name: "started block 3 chars",
      input: "```",
      expected: {
        startIndex: 0,
        endIndex: 3,
        outputRaw: "```",
      },
    },
    {
      name: "started block that turned out to not be a block",
      input: "`something",
      expected: undefined,
    },
  ];

  testCases.forEach(({ name, input, expected, options }) => {
    it(name, () => {
      const result = codeBlockPartialMatcher(options)(input);
      expect(result).toEqual(expected);
    });
  });
});
