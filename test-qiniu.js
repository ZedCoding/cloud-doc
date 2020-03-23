const qiniu = require("qiniu");
const QiniuManager = require("./src/utils/QiniuManager");

// const accessKey = "T4Up3GDu4Xxd9lef4Gq6krCUlr_VNVxd8Pdn8IRJ";
// const secretKey = "ALi5zf8csejZsHFRlyJE3lKQs8VDx4D1-l0XfR5K";
const accessKey = "uJdbhGnfzZeCmW15JLSnVyqbVYKqvtDk2jLs2mc0";
const secretKey = "C8-gNPipd4nsoYwy49QgjFlwRiJDioDW0oX-o_s-";
const localFile = "/Users/Administrator/Desktop/1.md";
const key = "1.md";

const manager = new QiniuManager(accessKey, secretKey, "clouddoc");
// manager
//   .uploadFile(key, localFile)
//   .then(data => {
//     console.log("上传成功",data);
//     return manager.deleteFile(key);
//   })
//   .then(data => {
//     console.log('删除成功', data);
//   })
//   .catch(err => {
//     console.log(err)
//   })

// manager.generateDownloadLink(key).then(data => {
//   console.log(data);
//   return manager.generateDownloadLink('first.md');
// }).then(data => {
//   console.log(data)
// })

// const publicBucketDomain = 'http://pv8m1mqyk.bkt.clouddn.com';  