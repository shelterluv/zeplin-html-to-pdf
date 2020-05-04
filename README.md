# (Shelterluv fork of) Zeplin HTML to PDF Lambda

This is an AWS Lambda function that converts HTML pages created in S3 buckets to PDF documents using wkhtmltopdf (0.12.4).

## How does it work?

This function is invoked through S3 notifications - we tend to use the 'object create event', although it should work for other events.
Upon receiving the notification, it will pull down the referenced s3 object, convert it to a pdf, and stick a pdf file with the same
key back into the bucket.

This function does not handle HTML generation itself, simply the conversion to HTML. For an example of using a pdf specific
Blade template, checkout the [CreateVaccinePdf Job in Adopterluv](https://github.com/shelterluv/adopterluv/blob/develop/app/Jobs/CreateVaccinePdf.php).

## How can I hook it up to my own S3 bucket

**DANGER** Note that this function goes against S3 + Lambda best practices (something we should consider rectifying at some point). 
Specifically, it is normally setup to listen to object created events and creates an object itself. If you are not careful,
this could cause a **massive infinite execution problem, and a rather unexpected AWS bill.**

Hook up your S3 bucket by going to the lambda console, clicking on devZepHtmlToPdf or prodZepHtmlToPdf. On the config page,
click 'Add trigger', which will walk you through the steps for adding an s3 trigger.

Your event configuration should look at lot like the notification-config-example file. Most importantly, **ensure you
have scoped your notifications to .html files** to avoid infinite execution. You might also want to prefix the folder if 
docs are stored globally in a subfolder/key of a bucket.

## Deploying to AWS
There are two ways in which these functions can be deployed to AWS.
The dev function can be used as a test function, if you do not want to setup the local testing. Simply connect your
personal s3 bucket as a trigger on it.

Make sure your environment variables are set specifically FONTCONFIG_PATH=/var/task/fonts

1 (recommended) - Check our `npm run deploy:dev` and `npm run deploy:prod` commands in `package.json` and change it according to your needs. Do not forget to add environment variables (you can find it under `template.yml`) to your lambda function in aws lambda edit page or running [lamba update-function-configuration command](https://docs.aws.amazon.com/cli/latest/reference/lambda/update-function-configuration.html) or ensure you edit the Lambda function directly.

or

2 (untested) - Check out `template.yml` file and edit according to your needs then use `sam deploy`.

## Test in local environment (untested)
The function can be tested locally using [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html). You can change contents of `events/example-event.json` or you can create a new file which you will give sam as an event parameter.

```
sam local invoke "devZepHtmlToPdf" -e events/example-event.json
````

# Future work

* Some sort of build pipeline, currently needs to be deployed from a local computer
* Better logging... we have no way of knowing whether an actually useful pdf is output, just that some sort of pdf output.
* Pipe cloudwatch logs somewhere