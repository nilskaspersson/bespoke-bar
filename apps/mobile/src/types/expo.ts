// Mirrors the gitignored expo-env.d.ts, which CI never has: without it
// NodeJS.ProcessEnv loses its string index and every process.env read in
// @bespoke/api degrades to `any`. Deliberately .ts, not .d.ts — skipLibCheck
// swallows a broken reference in a .d.ts without a word.
/// <reference types="expo/types" />
