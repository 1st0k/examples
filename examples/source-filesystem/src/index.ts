import path from 'path';
import { createFilesystemSource } from '@istok/source-filesystem';

export async function main() {
  const source = createFilesystemSource({
    root: path.resolve(process.cwd(), './data'),
  });

  const resources = await source.getList();

  console.log(resources);
}
