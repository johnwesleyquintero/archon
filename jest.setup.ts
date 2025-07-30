// @ts-nocheck
import "@testing-library/jest-dom";
import * as React from "react";
import { TextEncoder, TextDecoder } from "util"; // Node.js 'util' module for polyfill

// Mock ResizeObserver
global.ResizeObserver = require("resize-observer-polyfill");

// Polyfill TextEncoder and TextDecoder for Jest JSDOM environment
// These are global APIs expected in browser/Node.js environments but missing in JSDOM by default.
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill Web APIs for Jest JSDOM environment
// These are global APIs expected in browser environments but missing in JSDOM by default.
// They are often used by Next.js and other libraries.
if (typeof globalThis.Request === "undefined") {
  globalThis.Request = require("node-fetch").Request;
}
if (typeof globalThis.Response === "undefined") {
  globalThis.Response = require("node-fetch").Response;
}
if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = require("node-fetch").Headers;
}
if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = require("form-data");
}

// Mock React.act for @testing-library/react-hooks compatibility with React 19
// This ensures that act from React is used, addressing the deprecation warning.
// This might not be strictly necessary after removing @testing-library/react-hooks,
// but it's good practice to ensure act is correctly handled globally.
global.IS_REACT_ACT_ENVIRONMENT = true;
global.act = React.act;
