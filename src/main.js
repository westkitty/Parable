const runtimeParts = Array.from({ length: 12 }, (_, index) => {
  const part = String(index + 1).padStart(2, "0");
  return `./runtime/main.part${part}.js.txt`;
});

async function bootParable() {
  const chunks = await Promise.all(runtimeParts.map(async (path) => {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load Parable runtime chunk ${path}: HTTP ${response.status}`);
    }
    return response.text();
  }));

  const source = chunks.join("\n");
  const moduleUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
  try {
    await import(moduleUrl);
  } finally {
    URL.revokeObjectURL(moduleUrl);
  }
}

bootParable().catch((error) => {
  console.error("Parable failed to boot", error);
  const warning = document.getElementById("module-load-warning");
  if (warning) {
    warning.hidden = false;
    warning.textContent = `Parable failed to load: ${error.message}`;
  }
});
