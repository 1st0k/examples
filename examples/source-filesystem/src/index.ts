import path from 'path';
import { createFilesystemSource } from '@istok/source-filesystem';

export async function main() {
  const source = createFilesystemSource({
    root: path.resolve(process.cwd(), './data'),
    exclude: '__meta__',
  });

  const resources = await source.getList();

  console.log(resources);
}
