import './newtab.css'
import "monaco-editor/esm/vs/editor/editor.all.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TextlintWorker from "./textlint-worker?worker";

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

const editor = monaco.editor.create(
  document.querySelector<HTMLDivElement>("#editor")!,
  {
    fontSize: 18,
    language: "markdown",
    lineHeight: 1.6,
    minimap: { enabled: false },
    padding: { bottom: 16, top: 16 },
    theme: "vs-dark",
  }
);

const textlintWorker = new TextlintWorker();

textlintWorker.onmessage = function (event) {
  if (event.data.command !== "lint:result") {
    return;
  }

  console.log(event);
};

editor.onDidChangeModelContent(() => {
  textlintWorker.postMessage({
    command: "lint",
    text: editor.getValue(),
    ext: ".md",
  });
});
