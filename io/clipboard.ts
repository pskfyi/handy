export async function copy(text: string) {
  const os = Deno.build.os;

  let cmd: string;
  const args: string[] = [];

  if (os === "darwin") {
    cmd = "pbcopy";
  } else if (os === "linux" || os === "freebsd") {
    cmd = "xclip";
    args.push("-selection", "clipboard", "-i");
  } else if (os === "windows") {
    cmd = "cmd";
    args.push("/c", "clip");
  } else {
    throw new Error(`Unsupported operating system: ${os}`);
  }

  const process = new Deno.Command(cmd, { args, stdin: "piped" }).spawn();

  const writer = process.stdin.getWriter();
  await writer.write(new TextEncoder().encode(text));
  writer.releaseLock();
  await process.stdin.close();

  const status = await process.status;

  if (!status.success) throw new Error(`Failed to copy text to clipboard.`);
}

export async function paste() {
  const os = Deno.build.os;

  let cmd: string;
  const args: string[] = [];

  if (os === "darwin") {
    cmd = "pbpaste";
  } else if (os === "linux" || os === "freebsd") {
    cmd = "xclip";
    args.push("-selection", "clipboard", "-o");
  } else if (os === "windows") {
    cmd = "powershell", args.push("-Command", "Get-Clipboard");
  } else {
    throw new Error(`Unsupported operating system: ${os}`);
  }

  const output = await new Deno.Command(cmd, { args }).output();
  const text = new TextDecoder().decode(output.stdout);

  return os === "windows" ? text.replace(/\r\n$/, "") : text;
}
