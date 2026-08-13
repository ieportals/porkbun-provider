# @ieportals/porkbun-provider

## 1.1.0

### Minor Changes

- Add first-class TXT record support: `createTxtRecord(name, content)` and `deleteTxtRecord(name)`, mirroring the existing CNAME methods. Consumers no longer need to bypass the SDK to write TXT records (e.g. `_vercel` domain-ownership challenges). Note that `deleteTxtRecord` removes all TXT records at a name, since Porkbun deletes by name+type.
