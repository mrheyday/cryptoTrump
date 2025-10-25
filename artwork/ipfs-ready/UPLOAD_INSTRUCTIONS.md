# CryptoTrump IPFS Upload Instructions

## 📦 Files Prepared

Your CryptoTrump artwork and metadata are ready for IPFS upload!

Location: `/home/user/cryptoTrump/artwork/ipfs-ready`

## 🌐 IPFS Upload Options

### Option 1: Pinata (Recommended)

Pinata is a popular IPFS pinning service with a user-friendly interface.

1. **Sign up**: https://pinata.cloud
2. **Upload Images Folder**:
   - Go to "Files" → "Upload" → "Folder"
   - Select `/home/user/cryptoTrump/artwork/ipfs-ready/images`
   - Wait for upload to complete
   - Copy the IPFS CID (starts with `Qm...` or `bafy...`)

3. **Upload Metadata Folder**:
   - Repeat the process for `/home/user/cryptoTrump/artwork/ipfs-ready/metadata`
   - Copy the metadata CID

4. **Update Base URI**:
   - Images CID: `ipfs://YOUR_IMAGES_CID/`
   - Then re-run metadata generation with updated URI

### Option 2: NFT.Storage

NFT.Storage provides free IPFS storage for NFTs.

1. **Sign up**: https://nft.storage
2. **Get API Key**: Account → API Keys → New Key
3. **Upload via CLI**:
   ```bash
   npm install -g @nft-storage/cli
   nft-storage upload /home/user/cryptoTrump/artwork/ipfs-ready/images
   nft-storage upload /home/user/cryptoTrump/artwork/ipfs-ready/metadata
   ```

### Option 3: Web3.Storage

1. **Sign up**: https://web3.storage
2. **Upload Files**:
   - Use web interface or CLI
   - Upload images and metadata folders
   - Get CIDs for both

### Option 4: Local IPFS Node

If you're running a local IPFS node:

```bash
# Add images
ipfs add -r /home/user/cryptoTrump/artwork/ipfs-ready/images

# Add metadata
ipfs add -r /home/user/cryptoTrump/artwork/ipfs-ready/metadata

# Pin the CIDs
ipfs pin add YOUR_IMAGES_CID
ipfs pin add YOUR_METADATA_CID
```

## 📝 After Upload

### 1. Update Metadata with Image CIDs

Once images are uploaded, update the metadata:

```bash
# Edit the metadata generator to use your images CID
# Then regenerate metadata
node scripts/artwork/generateMetadata.js
```

### 2. Update Smart Contract

Update your contract with the base URI:

```javascript
// In your deployment or after deployment
await contract.setBaseURI("ipfs://YOUR_METADATA_CID/");
```

### 3. Verify IPFS Links

Test that your metadata and images are accessible:

- Via IPFS Gateway: `https://ipfs.io/ipfs/YOUR_CID/0.json`
- Via Pinata Gateway: `https://gateway.pinata.cloud/ipfs/YOUR_CID/0.json`
- Via Cloudflare: `https://cloudflare-ipfs.com/ipfs/YOUR_CID/0.json`

## 🔐 Best Practices

1. **Pin on Multiple Services**: Use 2-3 pinning services for redundancy
2. **Keep Records**: Save all CIDs in a secure location
3. **Test Before Deployment**: Verify random metadata files load correctly
4. **Backup**: Keep local copies of all files
5. **Monitor Pinning**: Regularly check that files remain pinned

## 📊 Checklist

- [ ] Upload images to IPFS
- [ ] Save images CID
- [ ] Update metadata generator with images CID
- [ ] Regenerate metadata files
- [ ] Upload metadata to IPFS
- [ ] Save metadata CID
- [ ] Update smart contract base URI
- [ ] Verify random samples load correctly
- [ ] Pin on backup service
- [ ] Document all CIDs securely

## 💡 Tips

- Uploading 10,000 files may take time (30-60 minutes)
- Ensure stable internet connection
- Some services have rate limits - be patient
- CIDs are permanent - verify everything before finalizing
- Consider using a custom subdomain for easier access

## 🆘 Support

If you encounter issues:
- Check service status pages
- Verify file formats are correct
- Ensure folder structure is maintained
- Try a different IPFS gateway
- Contact the pinning service support

---

**Generated**: 2025-10-25T07:16:45.496Z
**Project**: CryptoTrump
**Version**: 1.0.0

🇺🇸 Make NFTs Great Again! 🇺🇸
