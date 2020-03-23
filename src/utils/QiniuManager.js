const qiniu = require("qiniu");

class QiniuManager {
  constructor(accessKey, secretKey, bucket) {
    // generate mac
    this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    this.bucket = bucket;
    // init config class
    this.config = new qiniu.conf.Config();
    // 空间对应的机房
    this.config.zone = qiniu.zone.Zone_z0;
    this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
  }
  // 上传文件
  uploadFile(key, localFilePath) {
    // generate uploadToken
    const options = {
      scope: this.bucket + ":" + key
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(this.mac);
    const formUploader = new qiniu.form_up.FormUploader(this.config);
    const putExtra = new qiniu.form_up.PutExtra();
    return new Promise((resolve, reject) => {
      formUploader.putFile(uploadToken, key, localFilePath, putExtra, this._handleCallback(resolve, reject));
    })  
  }
  // 删除文件
  deleteFile(key) {
    return new Promise((resolve, reject) => {
      this.bucketManager.delete(this.bucket, key, this._handleCallback(resolve, reject))
    });
  }
  getBucketDomain() {
    const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
    const digest = qiniu.util.generateAccessToken(this.mac, reqURL);
    console.log('trigger here')
    return new Promise((resolve, reject) => {
      qiniu.rpc.postWithoutForm(reqURL, digest, this._handleCallback(resolve, reject));
    })
  }
  generateDownloadLink(key) {
    const domainPromise = this.publicBucketDomain ? 
    Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
    return domainPromise.then(data => {
      if(Array.isArray(data) && data.length > 0) {
        const pattern = /^https?/
        this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
        return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
      } else {
        throw Error('域名未找到，请查看存储空间是否已经过期');
      }
    }) 
  }
  _handleCallback(resolve, reject) {
    return (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode === 200) {
        resolve(respBody);
      } else {
        reject({
          statusCode: respInfo.statusCode,
          body: respBody
        });
      }
    };
  }
}

module.exports = QiniuManager;
