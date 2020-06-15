process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}`;
const wkhtmltopdf = require("./utils/wkhtmltopdf");
const errorUtil = require("./utils/error");
const s3 = require("./utils/s3");

// Returns a promise to upload a pdf version of an html doc from a specific bucket
function convertToPdf(bucketName, key) {
    return s3.getObject(bucketName, key)
        .then(htmlDoc => {
            const htmlUtf8 = htmlDoc.Body.toString("utf8");
            return wkhtmltopdf(htmlUtf8);
        }).then(pdfBuffer => {
            const pdfKey = `${s3.removeExtension(key)}.pdf`;
            return s3.uploadPdf(bucketName, pdfKey, pdfBuffer);
        });
}

exports.handler = async (event, _) => {
    // Make sure we got the goods to continue
    if (!event.Records || event.Records.length === 0) {
        console.error("No records found, bailing");
        return errorUtil.createErrorResponse(400, "Validation error: Missing s3 records");
    }

    // In reality this should only have one record object
    // ... but it feels wrong to handle just the first record
    const pdfPromises = [];
    for (const record of event.Records) {
        const bucketName = s3.getBucketNameFrom(record);
        const key = s3.getKeyFrom(record);

        if (!bucketName || !key) {
            console.error("bucket or object key missing, skipping");
            continue;
        }
        pdfPromises.push(convertToPdf(bucketName, key));
    }

    await Promise.all(pdfPromises);
    // Todo I am not entirely sure what we should return here
    // Since this is invoked from an s3 event rather than something like an http response.
    return `[OK] Converted ${pdfPromises.length} html files to pdf`;
};