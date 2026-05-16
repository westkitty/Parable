const runtimeParts = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return new URL(`./runtime/main.part${number}.js.txt`, import.meta.url);
});

const responses = await Promise.all(runtimeParts.map((url) => fetch(url)));
const missing = responses.find((response) => !response.ok);

if (missing) {
  throw new Error(`Parable runtime chunk failed to load: ${missing.url}`);
}

const source = (await Promise.all(responses.map((response) => response.text()))).join("");
const runtimeUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));

try {
  await import(runtimeUrl);
} finally {
  URL.revokeObjectURL(runtimeUrl);
}
