import "./newtab.css";
import "monaco-editor/esm/vs/editor/editor.all.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TextlintWorker from "./textlint-worker?worker";
import { TextlintResult } from "@textlint/types";

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
  },
);

type TextlintWorkerMessage = {
  data: {
    command: string;
    result: TextlintResult;
  };
};

const textlintWorker = new TextlintWorker();

textlintWorker.onmessage = function (event: TextlintWorkerMessage) {
  switch (event.data.command) {
    case "init": {
      textlintWorker.postMessage({
        command: "merge-config",
        textlintrc: {
          rules: {
            "preset-japanese": {
              // TODO
            },
          },
        },
      });
      break;
    }
    case "lint:result": {
      const editorModel = editor.getModel();
      if (!editorModel) {
        break;
      }
      monaco.editor.setModelMarkers(
        editorModel,
        "textlint",
        event.data.result.messages.map((message) => {
          return {
            severity: monaco.MarkerSeverity.Warning,
            message: message.message,
            startLineNumber: message.loc.start.line,
            startColumn: message.loc.start.column,
            endLineNumber: message.loc.end.line,
            endColumn: editorModel.getLineLength(message.loc.end.line) + 1,
          };
        }),
      );
      break;
    }
  }
};

editor.onDidChangeModelContent(() => {
  textlintWorker.postMessage({
    command: "lint",
    text: editor.getValue(),
    ext: ".md",
  });
});
