// polyfills.js
window.global = window;

import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;
