export async function copy(text: string) {
  const os = Deno.build.os;

  let cmd: string[];

  if (os === "darwin") {
    cmd = ["pbcopy"];
  } else if (os === "linux" || os === "freebsd") {
    cmd = ["xclip", "-selection", "clipboard", "-i"];
  } else if (os === "windows") {
    cmd = ["powershell", "-Command", "Set-Clipboard"];
  } else {
    throw new Error(`Unsupported operating system: ${os}`);
  }

  const process = Deno.run({ cmd, stdin: "piped" });
  process.stdin.write(new TextEncoder().encode(text));
  process.stdin.close();

  const status = await process.status();

  process.close();

  if (!status.success) throw new Error(`Failed to copy text to clipboard.`);
}

export async function paste() {
  const os = Deno.build.os;

  let cmd: string[];

  if (os === "darwin") {
    cmd = ["pbpaste"];
  } else if (os === "linux" || os === "freebsd") {
    cmd = ["xclip", "-selection", "clipboard", "-o"];
  } else if (os === "windows") {
    cmd = ["powershell", "-Command", "Get-Clipboard"];
  } else {
    throw new Error(`Unsupported operating system: ${os}`);
  }

  const process = Deno.run({ cmd, stdout: "piped" });
  const output = await process.output();

  process.close();

  return new TextDecoder().decode(output);
}
