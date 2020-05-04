/*
 * This module is a custom wrapper around AWS S3 to provide
 * a promise based interface, rather than the built in callback based
 * solution.
 */

const AWS = require("aws-sdk");

const s3 = {};
s3.aws = new AWS.S3();

/*
 * Used to lop of .html from pages so we can append .pdf to the new
 * key
 */
s3.removeExtension = function (filename) {
    const lastDotPosition = filename.lastIndexOf(".");
    if (lastDotPosition === -1) {
        return filename;
    }

    return filename.substr(0, lastDotPosition);
};

/*
 * Two utility classes for manipulating s3 buckets / keys
 */
s3.getBucketNameFrom = function (record) {
    return record.s3.bucket.name;
};

s3.getKeyFrom = function (record) {
    return decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
};

/*
 * Get an object from s3
 */
s3.getObject = function (bucket, key) {
    return new Promise(((resolve, reject) => {
        const params = {
            Bucket: bucket,
            Key: key
        };

        this.aws.getObject(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    }));
};

s3.uploadPdf = function (bucket, key, buffer) {
    return new Promise(((resolve, reject) => {
        const pdfParams = {
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: "application/pdf"
        };
        this.aws.putObject(pdfParams, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    }));
};

// Export the damn thing
module.exports = s3;