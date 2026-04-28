Staging area for inbound client work before it is merged into **`public/`** and **`src/constants/`**.

See the full playbook (atomic steps): **[`documentation/upload-new-work.md`](../documentation/upload-new-work.md)**.

**`upload-batch.txt`** lists `SomeFile.mp4` basenames (those files must live under **`public/videos/`**) for selective R2 upload:

```bash
set -a && source .env && set +a
node scripts/upload-to-r2.js --list=newWork/upload-batch.txt
```
