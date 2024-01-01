import './newtab.css'
import * as monaco from "monaco-editor";

const editorElement = document.querySelector<HTMLDivElement>("#editor")!;
monaco.editor.create(editorElement, {
  fontSize: 18,
  language: "markdown",
  lineHeight: 1.6,
  minimap: { enabled: false },
  padding: { bottom: 16, top: 16 },
  theme: "vs-dark",
});
